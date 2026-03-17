import { proposalsClient } from '$lib/features/proposals/client.js';
import { error } from '@sveltejs/kit';

export async function load({ fetch, params, parent }) {
	const proposals = await proposalsClient(fetch).getByProductIdTaskId(params.id, params.task_id);
	const parentData = await parent();
	const task = parentData.project.tasks?.find((task) => task.id.toString() === params.task_id);

	if (task === undefined) {
		error(404, { message: 'Task not found!' });
	}

	if (proposals.isErr()) {
		error(proposals.error.status, { message: 'Failed to fetch proposals' });
	}

	return {
		proposals: proposals.unwrap(),
		task: task
	};
}
