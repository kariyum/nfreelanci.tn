<script lang="ts">
	import Dialog from '$lib/ui/dialog/Dialog.svelte';
	import Input from '$lib/ui/input/Input.svelte';
	import Textarea from '$lib/ui/input/Textarea.svelte';

	let budget = $state('4');
	let content = $state('');
</script>

{#snippet editDialog(onClose: () => void, onSubmit: () => void)}
	<h2>Edit Proposal</h2>
	<Input label="Budget" bind:value={budget} required={true}></Input>
	<Textarea label="Content" bind:value={content} required={true}></Textarea>
	<button onclick={onClose}>Close</button>
	<button onclick={onSubmit}>Submit</button>
{/snippet}

<Dialog title="Edit" dialogBody={editDialog}></Dialog>
