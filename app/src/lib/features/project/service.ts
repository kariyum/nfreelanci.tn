import type { TaskClass } from '$lib/components/task/states.svelte';
import { validateObject } from '$lib/object-validator';
import { fetchIntoResult, Result } from '$lib/utils';
import { Validator } from '$lib/validator';
import { processTaskJson } from '../task/client';
import type { TaskPOST } from '../task/models';
import { projectClient } from './client';
import type {
	ProjectFormType,
	ProjectFormValidation,
	ProjectGET,
	ProjectJSON,
	ProjectPOST
} from './models';

export function processProjectJson(json: ProjectJSON): ProjectGET {
	const project: ProjectGET = {
		id: json.id,
		user_id: json.user_id.toString(),
		title: json.title,
		budget: json.budget,
		currency_code: json.currency_code,
		content: json.content,
		created_at: new Date(json.created_at),
		deadline: new Date(json.deadline),
		tasks: json.tasks?.map((task) => processTaskJson(task))
	};
	return project;
}

export const parseProjectJSON = (jsonData: ProjectJSON[]) =>
	jsonData.map((json) => processProjectJson(json));

function validateProjectPayload(
	project: ProjectFormType,
	tasks: TaskClass[]
): ProjectFormValidation | undefined {
	const projectSchema = {
		title: Validator.string('project title').required().nonEmpty().withMinSize(5).withMaxSize(20),
		content: Validator.string('Project description')
			.required()
			.nonEmpty()
			.withMinSize(10)
			.withMaxSize(500),
		budget: Validator.number('project budget').required().isPositive(),
		deadline: Validator.string('project deadline').required().nonEmpty()
	};
	const taskSchema = {
		title: Validator.string('task title').required().nonEmpty().withMinSize(5).withMaxSize(20),
		content: Validator.string('task description')
			.required()
			.nonEmpty()
			.withMinSize(10)
			.withMaxSize(500),
		budget: Validator.number('task budget').required().isPositive(),
		deadline: Validator.string('task deadline').required().nonEmpty(),
		skills: Validator.stringArray('skills').nonEmpty().maxSize(50)
	};
	const projectErrors = validateObject(project, projectSchema);
	const tasksError = new Map(
		tasks.map((task) => [task, validateObject(task.toTaskForm(), taskSchema)])
	);
	const hasProjectFormErrors = Object.values(projectErrors).some((errors) => errors.length > 0);
	const hasTaskFormErrors = Array.from(tasksError.values())
		.flatMap((errors) => Object.values(errors))
		.some((value) => value.length > 0);
	if (hasProjectFormErrors || hasTaskFormErrors) {
		return {
			projectErrors,
			tasksError
		};
	}
}

export const projectService = {
	deleteProject: async (projectId: number) => {
		return fetchIntoResult(() => projectClient(fetch).delete(projectId));
	},
	constructPostPutPayload: (
		project: ProjectFormType,
		tasks: TaskClass[]
	): Result<ProjectPOST, ProjectFormValidation> => {
		const formValidation = validateProjectPayload(project, tasks);
		if (formValidation) {
			return Result.err(formValidation);
		} else {
			const projectPost: ProjectPOST = {
				title: project.title,
				content: project.content,
				budget: parseFloat(project.budget.toString()),
				deadline: new Date(project.deadline).toISOString()
			};

			const tasksPayload = tasks.map((task) => {
				const attributes: TaskPOST = {
					title: task.title,
					content: task.content,
					assignee_id: task.assignee_id,
					skills: task.skills,
					status: task.status,
					budget: parseFloat(task.budget?.toString() ?? '0'),
					deadline: new Date().toISOString()
				};
				return {
					...attributes,
					id: task.id
				};
			});

			const payload = {
				...projectPost,
				tasks: tasksPayload
			};
			return Result.ok(payload);
		}
	}
};
