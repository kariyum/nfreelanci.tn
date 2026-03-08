import type { MessagesJsonResponse } from '$lib/features/notification/socket';
import { fetchIntoResult } from '$lib/utils';

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

export interface Messages {
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

export const messagesClient = (fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) => {
    return {
        get: async (taskId: string, proposalId: string) => {
            const messagesRequest = await fetchIntoResult<MessagesJson>(
                () => fetch(`/api/tasks/${taskId}/proposals/${proposalId}/messages`)
            );
            const messagesResult = messagesRequest.map((messagesJson) => parseMessagesJson(messagesJson));
            return messagesResult;
        }
    }
}