<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import Dialog from '$lib/ui/dialog/Dialog.svelte';
	import Input from '$lib/ui/input/Input.svelte';
	import Textarea from '$lib/ui/input/Textarea.svelte';

	let {
		proposalId,
		inContent,
		inBudget
	}: { proposalId: number; inContent?: string; inBudget?: number } = $props();

	let budget = $derived(inBudget?.toString() ?? '');
	let content = $derived(inContent ?? '');

	async function updateProposal(proposalId: number, content: string, budget: string) {
		const payload = {
			content: content,
			budget: parseFloat(budget)
		};
		const result = await fetch(`/api/proposals/${proposalId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});
		return result;
	}

	async function submitHandler(dialogSubmitHandler: () => void) {
		const response = await updateProposal(proposalId, content, budget);
		if (response.status == 200) {
			await invalidate(`/api/projects/${page.params.id}`);
			dialogSubmitHandler();
		}
	}
</script>

<Dialog>
	{#snippet button(onOpen: () => void)}
		<button class="open-btn" onclick={() => onOpen()}>Edit</button>
	{/snippet}
	{#snippet dialogBody(onClose: () => void, onSubmit: () => void)}
		<h2>Edit Proposal</h2>
		<Input label="Budget" bind:value={budget} required={true}></Input>
		<Textarea label="Content" bind:value={content} required={true}></Textarea>
		<div class="actions">
			<button class="cancel-btn" onclick={onClose}>Close</button>
			<button onclick={async () => await submitHandler(onSubmit)}>Submit</button>
		</div>
	{/snippet}
</Dialog>

<style>
	.actions {
		width: max-content;
		margin-left: auto;
	}

	.open-btn {
		width: 100%;
		border: 0px;
		border-radius: 0px;
	}
</style>
