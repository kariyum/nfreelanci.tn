import { fetchIntoResult } from "$lib/utils";
import type { ProjectJSON } from "./models";
import { parseProjectJSON, processProjectJson } from "./service";

export const projectService = (fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) => {
    return {
        get: async () => {
            const response = await fetchIntoResult<ProjectJSON[]>(() => fetch("/api/projects", { method: "GET" }));
            return response.map((value: ProjectJSON[]) => parseProjectJSON(value));
        },
        getById: async (id: string) => {
            const response = await fetchIntoResult<ProjectJSON>(() => fetch(`/api/projects/${id}`, { method: "GET" }));
            return response.map((value: ProjectJSON) => processProjectJson(value));
        },
        search: async (searchQuery: string | null) => {
            let projectsUrl = searchQuery !== null ? `/api/projects?q=${searchQuery}` : "/api/projects"
            const response = await fetchIntoResult<ProjectJSON[]>(() => fetch(projectsUrl, { method: "GET" }));
            return response.map((value: ProjectJSON[]) => parseProjectJSON(value));
        }
    }
}
