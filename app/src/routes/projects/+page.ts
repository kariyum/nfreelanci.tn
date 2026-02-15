// when this API is invalidated for some reason 
// the component is not re-rendered if the load function runs only on the server

import { projectService } from "$lib/features/project/apis.js";

export async function load({ fetch, url }) {
    let searchQuery = url.searchParams.get("q")
    const projects = await projectService(fetch).search(searchQuery);

    return {
        projects: projects,
    };
}