<script lang="ts">
	import Conversation from '$lib/components/conversation/Conversation.svelte';
	import { type User } from '$lib/features/auth/client';
	import type { Messages } from '$lib/features/messages/client';
	import type { MessagesJsonResponse } from '$lib/features/notification/socket';
	import { type ProposalGET } from '$lib/features/proposals/models.js';
	import { type TaskGET } from '$lib/features/task/models';
	interface Props {
		task: TaskGET;
		proposal: ProposalGET;
		messages: Messages;
		user: User;
	}
	let { task, proposal, messages, user }: Props = $props();
	let receivers = $derived(messages.members.filter((member) => member != user.email).join(', '));
</script>

<div class="with-context page-padding">
	{@render conversationWithContext(task, proposal, user)}
</div>
<div class="p-1 flex-row justify-between align-center without-context">
	<div style="font-size: medium;">Conversation with {receivers}</div>
</div>
<div class="without-context chat">
	<Conversation messagesProp={messages} {user} />
</div>

{#snippet conversationWithContext(task: TaskGET, proposal: ProposalGET, user: User)}
	<div style="gap:1rem; margin-top: 1rem;" class="body page-width">
		<div class="card" style="height: 100%; overflow:hidden;">
			<div style="height: 100%; display: flex; flex-direction: column;">
				<div class="p-1 flex-row justify-between align-center">
					<div>
						<div style="font-size: medium;">Conversation with {receivers}</div>
						<div>Online</div>
					</div>
					<div>
						<a href={`/projects/${task.project_id}/tasks/${task.id}`}>Back to Task Details</a>
					</div>
				</div>
				<Conversation messagesProp={messages} {user} />
			</div>
		</div>
		<div class="right">
			<div class="section">
				<div class="card card-padding">
					<h3>Regarding Task</h3>
					<h3>{task.title}</h3>
					<div>
						{@html task.content}
					</div>
				</div>
			</div>
			<div class="section">
				<div class="card card-padding">
					<h3>Application Proposal</h3>
					<div>{task.proposal_content || 'No Propsal Content'}</div>
				</div>
			</div>
			{#if user.role == 'recruiter'}
				<div class="section">
					<div class="card card-padding">
						<h2>Freelancer Details</h2>
						<div class="flex-row-1g">
							<div class="avatar" data-content={proposal.user_id.charAt(0).toUpperCase()}></div>
							<div>
								<div style="font-size: large; font-weight:bold;">{proposal.user_id}</div>
								<a href="/">View Profile</a>
							</div>
						</div>
						<div>
							<strong>Proposed Budget:</strong>
							<span style="font-size: large;">{proposal.budget || 'Not Specified'}</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/snippet}

<style>
	.body {
		display: grid;
		grid-template-columns: 5fr 2fr;
		margin: auto;
	}
	.section {
		margin-bottom: 1.5rem;
	}

	.without-context {
		display: none;
	}

	.card-padding {
		padding: 1rem;
	}

	@media (width < 600px) {
		.with-context {
			display: none;
		}

		.without-context {
			display: block;
		}

		.chat {
			flex-grow: 1;
		}

		:global(body) {
			display: flex;
			flex-direction: column;
			height: 100vh;
			width: 100%;
		}
	}
</style>
