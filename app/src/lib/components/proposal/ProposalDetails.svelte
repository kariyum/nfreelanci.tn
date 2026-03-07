<script lang="ts">
	import type { TaskGET } from '$lib/features/task/models';
	import { snakeToCapital, formatDate } from '$lib/utils';
	import { Trash, MessageCircle } from 'lucide-svelte';
	import EditProposal from './EditProposal.svelte';
	import { proposalsClient } from '$lib/features/proposals/client';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';

	interface Props {
		task: TaskGET;
		projectOwner: String;
	}

	let { task, projectOwner }: Props = $props();

	async function submitApplication(taskId: number) {
		const response = await proposalsClient(fetch).createProposal(taskId);
		if (response.isOk()) {
			await invalidate(`/api/projects/${page.params.id}`);
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
		const response = await proposalsClient(fetch).patchProposalStatus(proposalId, action);
		if (response.isOk()) {
			await invalidate(`/api/projects/${projectId}/tasks/${taksId}/proposals`);
			await invalidate(`/api/projects/${projectId}`);
		} else {
			alert('Failed to patch proposal status!');
		}
	}
</script>

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
					<p style="white-space: pre-wrap;">
						{task.proposal_content ?? 'Unspecified'}
					</p>
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
								patchProposalStatus(task.project_id, task.id, task.proposal_id!, 'cancel')}
							><Trash size="14" /></button
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
		<div class="flex-row justify-between align-center" style="margin: 1rem 1rem 0 1rem;">
			<h2>About the Recruiter</h2>
			<a
				href={`/projects/${task.project_id}/tasks/${task.id}/proposals/${task.proposal_id}/discussion`}
				class="reset-a"
			>
				<MessageCircle size="14" />
			</a>
		</div>
		<div class="avatar-container">
			<div class="avatar" data-content={projectOwner.charAt(0).toUpperCase()}></div>
			<div>
				<div style="font-weight: bold; font-size:large;">
					{projectOwner.split('@')[0]}
				</div>
				<div>{projectOwner}</div>
			</div>
		</div>
	</div>
</div>
