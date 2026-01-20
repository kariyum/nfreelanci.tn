<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { type TaskGET } from '$lib/types/task.js';
	import { formatDate, snakeToCapital } from '$lib/utils.js';
	import { MessageCircle, SquarePen, Trash } from 'lucide-svelte';
	import type { ProposalGET } from './+layout.js';
	import { page } from '$app/state';
	import EditProposal from '$lib/components/proposal/EditProposal.svelte';

	let { data } = $props();
	let task = $derived(data.task);
	let proposals: ProposalGET[] | undefined = $derived(data.proposals);
	const filterProposalsOnStatus = (proposals: ProposalGET[], status: string) =>
		proposals?.filter((prop) => prop.status.toLowerCase() === status);

	let proposalsCount = $derived.by(() => {
		if (proposals) {
			return {
				accepted: filterProposalsOnStatus(proposals, 'accepted').length,
				declined: filterProposalsOnStatus(proposals, 'declined').length,
				pending: filterProposalsOnStatus(proposals, 'pending').length
			};
		}
	});

	async function submitApplication(taskId: number) {
		const payload = {
			task_id: taskId
		};
		const response = await fetch('/api/proposals', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});
		if (response.ok) {
			await invalidate(`/api/projects/${data.project?.id}`);
		} else {
			alert('Failed to submit proposal!');
		}
	}

	async function patchProposalStatus(
		projectId: number,
		taksId: number,
		proposalId: number,
		action: string
	) {
		const payload = {
			action
		};
		const response = await fetch(`/api/proposals/${proposalId}/status`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});
		if (response.ok) {
			await invalidate(`/api/projects/${projectId}/task/${taksId}/proposals`);
			await invalidate(`/api/projects/${projectId}`);
		} else {
			// todo show error banner
		}
	}
	let width = $state(30);
	let left = $state(0);
	async function updateFilter(element: HTMLElement, filter: string | undefined) {
		filterStatus = filter;
		width = element.offsetWidth;
		left = element.offsetLeft;
	}

	let filterStatus: string | undefined = $state(undefined); // enum: all, pending, rejected, accepted
	let filteredProposals = $derived.by(() => {
		if (filterStatus && proposals) {
			return filterProposalsOnStatus(proposals, filterStatus);
		} else return proposals;
	});
</script>

{#snippet proposalsSnippet(proposals: ProposalGET[], task: TaskGET)}
	{@const sortedProposals = proposals.sort(
		(a, b) => a.created_at.getTime() - b.created_at.getTime()
	)}
	{#each sortedProposals as proposal}
		<div class="proposal">
			<div class="left">
				<div class="row">
					<div>{proposal.user_id}</div>
					<a
						href={`/project/${page.params.id}/task/${proposal.task_id}/proposals/${proposal.id}/discussion`}
						class="reset"><MessageCircle size="14" /></a
					>
				</div>
				<div>
					<span>Applied On:</span>
					<span>{task.created_at.toDateString()}</span>
				</div>
				<div>
					{#if proposal.budget}
						<span>Requesting: </span>
						<span>{proposal.budget}</span>
					{:else}
						<span>Budget not specified</span>
					{/if}
				</div>
			</div>
			<div class="right">
				<div class="status" data-type={proposal.status}>
					{snakeToCapital(proposal.status)}
				</div>
				<div>
					<button
						class="muted-btn"
						onclick={() => patchProposalStatus(task.project_id, task.id, proposal.id, 'decline')}
						>Not Interested</button
					>
					<button
						onclick={() => patchProposalStatus(task.project_id, task.id, proposal.id, 'accept')}
						>Accept</button
					>
				</div>
			</div>
		</div>
	{/each}
{/snippet}

{#snippet applications(task: TaskGET)}
	<div class="applications">
		<h2>Applications ({filteredProposals?.length || 0})</h2>
		<div
			class="app-actions"
			style:--top={'0px'}
			style:--left={`${left}px`}
			style:--width={`${width}px`}
			style:--height={'30px'}
		>
			<button
				data-active={filterStatus == undefined}
				onclick={(event) => {
					updateFilter(event.currentTarget, undefined);
				}}>All</button
			>
			<button
				data-active={filterStatus == 'pending'}
				onclick={(event) => updateFilter(event.currentTarget, 'pending')}
				>{proposalsCount?.pending ?? ''} Pending</button
			>
			<button
				data-active={filterStatus == 'accepted'}
				onclick={(event) => updateFilter(event.currentTarget, 'accepted')}
				>{proposalsCount?.accepted ?? ''} Accepted</button
			>
			<button
				data-active={filterStatus == 'declined'}
				onclick={(event) => updateFilter(event.currentTarget, 'declined')}
				>{proposalsCount?.declined ?? ''} Declined</button
			>
		</div>
		<div class="proposals">
			{#if filteredProposals && filteredProposals.length !== 0}
				{@render proposalsSnippet(filteredProposals, task)}
			{:else if filteredProposals && filterStatus}
				<div>0 {filterStatus} applications</div>
			{:else}
				<div>No applications yet!</div>
			{/if}
		</div>
	</div>
{/snippet}
<div class="page-padding">
	<div class="container">
		{#if task}
			<div class="task">
				<div class="row">
					<h2>{task.title}</h2>
					<div class="status" data-type={task.status}>
						{snakeToCapital(task.status)}
					</div>
				</div>
				<div class="body">
					<div class="column">
						<div class="card card-padding">
							<h2>Task Content</h2>
							{@html task.content}
						</div>
						<div class="card card-padding">
							<h2>Details</h2>
							<div class="details">
								<div class="detail">
									<span>Assignee</span>
									<span>
										{#if task.assignee_id}
											{task.assignee_id}
										{:else}
											Not Assinged
										{/if}
									</span>
								</div>
								<div class="detail">
									<span>Deadline</span>
									<span>{task.deadline.toDateString()}</span>
								</div>
								<div class="detail">
									<span>Budget</span>
									<span>{task.budget}</span>
								</div>
								<div class="detail">
									<span>Required Skills</span>
									<div class="flex-row">
										{#if task.skills.length === 0}
											<div>No skills required.</div>
										{:else}
											{#each task.skills as skill}
												<div class="skill">{skill}</div>
											{/each}
										{/if}
									</div>
								</div>
							</div>
						</div>
					</div>
					{#if data.project?.user_id === data.user?.email}
						<div class="column">
							<div class="card">
								<h2 style="padding: 1rem; padding-bottom:0;">Task Actions</h2>
								<div class="actions">
									<button
										class="row"
										onclick={async () => {
											await goto(`/project/${data.project?.id}`, {
												state: {
													projectEditMode: true,
													showTaskPopup: false,
													profileEditMode: false
												}
											});
										}}
									>
										<div class="icon">
											<SquarePen />
										</div>
										<div class="btn-text">
											<div>Edit Task</div>
											<div>Change task details or content</div>
										</div>
									</button>
									<!-- <button>Close Task</button> -->
								</div>
							</div>
						</div>
					{:else if data.user?.role == 'freelancer'}
						<div class="column">
							<div class="card">
								{#if task.proposal_status && task.proposal_id}
									<div class="application-status">
										<h2>Application Status</h2>
										<div class="status" data-type={task.proposal_status}>
											{snakeToCapital(task.proposal_status)}
										</div>
									</div>
									<div style="padding: 1rem;">
										<div class="details" style="padding-bottom: 1rem;">
											<div class="detail">
												<span>Budget</span>
												<span>
													{task.proposal_budget ?? 'Unspecified'}
												</span>
											</div>

											<div class="detail">
												<span>Submitted At</span>
												<span>
													{task.proposal_submission_date
														? formatDate(task.proposal_submission_date)
														: 'Unspecified'}
												</span>
											</div>
										</div>
										<div class="detail">
											<span>Content</span>
											<span>
												{task.proposal_content ?? 'Unspecified'}
											</span>
										</div>
									</div>
									{#if task.proposal_status == 'cancelled'}
										<button
											class="btn-submit"
											onclick={async () => {
												submitApplication(task.id);
											}}>Re-submit Application</button
										>
									{:else}
										<div class="edit-delete-btns">
											<EditProposal
												inBudget={task.proposal_budget}
												inContent={task.proposal_content}
												proposalId={task.proposal_id}
											></EditProposal>
											{#if task.proposal_status == 'pending'}
												<button
													style="background-color:var(--vibrant-red)"
													onclick={async () =>
														patchProposalStatus(
															task.project_id,
															task.id,
															task.proposal_id!,
															'cancel'
														)}><Trash size="14" /></button
												>
											{/if}
										</div>
									{/if}
								{:else}
									<h2 style="padding: 1rem; padding-bottom:0;">Ready To Apply?</h2>
									<div style="padding: 0 1rem; color: var(--sub-title); font-size:medium;">
										You can submit your application now.
									</div>
									<button
										class="btn-submit"
										onclick={async () => {
											submitApplication(task.id);
										}}>Submit Application</button
									>
								{/if}
							</div>
							<div class="card">
								<div
									class="flex-row justify-between align-center"
									style="margin: 1rem 1rem 0 1rem;"
								>
									<h2>About the Recruiter</h2>
									<a
										href={`/project/${task.project_id}/task/${task.id}/proposals/${task.proposal_id}/discussion`}
										class="reset-a"
									>
										<MessageCircle size="14" />
									</a>
								</div>
								<div class="avatar-container">
									<div
										class="avatar"
										data-content={data.project?.user_id.charAt(0).toUpperCase()}
									></div>
									<div>
										<div style="font-weight: bold; font-size:large;">
											{data.project?.user_id.split('@')[0]}
										</div>
										<div>{data.project?.user_id}</div>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
				{#if data.project?.user_id === data.user?.email}
					{@render applications(task)}
				{/if}
			</div>
		{:else}
			<div>Task Not Found !?</div>
		{/if}
	</div>
</div>

<style>
	.edit-delete-btns {
		display: flex;
		justify-content: stretch;
		border-width: 1px 0 0 0;
		border-style: solid;
		border-color: var(--border);

		> button:first-child {
			font-size: medium;
			align-self: unset;
			flex-grow: 1;
			border-radius: 0;
			border: none;
		}

		> button:last-child {
			border: none;
			align-self: unset;
			border-radius: 0;
		}
	}
	.application-status {
		padding: 1rem;
		padding-bottom: 0%;
		width: 100%;
		justify-content: space-between;
		display: flex;
		align-items: center;
	}

	.btn-submit {
		margin: auto;
		padding: 1rem 2rem;
		font-size: medium;
		width: 100%;
		border-radius: 0 0 15px 15px;
	}

	.reset {
		color: unset;
		text-decoration: unset;
	}
	.flex-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.btn-text {
		text-align: left;

		> div:last-child {
			color: var(--sub-title);
		}
	}
	.icon {
		line-height: 0;
	}
	.left {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;

		> div:not(:first-child) {
			color: var(--sub-title);
		}
	}
	.right {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}
	.details {
		display: grid;
		grid-template-columns: 1fr 1fr;
		row-gap: 1rem;
		column-gap: 1rem;
	}
	.detail {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;

		> span:first-child {
			color: var(--sub-title);
		}
	}
	.column {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
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
			> div:first-child {
				flex-grow: 10;
			}
			> div:last-child {
				flex-grow: 1;
			}
			flex-direction: column-reverse;
		}
	}

	.applications {
		margin: 1rem 0;
		> * {
			margin-bottom: 1rem;
		}

		.app-actions {
			position: relative;
			display: flex;
			padding-bottom: 0.5rem;
			gap: 0.2rem;
			border-bottom: 2px solid var(--border);

			button {
				position: relative;
				background-color: transparent;
				border: none;
				padding: 0;
				padding: 0.5rem 0.5rem 0.5rem 0.5rem;
			}

			button[data-active='false'] {
				color: rgba(var(--font-color), 0.1);
			}
		}

		.app-actions::before {
			content: '';
			position: absolute;
			left: var(--left);
			top: var(--top);
			width: var(--width);
			background-color: var(--selected-color);
			height: var(--height);
			z-index: 0;
			border-radius: 5px;
			transition:
				width 0.3s ease-in-out,
				left 0.3s ease-in-out;
		}
		.app-actions::after {
			content: '';
			position: absolute;
			background-color: var(--blue);
			width: var(--width);
			left: var(--left);
			height: 2px;
			bottom: -2px;
			border-radius: 15px;
			transition:
				width 0.3s ease-in-out,
				left 0.3s ease-in-out;
		}
	}

	.muted-btn {
		background-color: transparent;
		margin-right: 0.5rem;
	}

	.actions {
		> button:first-child {
			border-bottom: 0;
		}
		> button:last-child {
			border-top: 0;
			border-radius: 0 0 15px 15px;
		}
		> button {
			width: 100%;
			border-radius: 0;
		}
	}

	.proposals {
		display: flex;
		flex-direction: column;
		> .proposal:first-child {
			border-top-left-radius: 15px;
			border-top-right-radius: 15px;
		}
		> .proposal:last-child {
			border-bottom-left-radius: 15px;
			border-bottom-right-radius: 15px;
		}
		> .proposal {
			padding: 1.5rem;
			background-color: var(--card-bg);
			border: 1px solid var(--border);
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: space-between;
			gap: 1rem;
		}
	}

	.skill {
		background-color: var(--tag-bg);
		padding: 0.5rem 0.8rem;
		align-items: center;
		border-radius: 50px;
		width: fit-content;
		line-height: 1rem;
	}

	.container {
		max-width: var(--page-width);
		margin: 1rem auto;
	}
</style>
