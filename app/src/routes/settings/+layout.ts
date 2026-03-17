import { profileClient } from '$lib/features/profiles/client.js';
import { UnauthorizedError } from '$lib/utils.js';
import { error } from '@sveltejs/kit';

export async function load({ fetch, parent }) {
	const parentData = await parent();
	if (parentData.user.error instanceof UnauthorizedError) {
		error(401, {
			message: 'Unauthorized, please login.'
		});
	}
	const userProfile = await profileClient(fetch).get();
	if (userProfile.isErr()) {
		error(userProfile.error.status, {
			message: 'Failed to fetch user profile data...'
		});
	}
	return {
		profileData: userProfile.unwrap(),
		user: parentData.user.unwrap()
	};
}
