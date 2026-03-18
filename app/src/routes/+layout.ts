import { authClient } from '$lib/features/auth/client.js';
import { notificationClient } from '$lib/features/notification/client.js';
import { reduceFetchResults, UnauthorizedError } from '$lib/utils.js';
import { error } from '@sveltejs/kit';

export async function load({ fetch }) {
	const userResponse = await authClient(fetch).get();
	const notifications = await notificationClient(fetch).get();
	const fetchError = reduceFetchResults([userResponse, notifications]);
	if (fetchError && !(fetchError.error instanceof UnauthorizedError)) {
		error(fetchError.error.status, {
			message: 'Oups, unrecoverable error occured... please refresh the page'
		});
	}
	return {
		user: userResponse,
		notifications: notifications
	};
}
