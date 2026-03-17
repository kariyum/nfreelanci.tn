import { messagesClient, type Messages } from '$lib/features/messages/client.js';
import type { ProposalGET } from '$lib/features/proposals/models.js';
import type { TaskGET } from '$lib/features/task/models.js';
import { error } from '@sveltejs/kit';

export interface MessagesPageProp {
	messages: Messages;
	proposal: ProposalGET | undefined;
	task: TaskGET | undefined;
}

export async function load({ fetch, params, parent }) {
	const parentData = await parent();
	const messagesResult = await messagesClient(fetch).get(params.task_id, params.proposal_id);
	if (messagesResult.isErr()) {
		error(messagesResult.status, { message: 'Failed to load messages...' });
	}
	const proposal = parentData.proposals.find(
		(proposal) => proposal.id == parseInt(params.proposal_id)
	);
	if (!proposal) {
		error(404, { message: 'Proposal not found!' });
	}

	return {
		messages: messagesResult.unwrap(),
		proposal: proposal,
		task: parentData.task
	};
}
