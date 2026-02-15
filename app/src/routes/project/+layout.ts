import { projectService } from '$lib/features/project/apis';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, params }) => {
    if (!params.id) {
        return {
            status: 404,
            project: undefined,
        }
    }
    const project = await projectService(fetch).getById(params.id);
    return {
        project: project.unwrap()
    }
};