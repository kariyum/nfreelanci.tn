import { projectClient } from "$lib/features/project/client";

export async function load({ fetch, params }) {
    const project = await projectClient(fetch).getById(params.id);
    return {
        project
    }
}