<script lang="ts">
	import { goto } from '$app/navigation';
	import { TaskClass } from '$lib/components/task/states.svelte';
	import { projectClient } from '$lib/features/project/client';
	import type {
		ProjectFormType,
		ProjectFormValidation,
		ProjectGET
	} from '$lib/features/project/models';
	import { projectService } from '$lib/features/project/service';
	import { Plus } from 'lucide-svelte';
	import AsyncButton from '../../ui/button/AsyncButton.svelte';
	import TaskForm from '../task/TaskForm.svelte';
	import ProjectForm from './ProjectForm.svelte';

	let { projectIn }: { projectIn?: ProjectGET } = $props();

	let projectFormInput: ProjectFormType = $derived.by(() => {
		let projectState = $state({
			title: projectIn?.title ?? '',
			content: projectIn?.content ?? '',
			budget: projectIn?.budget ?? 0,
			deadline: projectIn?.deadline.toLocaleDateString('en-CA') ?? ''
		});
		return projectState;
	});

	let tasks: TaskClass[] = $derived(
		projectIn?.tasks?.map((task) => TaskClass.fromGET(task)) ?? ([] as TaskClass[])
	);
	let formValidation: ProjectFormValidation | undefined = $state(undefined);

	async function handleSubmit(event: Event) {
		event.preventDefault();
		const payloadOrFormErrors = projectService.constructPostPutPayload(projectFormInput, tasks);
		if (payloadOrFormErrors.isErr()) {
			formValidation = payloadOrFormErrors.error!;
			return;
		}
		const payload = payloadOrFormErrors.unwrap();
		if (projectIn?.id) {
			const response = await projectClient(fetch).put(projectIn.id, payload);
			if (response.isOk()) {
				return await goto(`/projects/${projectIn.id}`, {
					invalidate: [`/api/projects/${projectIn.id}`]
				});
			}
		} else {
			const response = await projectClient(fetch).post(payload);
			if (response.isOk()) {
				return await goto('/');
			}
		}
	}
</script>

{#snippet deleteButton()}
	<div>Delete Project</div>
{/snippet}
{#snippet submitButton()}
	<div>{projectIn ? 'Update Project' : 'Save Project'}</div>
{/snippet}
{#snippet endView()}
	Done!
{/snippet}

{#snippet actions()}
	<div style="width: 100%; margin-top: 1rem;">
		<div class="action-buttons">
			<button class="cancel-btn" onclick={() => history.back()}>Cancel</button>
			{#if projectIn?.id}
				<AsyncButton
					--color="var(--vibrant-red)"
					--width="fit-content"
					--hover-color="hsl(0, 50%, 35%)"
					idleView={deleteButton}
					{endView}
					onclick={() => projectService.deleteProject(projectIn!.id!)}
				/>
			{/if}
			<AsyncButton idleView={submitButton} {endView} onclick={(event) => handleSubmit(event)} />
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
					tasks = [...tasks, new TaskClass()];
				}}><Plus size="16" /> Add Task</button
			>
		</div>
	</div>
	{#if tasks.length == 0}
		<div>No tasks were added to this project yet</div>
	{/if}
	{#each tasks as taskInstance, i}
		<TaskForm
			{formValidation}
			bind:taskInstance={tasks[i]}
			onRemove={() => (tasks = tasks.filter((instance) => instance != taskInstance))}
		/>
	{/each}
{/snippet}

<div class="container">
	<ProjectForm bind:projectIn {formValidation}></ProjectForm>
	{@render createTask()}
	{@render actions()}
</div>

<style>
	.action-buttons {
		display: flex;
		gap: 1rem;
		margin-left: auto;
		width: max-content;
	}

	.container {
		max-width: var(--page-width);
		margin: 1rem auto;
		width: 100%;
	}
</style>
