import { projectClient } from '$lib/features/project/client.js';

export async function load({ fetch, url }) {
	const searchQuery = url.searchParams.get('q');
	const projects = await projectClient(fetch).search(searchQuery);

	return {
		projects: projects
	};
}
