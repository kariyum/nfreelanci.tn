import { raiseIfUnauthorized } from '$lib/utils';

export const load = async ({ parent }) => {
	const parentData = await parent();
	const user = raiseIfUnauthorized(parentData.user);

	return {
		user
	};
};
