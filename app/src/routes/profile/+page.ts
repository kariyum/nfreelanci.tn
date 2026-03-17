import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const parentData = await parent();
	if (parentData.user.isErr()) {
		error(parentData.user.error.status, { message: parentData.user.error.message });
	}
	return { user: parentData.user.unwrap() };
};
