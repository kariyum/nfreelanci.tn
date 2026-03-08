<script lang="ts">
	import TaskDetails from '$lib/components/task/TaskDetails.svelte';

	let { data } = $props();
</script>

<div class="page-padding">
	<div class="container">
		{#if data.task && data.user}
			<TaskDetails
				projectOwner={data.projectOwner}
				proposals={data.proposals}
				task={data.task}
				user={data.user}
			></TaskDetails>
		{:else}
			<div>Task Not Found !?</div>
		{/if}
	</div>
</div>

<style>
	.container {
		max-width: var(--page-width);
		margin: 1rem auto;
	}
</style>
