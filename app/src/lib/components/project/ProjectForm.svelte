<script lang="ts">
	import type {
		ProjectFormType,
		ProjectFormValidation,
		ProjectGET
	} from '$lib/features/project/models';
	import Errors from '$lib/ui/snippets/Errors.svelte';
	import RichTextEditor from '$lib/ui/texteditor/RichTextEditor.svelte';

	let {
		projectFormInput = $bindable(),
		formValidation
	}: { projectFormInput: ProjectFormType; formValidation?: ProjectFormValidation } = $props();
</script>

<div class="new-container">
	<div class="left">
		<div class="card card-padding">
			<h2 style="margin-bottom: 0.2rem;">Project Details</h2>
			<div>
				<div class="input input-label">
					<input type="text" id="title" placeholder=" " bind:value={projectFormInput.title} />
					<label for="title">Project Title</label>
				</div>
				<Errors errors={formValidation?.projectErrors.title}></Errors>
				<div style="margin-top: 1.5rem;"></div>
				<div>
					<RichTextEditor bind:x={projectFormInput.content} label={'Project Description'}
					></RichTextEditor>
					<Errors errors={formValidation?.projectErrors.content}></Errors>
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
				<Errors errors={formValidation?.projectErrors.budget}></Errors>
			</div>

			<div>
				<div class="input input-label">
					<input type="date" id="deadline" placeholder=" " bind:value={projectFormInput.deadline} />
					<label for="">Deadline</label>
				</div>
				<Errors errors={formValidation?.projectErrors.deadline}></Errors>
			</div>
		</div>
	</div>
</div>

<style>
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

	.input > input {
		width: 100%;
	}
</style>
