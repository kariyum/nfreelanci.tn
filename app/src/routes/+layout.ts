import { authService } from '$lib/features/auth/apis.js';
import { notificationService, type BaseNotification } from '$lib/features/notification/apis.js';

export async function load({ fetch }) {
  const userResponse = await authService(fetch).get();
  const notificationsResponse = await notificationService(fetch).get();

  return {
    user: userResponse.value,
    userError: userResponse.error,
    notifications: notificationsResponse,
  }
}
