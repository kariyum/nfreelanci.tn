import { messagesClient } from '$lib/features/messages/client.js';

export async function load({ fetch, params, parent }) {
    const parentData = await parent();
    const messagesResult = await messagesClient(fetch).get(params.task_id, params.proposal_id);
    if (messagesResult.isOk()) {
        const messagesData = messagesResult.unwrap();
        return {
            proposal: parentData.proposals?.find((proposal) => proposal.id == parseInt(params.proposal_id)),
            task: parentData.task,
            discussionId: messagesData.discussion_id,
            receivers: messagesData.members.filter((member) => member != parentData.user?.email),
            messages: messagesData.messages
        };
    } else {
        return {
            proposal: parentData.proposals?.find((proposal) => proposal.id == parseInt(params.proposal_id)),
            task: parentData.task,
            discussionId: 0,
            receivers: [],
            messages: []
        }
    }
}