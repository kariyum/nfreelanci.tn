import { projectClient } from '$lib/features/project/client';
import { error } from '@sveltejs/kit';

export async function load({ fetch, params, parent }) {
	const parentData = await parent();
	const project = await projectClient(fetch).getById(params.id);
	if (project.isErr()) {
		error(project.error.status, { message: project.error.message });
	}
	return {
		project: project.value,
		user: parentData.user
	};
}
