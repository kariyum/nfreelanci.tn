import { authClient } from '$lib/features/auth/client.js';
import { notificationClient } from '$lib/features/notification/client.js';

export async function load({ fetch }) {
  const userResponse = await authClient(fetch).get();
  const notifications = await notificationClient(fetch).get();
  
  return {
    user: userResponse.value,
    userError: userResponse.error,
    notifications: notifications,
  }
}
