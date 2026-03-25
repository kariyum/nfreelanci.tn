<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { proposalsClient } from '$lib/features/proposals/client';
	import AsyncButton from '$lib/ui/button/AsyncButton.svelte';
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
	let commonDisabled = $state(false);

	async function submitHandler() {
		return proposalsClient(fetch).updateProposal(proposalId, content, budget);
	}
</script>

<Dialog --width="35rem" --height="25rem">
	{#snippet button(onOpen: () => void)}
		<button class="open-btn" onclick={() => onOpen()}>Edit</button>
	{/snippet}
	{#snippet dialogBody(onClose: () => void, onSubmit: () => void)}
		<div style="display: flex; flex-direction: column; height:100%;">
			<h2>Edit Proposal</h2>
			<Input label="Budget" type="number" bind:value={budget} required={true} margin="1.2rem"
			></Input>
			<div style="flex-grow: 1;">
				<Textarea label="Content" bind:value={content} required={true}></Textarea>
			</div>
			<div class="actions">
				<button disabled={commonDisabled} class="cancel-btn" onclick={onClose}>Close</button>
				<AsyncButton
					--width="fit-content"
					onclick={async () => (await submitHandler()).toResult()}
					ondone={async () => {
						await invalidate(`/api/projects/${page.params.id}`);
						onSubmit();
					}}
					bind:disableOtherActions={commonDisabled}
				>
					{#snippet idleView()}
						<div>Edit</div>
					{/snippet}
					{#snippet loading()}
						<div>Editing...</div>
					{/snippet}
					{#snippet endView()}
						<div>Edited!</div>
					{/snippet}
				</AsyncButton>
			</div>
		</div>
	{/snippet}
</Dialog>

<style>
	.actions {
		width: max-content;
		margin-left: auto;
		margin-top: 0.5rem;
		display: flex;
		gap: 0.5rem;
	}

	.open-btn {
		width: 100%;
		border: 0px;
		border-radius: 0px;
	}
</style>
