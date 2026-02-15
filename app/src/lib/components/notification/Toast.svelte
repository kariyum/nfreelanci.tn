<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { ToastInterface } from '../navbar/Navbar.svelte';
	import { untrack } from 'svelte';

	import Progress from './Progress.svelte';
	import { X } from 'lucide-svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import {
		type ProposalNotification,
		ProposalNotificationImpl,
		type NewProposalNotification,
		NewProposalNotificationImpl
	} from '$lib/features/notification/socket';

	const TIMEOUT = 3000;
	let isPaused: boolean = $state(false);
	let pauseStartTimestamp: number | undefined = $state();
	let { toasts = $bindable([]) }: { toasts: ToastInterface[] } = $props();

	let pauseDurations = new SvelteMap<number, number>();
	let timeouts = new SvelteMap<number, number>();
	let startTimes = new SvelteMap<number, number>();
	let previousLength = 0; // used to run the effect only when the a new Toast is pushed in and not when removed

	function renderToast(currentToast: ToastInterface) {
		clearTimeout(timeouts.get(currentToast.id));
		if (!startTimes.get(currentToast.id)) {
			startTimes.set(currentToast.id, performance.now());
		}
		const elapsed =
			performance.now() -
			((startTimes.get(currentToast.id) ?? 0) + (pauseDurations.get(currentToast.id) ?? 0));
		const remaining = Math.max(TIMEOUT - elapsed, 0);
		const timeoutId = setTimeout(() => {
			if (
				startTimes.get(currentToast.id) &&
				performance.now() -
					(startTimes.get(currentToast.id) ?? 0) -
					(pauseDurations.get(currentToast.id) ?? 0) >=
					TIMEOUT
			) {
				removeToast(currentToast);
			} else {
				renderToast(currentToast);
			}
		}, remaining);
		timeouts.set(currentToast.id, timeoutId);
	}

	function removeToast(toast: ToastInterface) {
		pauseDurations.delete(toast.id);
		timeouts.delete(toast.id);
		startTimes.delete(toast.id);
		toast.remove();
	}

	$effect(() => {
		toasts.length; // trigger effect run
		untrack(() => {
			if (previousLength < toasts.length) {
				const tail = toasts.at(-1);
				tail && renderToast(tail);
			}
		});
		previousLength = toasts.length;
	});
</script>

{#snippet renderProposalNotificationToast(notif: ProposalNotification, toast: ToastInterface)}
	<a
		href={ProposalNotificationImpl.getHref(notif)}
		onclick={() => removeToast(toast)}
		class="proposal-notif"
	>
		<div class="link-container">
			<div class="content-container">
				<p>
					{ProposalNotificationImpl.getContent(notif)}
				</p>
				<button
					class="close-btn"
					onclick={(event) => {
						event.preventDefault();
						removeToast(toast);
					}}
				>
					<X size="16" />
				</button>
			</div>
			<div class="progress-container">
				<div class="progress">
					<Progress {isPaused} startTimestamp={startTimes.get(toast.id)} duration={TIMEOUT} />
				</div>
			</div>
		</div>
	</a>
{/snippet}

{#snippet renderNewProposalNotificationToast(notif: NewProposalNotification, toast: ToastInterface)}
	<a
		href={NewProposalNotificationImpl.getHref(notif)}
		onclick={() => removeToast(toast)}
		class="proposal-notif"
	>
		<div class="link-container">
			<div class="content-container">
				<p>
					{NewProposalNotificationImpl.getContent(notif)}
				</p>
				<button
					class="close-btn"
					onclick={(event) => {
						event.preventDefault();
						removeToast(toast);
					}}
				>
					<X size="16" />
				</button>
			</div>
			<div class="progress-container">
				<div class="progress">
					<Progress {isPaused} duration={TIMEOUT} />
				</div>
			</div>
		</div>
	</a>
{/snippet}

<div
	role="banner"
	class="container"
	style:--toasts={toasts.length}
	onmouseenter={() => {
		isPaused = true;
		pauseStartTimestamp = performance.now();
		toasts.forEach((toast) => {
			clearInterval(timeouts.get(toast.id));
		});
	}}
	onmouseleave={() => {
		isPaused = false;
		if (pauseStartTimestamp) {
			toasts.forEach((toast) => {
				if (pauseStartTimestamp && startTimes.get(toast.id)) {
					const duration =
						(pauseDurations.get(toast.id) ?? 0) + performance.now() - pauseStartTimestamp;
					pauseDurations.set(toast.id, duration);
					renderToast(toast);
				}
			});
		}
		pauseStartTimestamp = undefined;
	}}
>
	{#each toasts as toast, i (toast.id)}
		<div
			class="toast toast-style"
			in:fly={{ duration: 400, y: '60', opacity: 0.9 }}
			out:fly={{ duration: 400, y: '20' }}
			style:--n={toasts.length - i}
		>
			{#if toast.notification.notification_type === 'proposal'}
				{@render renderProposalNotificationToast(toast.notification as ProposalNotification, toast)}
			{:else if toast.notification.notification_type === 'new_proposal'}
				{@render renderNewProposalNotificationToast(
					toast.notification as NewProposalNotification,
					toast
				)}
			{:else}
				<div>Which notification to render?</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.container {
		--gap: 0.75rem;
		--hover-offset: 1rem;
		--toast-height: 5.5rem;
		--hidden-offset: 0.75rem;

		--hidden-toasts: calc(var(--toasts) - 1);

		position: fixed;
		right: 0rem;
		bottom: 0rem;
		margin: 1rem;
		width: 20rem;

		display: flex;
		flex-direction: column-reverse;

		&:hover {
			height: calc((var(--toast-height) + var(--gap)) * var(--toasts));
		}

		&:hover .toast {
			scale: 1 !important;
			opacity: 1;
			translate: 0 calc(-1rem + -1 * (var(--n) - 1) * (var(--toast-height) + var(--gap))) !important;

			&:nth-last-child(n + 4) {
				visibility: visible;
			}
		}

		.toast {
			position: absolute;
			bottom: 0;
			right: 0;

			height: var(--toast-height);
			width: 20rem;

			transform-origin: 50% 0%;
			transition:
				translate 350ms ease,
				scale 350ms ease,
				visibility 350ms ease;

			&:nth-last-child(-n + 3) {
				scale: 0.95;
				translate: 0 calc(-2 * var(--hidden-offset));
			}

			&:nth-last-child(-n + 2) {
				scale: 0.975;
				translate: 0 calc(-1 * var(--hidden-offset));
			}

			&:nth-last-child(-n + 1) {
				scale: 1;
				translate: 0;
			}

			&:nth-last-child(n + 4) {
				translate: 0 calc(-1 * var(--hidden-offset));
				scale: 0.95;
				visibility: hidden;
			}
		}

		.toast-style {
			background-color: var(--toast-bg);
			/* padding: 1rem; */
			border-radius: 10px;
			box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
		}
	}

	.progress-container {
		width: 100%;

		.progress {
			margin-left: auto;
			margin-right: 0.5rem;
			width: fit-content;
		}
	}

	.close-btn {
		margin-bottom: auto;
		padding: 0.2rem;
		border-radius: 50%;
		line-height: 0;
		background-color: var(--background-color);
		border: none;
	}

	.content-container {
		display: flex;
		justify-content: space-between;
		gap: 0.2rem;
	}

	.proposal-notif {
		text-decoration: none;
		color: inherit;
	}

	.link-container {
		display: flex;
		padding: 1rem;
		height: 100%;
		gap: 0.5rem;
		flex-direction: column;
		justify-content: space-between;
	}
</style>
