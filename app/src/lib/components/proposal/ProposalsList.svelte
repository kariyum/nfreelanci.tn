<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { proposalsClient } from '$lib/features/proposals/client';
	import type { ProposalGET } from '$lib/features/proposals/models';
	import type { TaskGET } from '$lib/features/task/models';
	import { snakeToCapital } from '$lib/utils';
	import { MessageCircle } from 'lucide-svelte';

	const filterProposalsOnStatus = (proposals: ProposalGET[], status: string) =>
		proposals.filter((prop) => prop.status.toLowerCase() === status);

	interface Props {
		proposals: ProposalGET[];
		task: TaskGET;
	}

	let { proposals, task }: Props = $props();
	let width = $state(30);
	let left = $state(0);
	let filterStatus: string | undefined = $state(undefined); // enum: all, pending, rejected, accepted
	let proposalsCount = $derived.by(() => {
		return {
			accepted: filterProposalsOnStatus(proposals, 'accepted').length,
			declined: filterProposalsOnStatus(proposals, 'declined').length,
			pending: filterProposalsOnStatus(proposals, 'pending').length
		};
	});

	let filteredProposals = $derived.by(() => {
		let result = [];
		if (filterStatus) {
			result = filterProposalsOnStatus(proposals, filterStatus);
		} else {
			result = proposals;
		}
		return result.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
	});
	function updateFilter(element: HTMLElement, filter: string | undefined) {
		filterStatus = filter;
		width = element.offsetWidth;
		left = element.offsetLeft;
	}
	async function patchProposalStatus(
		projectId: number,
		taksId: number,
		proposalId: number,
		action: string
	) {
		const response = await proposalsClient(fetch).patchProposalStatus(proposalId, action);
		if (response.isOk()) {
			await invalidate(`/api/projects/${projectId}/tasks/${taksId}/proposals`);
			await invalidate(`/api/projects/${projectId}`);
		} else {
			alert('Failed to patch proposal status!');
		}
	}
</script>

{#snippet proposalsSnippet(proposals: ProposalGET[], task: TaskGET)}
	{#each proposals as proposal}
		<div class="proposal">
			<div class="left">
				<div class="row">
					<div>{proposal.user_id}</div>
					<a
						href={`/projects/${page.params.id}/tasks/${proposal.task_id}/proposals/${proposal.id}/discussion`}
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

{#snippet applications(proposals: ProposalGET[], task: TaskGET)}
	<div class="applications">
		<h2>Applications ( {proposals?.length || 0} )</h2>
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
				>{proposalsCount.pending} Pending</button
			>
			<button
				data-active={filterStatus == 'accepted'}
				onclick={(event) => updateFilter(event.currentTarget, 'accepted')}
				>{proposalsCount.accepted} Accepted</button
			>
			<button
				data-active={filterStatus == 'declined'}
				onclick={(event) => updateFilter(event.currentTarget, 'declined')}
				>{proposalsCount.declined} Declined</button
			>
		</div>
		<div class="proposals">
			{#if filteredProposals.length !== 0}
				{@render proposalsSnippet(filteredProposals, task)}
			{:else if filterStatus}
				<div>0 {filterStatus} applications</div>
			{:else}
				<div>No applications yet!</div>
			{/if}
		</div>
	</div>
{/snippet}

{@render applications(proposals, task)}

<style>
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
	.row {
		display: flex;
		gap: 1rem;
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
</style>
