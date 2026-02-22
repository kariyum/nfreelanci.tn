import type { MessagesJsonResponse } from '$lib/features/notification/socket';
import { fetchIntoResult } from '$lib/utils.js';

interface LightMessageJson {
    id: number,
    from_user_id: string,
    content: string,
    created_at: number
}

interface MessagesJson {
    discussion_id: number,
    members: string[],
    messages: LightMessageJson[]
}

interface Messages {
    discussion_id: number,
    members: string[],
    messages: MessagesJsonResponse[]
}

const parseLightMessageJson = (object: LightMessageJson, discussionId: number) => {
    const result: MessagesJsonResponse = {
        id: object.id,
        from_user_id: object.from_user_id,
        content: object.content,
        discussion_id: discussionId,
        created_at: new Date(object.created_at),
        notification_type: 'message'
    };
    return result;
}

const parseMessagesJson = (object: MessagesJson) => {
    const result: Messages = {
        ...object,
        messages: object.messages.map((v) => parseLightMessageJson(v, object.discussion_id))
    };
    return result;
}

export async function load({ fetch, params, parent }) {
    const parentData = await parent();
    const messagesRequest = await fetchIntoResult<MessagesJson>(
        () => fetch(`/api/tasks/${params.task_id}/proposals/${params.proposal_id}/messages`)
    );
    const messagesResult = messagesRequest.map((messagesJson) => parseMessagesJson(messagesJson));
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