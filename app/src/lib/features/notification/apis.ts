import { fetchIntoResult } from "$lib/utils";

type BaseNotificationJSON = {
    created_at: string,
    notification_type: string,
}
export interface BaseNotification {
    notification_type: NotificationType,
    created_at: Date
}

export type NotificationType = "message" | "proposal" | "new_proposal";

const processNotifications = (baseNotificationJSON: BaseNotificationJSON) => {
    return {
        ...baseNotificationJSON,
        notification_type: baseNotificationJSON.notification_type,
        created_at: new Date(baseNotificationJSON.created_at)
    } as BaseNotification;
}

export const notificationService = (fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) => {
    return {
        get: async () => {
            const response = await fetchIntoResult<BaseNotificationJSON[]>(() => fetch("/api/notifications"));
            const parsedResponse = response
                .map((baseNotifications) => baseNotifications.map(processNotifications))
                .map((notifications) => notifications.toSorted((a, b) => b.created_at.getTime() - a.created_at.getTime()))
            return parsedResponse;
        }
    }
}