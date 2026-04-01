import { authClient, type User } from '$lib/features/auth/client.js';
import { notificationClient, type BaseNotification } from '$lib/features/notification/client.js';
import type { Fetch } from '$lib/types.js';
import { FetchErr, FetchOk, reduceFetchResults, UnauthorizedError } from '$lib/utils.js';
import { error } from '@sveltejs/kit';

export async function load({ fetch }) {
	const userJsonResponse = await authClient(fetch).get();
	const userResponse = userJsonResponse.flatMap((json) =>
		json.role ? new FetchOk(json as User) : new FetchErr(new UnauthorizedError('User with no role'))
	);
	const notifications = await fetchNotifications(fetch)(userResponse);
	const fetchError = reduceFetchResults([userResponse, notifications]);
	if (fetchError && !(fetchError.error instanceof UnauthorizedError)) {
		error(fetchError.error.status, {
			message: 'Oups, unrecoverable error occured... please refresh the page'
		});
	}

	return {
		userJsonResponse: userJsonResponse,
		user: userResponse,
		notifications: notifications
	};
}

const fetchNotifications =
	(fetch: Fetch) =>
	async (
		userResponse: FetchErr | FetchOk<User>
	): Promise<FetchErr | FetchOk<BaseNotification[]>> => {
		if (userResponse.isOk()) {
			return notificationClient(fetch).get();
		} else {
			return Promise.resolve(new FetchOk([]));
		}
	};
