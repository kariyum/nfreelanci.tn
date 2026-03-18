<script lang="ts">
	import type { FetchErr, FetchOk } from '$lib/utils';
	import AsyncButton from './AsyncButton.svelte';

	interface Props {
		onclick: () => Promise<FetchOk<unknown> | FetchErr>;
		ondone?: () => Promise<unknown>;
		disableOtherActions?: boolean;
	}

	let {
		onclick,
		disableOtherActions = $bindable(),
		ondone = () => Promise.resolve()
	}: Props = $props();

	async function handleDelete() {
		return onclick();
	}
</script>

<AsyncButton
	--color="var(--vibrant-red)"
	--width="fit-content"
	--hover-color="var(--vibrant-red-hover)"
	onclick={async () => (await handleDelete()).toResult()}
	{ondone}
	bind:disableOtherActions
>
	{#snippet idleView()}
		<div>Delete</div>
	{/snippet}

	{#snippet loading()}
		<div>Deleting...</div>
	{/snippet}

	{#snippet endView()}
		<div>Deleted!</div>
	{/snippet}
</AsyncButton>
