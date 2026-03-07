<script lang="ts">
	import type { User } from '$lib/features/auth/client';
	import type { ProposalGET } from '$lib/features/proposals/models';
	import type { TaskGET } from '$lib/features/task/models';
	import { snakeToCapital } from '$lib/utils';
	import ProposalDetails from '../proposal/ProposalDetails.svelte';
	import ProposalsList from '../proposal/ProposalsList.svelte';
	import TaskActions from './TaskActions.svelte';
	import TaskContent from './TaskContent.svelte';

	interface Props {
		task: TaskGET;
		proposals: ProposalGET[];
		user: User;
		projectOwner: String;
	}

	let { task, proposals, user, projectOwner }: Props = $props();
	let isTaskOwner: boolean = $derived(projectOwner === user.email || false);
</script>

<div class="task">
	<div class="row">
		<h2>{task.title}</h2>
		<div class="status" data-type={task.status}>
			{snakeToCapital(task.status)}
		</div>
	</div>
	<div class="body">
		<TaskContent {task}></TaskContent>
		{#if isTaskOwner}
			<TaskActions></TaskActions>
		{:else if user.role == 'freelancer'}
			<ProposalDetails {task} {projectOwner}></ProposalDetails>
		{/if}
	</div>
	{#if isTaskOwner}
		<ProposalsList {proposals} {task}></ProposalsList>
	{/if}
</div>

<style>
	.task {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.row {
		display: flex;
		gap: 1rem;
	}
	.body {
		display: grid;
		grid-template-columns: 7fr 3fr;
		column-gap: 2rem;
	}
	@media (width < 600px) {
		.body {
			display: flex;
			flex-wrap: wrap;
			gap: 2rem;
			flex-direction: column-reverse;
		}
	}
</style>
