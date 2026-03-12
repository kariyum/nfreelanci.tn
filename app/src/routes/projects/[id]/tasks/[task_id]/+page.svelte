<script lang="ts">
	import TaskDetails from '$lib/components/task/TaskDetails.svelte';
	import type { User } from '$lib/features/auth/client.js';
	import type { ProposalGET } from '$lib/features/proposals/models.js';
	import type { TaskGET } from '$lib/features/task/models.js';
	import type { FetchErrors } from '$lib/types.js';
	import SafeRender from '$lib/ui/snippets/SafeRender.svelte';
	import { Result } from '$lib/utils.js';

	let { data } = $props();

	type Prop = {
		projectOwner: string;
		proposals: ProposalGET[];
		task: TaskGET;
		user: User;
	};

	let fetchData = $derived.by(() => {
		const prop = {
			projectOwner: data.projectOwner,
			proposals: data.proposals,
			task: data.task,
			user: data.user
		};

		return Result.combine<Prop, FetchErrors>(prop);
	});
</script>

<div class="page-padding">
	<div class="container">
		<SafeRender data={fetchData}>
			{#snippet component(unwrappedData)}
				<TaskDetails
					projectOwner={data.projectOwner.unwrap()}
					proposals={data.proposals.unwrap()}
					task={data.task.unwrap()}
					user={data.user}
				></TaskDetails>
			{/snippet}
		</SafeRender>
		{#if data.task && data.user}{:else}
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
