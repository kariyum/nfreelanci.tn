import { projectClient } from "$lib/features/project/client.js";

export async function load({ fetch }) {
    return {
        projects: await projectClient(fetch).get(),
    };
}