<script lang="ts">
	import TaskDetails from '$lib/components/task/TaskDetails.svelte';

	let { data } = $props();
</script>

<div class="page-padding">
	<div class="container">
		<TaskDetails proposals={data.proposals} task={data.task} user={data.user} project={data.project}
		></TaskDetails>
	</div>
</div>

<style>
	.container {
		max-width: var(--page-width);
		margin: 1rem auto;
	}
</style>
