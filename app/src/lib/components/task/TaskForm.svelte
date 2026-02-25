<script lang="ts">
	import type { ProjectFormValidation } from '$lib/features/project/models';
	import Errors from '$lib/ui/snippets/Errors.svelte';
	import RichTextEditor from '$lib/ui/texteditor/RichTextEditor.svelte';
	import Skills from '../skills/Skills.svelte';
	import type { TaskClass } from './states.svelte';

	interface Props {
		taskInstance: TaskClass;
		onRemove: () => void;
		formValidation?: ProjectFormValidation;
	}
	let { taskInstance = $bindable(), formValidation, onRemove }: Props = $props();
</script>

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
				<Errors errors={formValidation?.tasksError.get(taskInstance)?.title}></Errors>
			</div>
			<div>
				<RichTextEditor bind:x={taskInstance.content} label={'Task Description'}></RichTextEditor>
				<Errors errors={formValidation?.tasksError.get(taskInstance)?.content}></Errors>
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
				<Errors errors={formValidation?.tasksError.get(taskInstance)?.deadline}></Errors>
			</div>
			<div>
				<div class="input input-label">
					<input class="input-style" placeholder=" " bind:value={taskInstance.budget} />
					<label for="budget">Budget</label>
				</div>
				<Errors errors={formValidation?.tasksError.get(taskInstance)?.budget}></Errors>
			</div>
			<div>
				<Skills
					skillsIn={taskInstance.skills}
					addSkill={(skill) => taskInstance.addSkill(skill)}
					removeSkillAtIndex={(index) => taskInstance.removeSkillIndex(index)}
				></Skills>
				<Errors errors={formValidation?.tasksError.get(taskInstance)?.skills}></Errors>
			</div>
		</div>
	</div>
	<div class="act-task">
		<button class="cancel-btn" onclick={onRemove}>Remove</button>
	</div>
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

	.input > input {
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
