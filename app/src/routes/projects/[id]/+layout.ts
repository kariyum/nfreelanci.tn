import { projectClient } from '$lib/features/project/client';
import { FetchResult } from '$lib/utils';
import { error } from '@sveltejs/kit';

export async function load({ fetch, params, parent }) {
	const parentData = await parent();
	const project = await projectClient(fetch).getById(params.id);
	const fetchError = FetchResult.reduce([parentData.user, project]);
	if (fetchError) {
		error(fetchError.status, { message: fetchError.message });
	}
	return {
		project: project.unwrap(),
		user: parentData.user.unwrap()
	};
}
