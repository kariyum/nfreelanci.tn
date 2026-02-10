<script lang="ts">
	import type { Snippet } from 'svelte';

	const {
		dialogBody,
		button
	}: {
		dialogBody: Snippet<[onClose: () => void, onSubmit: () => void]>;
		button: Snippet<[onOpen: () => void]>;
	} = $props();

	let dialog: HTMLDialogElement;

	const onClose = () => dialog.close();
	const onSubmit = () => dialog.close();
	const onOpen = () => dialog.showModal();
</script>

{@render button(onOpen)}

<dialog bind:this={dialog}>
	{@render dialogBody(onClose, onSubmit)}
</dialog>

<style>
	dialog {
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		padding: 1rem;
		min-width: 20%;
		border: 2px solid var(--border);
		border-radius: 15px;
		opacity: 1;
		transition-behavior: allow-discrete;
		background-color: var(--background-color);
	}

	dialog[open] {
		opacity: 1;
		transition: opacity 0.2s;
	}

	@starting-style {
		dialog[open] {
			opacity: 0;
		}
	}
</style>
