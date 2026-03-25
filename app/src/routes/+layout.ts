import { resolve } from '$app/paths';
import { authClient, type User } from '$lib/features/auth/client.js';
import { notificationClient, type BaseNotification } from '$lib/features/notification/client.js';
import type { Fetch } from '$lib/types.js';
import { FetchErr, FetchOk, reduceFetchResults, UnauthorizedError } from '$lib/utils.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ fetch, url }) {
	let userJsonResponse = await authClient(fetch).get();
	let userResponse = userJsonResponse.map((json) => json as User);
	console.log(url.pathname);
	if (
		userJsonResponse.isOk() &&
		!userJsonResponse.value.role &&
		userJsonResponse.value.role == null
	) {
		console.log(userJsonResponse);
		userResponse = new FetchErr(new UnauthorizedError('Unauthorized'));

		if (url.pathname !== '/setup-profile') {
			console.log('redirecting');
			redirect(301, resolve('/setup-profile'));
		}
	} else {
		userJsonResponse = new FetchErr(new UnauthorizedError('Unauthorized'));
	}
	const notifications = await fetchNotifications(fetch)(userResponse);
	const fetchError = reduceFetchResults([userResponse, notifications]);
	if (fetchError && !(fetchError.error instanceof UnauthorizedError)) {
		error(fetchError.error.status, {
			message: 'Oups, unrecoverable error occured... please refresh the page'
		});
	}
	console.log({
		userJsonResponse: userJsonResponse,
		user: userResponse
	});
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
