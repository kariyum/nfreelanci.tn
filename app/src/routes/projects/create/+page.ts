import { raiseIfUnauthorized } from '$lib/utils';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const parentData = await parent();
	const user = raiseIfUnauthorized(parentData.user);

	return {
		user
	};
};
