import { proposalsClient } from "$lib/features/proposals/client.js";

export async function load({ fetch, params, parent }) {
    const proposals = await proposalsClient(fetch).getByProductIdTaskId(params.id, params.task_id);
    const parentData = await parent();
    const task = parentData.project.map(project => project.tasks?.find((task) => task.id.toString() === params.task_id))
    const ownerId = parentData.project.map(project => project.user_id);
    return {
        error: proposals.error,
        proposals: proposals.unwrap(),
        task: task.unwrap(),
        projectOwner: ownerId.unwrap()
    };
}