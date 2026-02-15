import type { MessagesJsonResponse } from "$lib/features/notification/socket";

export const load = async ({ fetch, params }) => {
    const response = await fetch(`/api/messages/${params.id}`);
    const data: Array<MessagesJsonResponse> = await response.json();
    return {
        discussion_id: params.id,
        messages: data
    };
};