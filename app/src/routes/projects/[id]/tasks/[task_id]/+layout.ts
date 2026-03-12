import type { User } from '$lib/features/auth/client.js';
import { proposalsClient } from '$lib/features/proposals/client.js';
import type { TaskGET } from '$lib/features/task/models.js';
import type { FetchErrors } from '$lib/types.js';
import { NotFound, Result, UnauthorizedError } from '$lib/utils.js';

export async function load({ fetch, params, parent }) {
	const proposals = await proposalsClient(fetch).getByProductIdTaskId(params.id, params.task_id);
	const parentData = await parent();
	const task = parentData.project
		.map((project) => project.tasks?.find((task) => task.id.toString() === params.task_id))
		.flatMap((task) => {
			if (task) {
				return Result.ok(task) as Result<TaskGET, FetchErrors>;
			} else {
				return Result.err(new NotFound('Task not found')) as Result<TaskGET, FetchErrors>;
			}
		});
	const ownerId = parentData.project.map((project) => project.user_id);
	return {
		error: proposals.error,
		proposals: proposals,
		task: task,
		projectOwner: ownerId,
		user: parentData.user
			? Result.ok<User, FetchErrors>(parentData.user)
			: Result.err<User, FetchErrors>({
					unauthorizedError: new UnauthorizedError('UnauthorizedError')
				})
	};
}
