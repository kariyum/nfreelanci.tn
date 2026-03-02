<script lang="ts">
	import type { Result } from '$lib/utils';
	import type { Snippet } from 'svelte';
	let {
		onclick,
		ondone = () => Promise.resolve(),
		idleView,
		endView,
		loading,
		disableOtherActions = $bindable(false)
	}: Props = $props();

	let waitingForResponse = $state(false);
	let isLoading = $state(false);
	let disabled = $derived(waitingForResponse || disableOtherActions);
	let done = $state(false);
	let responseSuccess = $state(true);

	interface Props {
		onclick: (event: MouseEvent) => Promise<Result<any, any>>;
		ondone?: () => Promise<any>;
		idleView: Snippet;
		loading?: Snippet;
		endView: Snippet;
		disableOtherActions?: boolean;
	}

	$effect(() => {
		disableOtherActions = waitingForResponse;
	});

	async function clickHandler(event: MouseEvent) {
		waitingForResponse = true;
		const spinnerTimeout = setTimeout(() => (isLoading = true), 200);
		const response = await onclick(event);
		responseSuccess = response.isOk();
		if (isLoading) {
			done = true;
		}
		isLoading = false;
		clearTimeout(spinnerTimeout);
		waitingForResponse = false;
		setTimeout(() => (done = false), 1000);
		if (responseSuccess) {
			await ondone();
		}
	}
</script>

<button {disabled} onclick={clickHandler}>
	<div style:visibility={isLoading || done ? 'hidden' : 'visible'}>
		{@render idleView()}
	</div>
	<div class="stack" style:visibility={isLoading ? 'visible' : 'hidden'}>
		{#if loading}
			{@render loading()}
		{:else}
			<span class="loader"></span>
		{/if}
	</div>
	<div class="stack" style:visibility={done ? 'visible' : 'hidden'}>
		{#if responseSuccess}
			{@render endView()}
		{:else}
			<div>Failed!</div>
		{/if}
	</div>
</button>

<style>
	button:disabled {
		cursor: not-allowed;
		opacity: 0.9;
		background-color: var(--color, var(--btn-bg));
	}
	button:disabled:hover {
		background-color: var(--color, var(--btn-bg));
	}
	button {
		display: grid;
		width: var(--width, max-content);
		background-color: var(--color, var(--btn-bg));
	}

	button > div {
		grid-area: 1 / 1;
	}

	button:hover {
		background-color: var(--hover-color);
	}

	.loader {
		width: 0.9rem;
		height: 0.9rem;
		border: 5px dotted #fff;
		display: inline-block;
		position: relative;
		box-sizing: border-box;
		animation: rotation 1.5s linear infinite;
	}

	@keyframes rotation {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
