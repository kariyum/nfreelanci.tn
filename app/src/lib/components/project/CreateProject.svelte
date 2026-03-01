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
	import DeleteButton from '$lib/ui/button/DeleteButton.svelte';

	let { projectIn }: { projectIn?: ProjectGET } = $props();
	let projectId = $derived(projectIn?.id);

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
	let commonDisabled: boolean = $state(false);

	async function onDoneSubmit() {
		if (projectId) {
			return goto(`/projects/${projectId}`, {
				invalidate: [`/api/projects/${projectId}`]
			});
		} else {
			return goto('/');
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		const payloadOrFormErrors = projectService.constructPostPutPayload(projectFormInput, tasks);
		if (payloadOrFormErrors.isErr()) {
			formValidation = payloadOrFormErrors.error!;
			return payloadOrFormErrors;
		}
		const payload = payloadOrFormErrors.unwrap();
		if (projectId) {
			return projectClient(fetch).put(projectId, payload);
		} else {
			return projectClient(fetch).post(payload);
		}
	}
</script>

{#snippet projectForm()}
	{#if projectIn}
		<h2>Update your project</h2>
	{:else}
		<h2>Create a new project</h2>
	{/if}
	<ProjectForm bind:projectFormInput {formValidation}></ProjectForm>
{/snippet}

{#snippet actions()}
	<div style="width: 100%; margin-top: 1rem;">
		<div class="action-buttons">
			<button disabled={commonDisabled} class="cancel-btn" onclick={() => history.back()}
				>Cancel</button
			>
			{#if projectId}
				<DeleteButton
					onclick={() => projectService.deleteProject(projectId)}
					ondone={() => goto('/', { invalidate: ['/api/projects'] })}
					bind:disableOtherActions={commonDisabled}
				></DeleteButton>
			{/if}
			<AsyncButton
				onclick={(event) => handleSubmit(event)}
				ondone={() => onDoneSubmit()}
				bind:disableOtherActions={commonDisabled}
			>
				{#snippet idleView()}
					<div>{projectIn ? 'Update Project' : 'Save Project'}</div>
				{/snippet}
				{#snippet loading()}
					<div>
						{#if projectIn}
							Updating...
						{:else}
							Creating...
						{/if}
					</div>
				{/snippet}
				{#snippet endView()}
					<div>
						{#if projectIn}
							Updated!
						{:else}
							Created!
						{/if}
					</div>
				{/snippet}
			</AsyncButton>
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
	{@render projectForm()}
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
