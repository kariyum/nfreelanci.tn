<script lang="ts">
	import AsyncButton from './AsyncButton.svelte';

	interface Props {
		onClick: () => Promise<any>;
	}

	async function handleDelete() {}
</script>

<AsyncButton onclick={async () => await handleDelete()}>
	{#snippet idleView()}
		<div>Delete</div>
	{/snippet}

	{#snippet endView()}
		<div>Deleted!</div>
	{/snippet}
</AsyncButton>
