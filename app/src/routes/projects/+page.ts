import { projectClient } from '$lib/features/project/client.js';
import { error } from '@sveltejs/kit';

export async function load({ fetch, url }) {
	const searchQuery = url.searchParams.get('q');
	const projects = await projectClient(fetch).search(searchQuery);

	if (projects.isErr()) {
		error(projects.error.status, { message: projects.error.message });
	}

	return {
		projects: projects.value
	};
}
