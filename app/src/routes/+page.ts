import { projectService } from "$lib/features/project/apis.js";

export async function load({ fetch }) {
    const projects = await projectService(fetch).get();

    return {
        projects: projects,
    };
}