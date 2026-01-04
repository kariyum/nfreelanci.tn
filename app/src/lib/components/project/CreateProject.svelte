<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { TaskClass } from '$lib/components/task/states.svelte';
	import { validateObject, type ValidationErrors } from '$lib/object-validator';
	import type { ProjectForm, ProjectGET, ProjectPOST } from '$lib/types/project';
	import type { TaskPOST } from '$lib/types/task';
	import { Validator } from '$lib/validator';
	import { Plus } from 'lucide-svelte';
	import AsyncButton from '../button/AsyncButton.svelte';
	import Skills from '../skills/Skills.svelte';
	import RichTextEditor from '../texteditor/RichTextEditor.svelte';

	let {
		projectIn
	}: {
		projectIn?: ProjectGET;
	} = $props();

	let projectFormInput: ProjectForm = $derived.by(() => {
		let projectState = $state({
			title: projectIn?.title ?? '',
			content: projectIn?.content ?? '',
			budget: projectIn?.budget ?? 0,
			deadline: projectIn?.deadline.toLocaleDateString('en-CA') ?? ''
		});
		return projectState;
	});

	$effect(() => {
		tasks = projectIn?.tasks?.map((task) => TaskClass.fromGET(task)) ?? ([] as TaskClass[]);
	});

	let tasks: TaskClass[] = $state(
		projectIn?.tasks?.map((task) => TaskClass.fromGET(task)) ?? ([] as TaskClass[])
	);

	async function handleSubmit(event: Event) {
		event.preventDefault();
		formValidation = reportFormValidation(projectFormInput, tasks);
		if (formValidation.hasErrors) {
			return;
		}
		const projectPost: ProjectPOST = {
			title: projectFormInput.title,
			content: projectFormInput.content,
			budget: parseFloat(projectFormInput.budget.toString()),
			deadline: new Date(projectFormInput.deadline).toISOString()
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

		if (projectIn?.id) {
			const response = await fetch(`/api/projects/${projectIn.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			if (response.status === 200) {
				if (document.startViewTransition) {
					document.startViewTransition(async () => {
						return await invalidate(`/api/projects/${projectIn.id}`);
					});
				} else {
					return await invalidate(`/api/projects/${projectIn.id}`);
				}
			}
		} else {
			const response = await fetch('/api/projects', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			if (response.status === 201) {
				return await goto('/');
			}
		}
	}

	async function deleteProject() {
		if (projectIn?.id) {
			const response = await fetch(`/api/projects/${projectIn.id}`, {
				method: 'DELETE'
			});
			if (response.ok) {
				if (document.startViewTransition) {
					document.startViewTransition(async () => {
						await invalidate('/api/projects');
						return await goto('/');
					});
				} else {
					await invalidate('/api/projects');
					return await goto('/');
				}
			}
		}
	}

	interface FormValidation {
		projectErrors: ValidationErrors<ProjectForm>;
		tasksError: Map<TaskClass, ValidationErrors<TaskClass>>;
		hasErrors: boolean;
	}

	function reportFormValidation(project: ProjectForm, tasks: TaskClass[]): FormValidation {
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
		return {
			projectErrors,
			tasksError,
			hasErrors: hasProjectFormErrors || hasTaskFormErrors
		};
	}
	let formValidation: FormValidation | undefined = $state(undefined);
</script>

{#snippet deleteButton()}
	<div>Delete</div>
{/snippet}
{#snippet submitButton()}
	<div>{projectIn ? 'Update Project' : 'Save Project'}</div>
{/snippet}
{#snippet endView()}
	Done!
{/snippet}

{#snippet errors(errors: string[])}
	{#if errors.length > 0}
		<div class="error-message">
			{#each errors as err}
				<div class="form-reason">{err}</div>
			{/each}
		</div>
	{/if}
{/snippet}

{#snippet actions()}
	<div style="width: 100%; margin-top: 1rem;">
		<div class="action-buttons">
			<button
				class="cancel-btn"
				onclick={() => {
					if (document.startViewTransition) {
						document.startViewTransition(() => {
							history.back();
						});
					} else {
						history.back();
					}
				}}>Cancel</button
			>
			{#if projectIn?.id}
				<AsyncButton
					--color="var(--vibrant-red)"
					--width="fit-content"
					--hover-color="hsl(0, 50%, 35%)"
					idleView={deleteButton}
					{endView}
					onclick={() => deleteProject()}
				/>
			{/if}
			<AsyncButton idleView={submitButton} {endView} onclick={(event) => handleSubmit(event)} />
		</div>
	</div>
{/snippet}

{#snippet createProject(projectIn: ProjectGET | undefined)}
	{#if projectIn}
		<h2>Update your project</h2>
	{:else}
		<h2>Create a new project</h2>
	{/if}
	<div class="new-container">
		<div class="left">
			<div class="card card-padding">
				<h2 style="margin-bottom: 0.2rem;">Project Details</h2>
				<div>
					<div class="input input-label">
						<input type="text" id="title" placeholder=" " bind:value={projectFormInput.title} />
						<label for="title">Project Title</label>
					</div>
					{#if formValidation}
						{@render errors(formValidation.projectErrors.title ?? [])}
					{/if}
					<div style="margin-top: 1.5rem;"></div>
					<div>
						<RichTextEditor bind:x={projectFormInput.content} label={'Project Description'}
						></RichTextEditor>
						{#if formValidation}
							{@render errors(formValidation.projectErrors.content ?? [])}
						{/if}
					</div>
				</div>
			</div>
		</div>
		<div class="right">
			<div class="card card-padding">
				<h2>Project Constraints</h2>
				<div>
					<div class="input input-label">
						<input id="budget" placeholder=" " bind:value={projectFormInput.budget} />
						<label for="">Budget</label>
					</div>
					{#if formValidation}
						{@render errors(formValidation.projectErrors.budget ?? [])}
					{/if}
				</div>

				<div>
					<div class="input input-label">
						<input
							type="date"
							id="deadline"
							placeholder=" "
							bind:value={projectFormInput.deadline}
						/>
						<label for="">Deadline</label>
					</div>
					{#if formValidation}
						{@render errors(formValidation.projectErrors.deadline ?? [])}
					{/if}
				</div>
			</div>
		</div>
	</div>
{/snippet}

{#snippet createTask()}
	<div class="flex-row justify-between align-center" style="margin: 1rem 0;">
		<h2>Tasks</h2>
		<div>
			<button
				class="flex-row justify-between align-center"
				style="gap: 0.5rem;"
				onclick={() => {
					tasks.push(new TaskClass());
				}}><Plus size="16" /> Add Task</button
			>
		</div>
	</div>
	{#if tasks.length == 0}
		<div>No tasks were added to this project yet</div>
	{/if}
	{#each tasks as taskInstance}
		<div class="card card-padding" style="margin-bottom: 1rem;">
			<div class="task-container">
				<div class="flex-column">
					<h2>Task Details</h2>
					<div>
						<div class="input-label input-style">
							<input
								class="input-style"
								type="text"
								placeholder=" "
								id="title"
								bind:value={taskInstance.title}
							/>
							<label for="title">Title</label>
						</div>
						{#if formValidation}
							{@render errors(formValidation.tasksError.get(taskInstance)?.title ?? [])}
						{/if}
					</div>
					<div>
						<RichTextEditor bind:x={taskInstance.content} label={'Task Description'}
						></RichTextEditor>
						{#if formValidation}
							{@render errors(formValidation.tasksError.get(taskInstance)?.content ?? [])}
						{/if}
					</div>
				</div>
				<div class="flex-column">
					<h2>Task Constraints</h2>
					<div>
						<div class="input-label">
							<input
								class="input-style"
								type="date"
								placeholder="Deadline"
								bind:value={taskInstance.deadline}
							/>
							<label for="deadline">Deadline</label>
						</div>
						{#if formValidation}
							{@render errors(formValidation.tasksError.get(taskInstance)?.deadline ?? [])}
						{/if}
					</div>
					<div>
						<div class="input input-label">
							<input
								class="input-style"
								placeholder=" "
								bind:value={taskInstance.budget}
							/>
							<label for="budget">Budget</label>
						</div>
						{#if formValidation}
							{@render errors(formValidation.tasksError.get(taskInstance)?.budget ?? [])}
						{/if}
					</div>
					<div>
						<Skills
							skillsIn={taskInstance.skills}
							addSkill={(skill) => taskInstance.addSkill(skill)}
							removeSkillAtIndex={(index) => taskInstance.removeSkillIndex(index)}
						></Skills>
						{#if formValidation}
							{@render errors(formValidation.tasksError.get(taskInstance)?.skills ?? [])}
						{/if}
					</div>
				</div>
			</div>
			<div class="act-task">
				<button
					class="cancel-btn"
					onclick={() => {
						tasks = tasks.filter((instance) => instance != taskInstance);
					}}>Remove</button
				>
			</div>
		</div>
	{/each}
{/snippet}
<div class="container">
	{@render createProject(projectIn)}
	{@render createTask()}
	{@render actions()}
</div>

<style>
	.task-container {
		display: grid;
		grid-template-columns: 4fr 2fr;
		gap: 1rem;
	}
	.flex-column {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		justify-content: stretch;
	}

	.input-style {
		width: 100%;
	}
	.new-container {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 1rem;

		.left {
			flex-grow: 4;
		}
		.right {
			flex-grow: 1;
		}
	}
	.action-buttons {
		display: flex;
		gap: 1rem;
		margin-left: auto;
		width: max-content;
	}

	.input > input {
		width: 100%;
	}

	.container {
		max-width: var(--page-width);
		margin: 1rem auto;
		width: 100%;
	}

	@media (width < 600px) {
		.task-container {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}
	}
</style>
