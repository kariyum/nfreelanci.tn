import { profileClient } from '$lib/features/profiles/client.js';
import { raiseIfUnauthorized } from '$lib/utils.js';
import { error } from '@sveltejs/kit';

export async function load({ fetch, parent }) {
	const parentData = await parent();
	const user = raiseIfUnauthorized(parentData.user);
	const userProfile = await profileClient(fetch).get();
	if (userProfile.isErr()) {
		error(userProfile.error.status, {
			message: 'Failed to fetch user profile data...'
		});
	}
	return {
		profileData: userProfile.value,
		user
	};
}
