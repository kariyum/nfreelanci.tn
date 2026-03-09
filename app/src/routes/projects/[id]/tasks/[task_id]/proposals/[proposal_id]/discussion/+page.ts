import { messagesClient, type Messages } from '$lib/features/messages/client.js';
import type { ProposalGET } from '$lib/features/proposals/models.js';
import type { TaskGET } from '$lib/features/task/models.js';
import type { Fetch, FetchErrors } from '$lib/types.js';
import { NotFound, Result } from '$lib/utils.js';

export interface MessagesPageProp {
    messages: Messages,
    proposal: ProposalGET | undefined,
    task: TaskGET | undefined
}

export async function load({ fetch, params, parent }) {
    const parentData = await parent();
    const messagesResult = await messagesClient(fetch).get(params.task_id, params.proposal_id);
    const proposalSearchResult = parentData.proposals?.find((proposal) => proposal.id == parseInt(params.proposal_id))
    const proposal: Result<ProposalGET, FetchErrors> = proposalSearchResult ? Result.ok(proposalSearchResult) : Result.err({ notFound: new NotFound("Proposal not found") })
    const task: Result<TaskGET, FetchErrors> = parentData.task ? Result.ok(parentData.task) : Result.err({ notFound: new NotFound("Task not found") });

    return {
        messages: messagesResult,
        proposal: proposal,
        task: task
    }
}