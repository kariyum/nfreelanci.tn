<script lang="ts">
	import { browser } from '$app/environment';
	import { CircleUserRound } from 'lucide-svelte';
	import { onDestroy, onMount, untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { WebSocketService, type MessagesJsonResponse } from '$lib/features/notification/socket.js';

	let { data, children } = $props();
	const selectedDiscussion: string | undefined = $derived(page.params.id);
	let titles = $derived.by(() => {
		const result = new Map<number, string>();
		data.discussions?.map((discussion) => {
			const title = discussion.user_ids
				.filter((email) => email != data.user?.email)
				.reduce((userA, userB) => userA + userB, '');
			result.set(discussion.id, title);
		});
		return result;
	});

	let discussionNotif = $state(new SvelteMap<string, number>());
	$effect(() => {
		selectedDiscussion;
		untrack(() => {
			if (selectedDiscussion) {
				discussionNotif.delete(selectedDiscussion);
			}
		});
	});
	let unsubscribe: () => void;

	onMount(async () => {
		if (browser) {
			const websocketInstance = WebSocketService.getInstance();
			unsubscribe = websocketInstance.subscribeToChatMessages((message: MessagesJsonResponse) => {
				if (
					!selectedDiscussion ||
					(selectedDiscussion && message.discussion_id != parseInt(selectedDiscussion))
				) {
					const oldCount = discussionNotif.get(message.discussion_id.toString());
					discussionNotif.set(message.discussion_id.toString(), (oldCount ?? 0) + 1);
				}
			});
		}
		if (data.discussions) {
			const discussions = data.discussions;
			const targetDiscussionUserId = untrack(() => page.url.searchParams.get('user_id'));
			const currentUserId = data.user?.email;
			if (targetDiscussionUserId && currentUserId) {
				const maybeDiscussionId = discussions.find(
					(discussion) =>
						discussion.user_ids.includes(targetDiscussionUserId) &&
						discussion.user_ids.includes(currentUserId) &&
						discussion.user_ids.length === 2
				)?.id;
				if (maybeDiscussionId) {
					await goto(`/messages/${maybeDiscussionId}`, { replaceState: true });
				}
			}
		}
	});

	onDestroy(() => {
		if (browser) {
			unsubscribe();
		}
	});
	let clientHeight = $state(browser ? window.innerHeight.toString() + 'px' : '100vh');
</script>

{#if data.discussions}
	<div class="component" style:--client-height={clientHeight}>
		<div class="container">
			<div class="page-container menu" data-selected={selectedDiscussion != undefined}>
				<div class="header">
					<div>Discussions</div>
				</div>
				<div class="discussions">
					{#each data.discussions as discussion}
						{@const title = discussion.title ?? titles.get(discussion.id)}
						{@const count = discussionNotif.get(discussion.id.toString())}
						<div class="discussion-container">
							<a
								href="/messages/{discussion.id}"
								data-selected={selectedDiscussion === discussion.id.toString()}
							>
								<CircleUserRound />
								{title}
								{#if count}
									<div class="count">
										{count}
									</div>
								{/if}
							</a>
						</div>
					{/each}
				</div>
			</div>
			<div class="messages-col" data-selected={selectedDiscussion != undefined}>
				{@render children()}
			</div>
		</div>
	</div>
{:else}
	<div>Could not fetch discussions</div>
{/if}

<svelte:window
	onresize={() => (clientHeight = browser ? window.innerHeight.toString() + 'px' : '100vh')}
/>

<style>
	.component {
		display: block;
		height: calc(var(--client-height) - 5rem);
	}

	.discussion-container {
		margin-left: 0.5rem;

		.count {
			border-radius: 50%;
			display: flex;
			justify-content: center;
			background-color: var(--vibrant-red);
			width: 1.5rem;
			aspect-ratio: 1;
		}
	}

	.container {
		display: flex;
		width: 100%;
		height: 100%;
	}

	.menu {
		min-width: 33ch;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		view-transition-name: discussion;
	}

	.messages-col {
		flex: 5;
	}

	.header {
		font-size: 1.5rem;
	}

	.header > div {
		font-weight: 500;
	}

	a {
		position: relative;
		gap: 1rem;
		display: flex;
		text-decoration: none;
		background-color: transparent;
		border: 2px solid transparent;
		color: var(--font-color);
		padding: 0.5rem;
		border-radius: 3px 0 0 3px;
	}

	a[data-selected='true'] {
		background-color: var(--selected-color);
	}

	a[data-selected='true']::before {
		content: '';
		position: absolute;
		width: 5px;
		height: 2.2rem;
		border-radius: 10px;
		background-color: var(--blue);
		left: -0.6rem;
		top: 0.15rem;
		view-transition-name: active-page;
	}

	a:hover {
		background-color: var(--hover-color);
	}

	.discussions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	@media (width < 600px) {
		.messages-col[data-selected='false'] {
			display: none !important;
		}

		.menu[data-selected='true'] {
			display: none !important;
		}

		.menu {
			height: fit-content;
			width: 100%;
		}

		.discussion-container {
			margin-left: 0 !important;
		}
	}
</style>
