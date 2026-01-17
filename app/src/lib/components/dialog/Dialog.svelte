<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fly } from 'svelte/transition';

	const {
		title,
		dialogBody
	}: {
		title: String;
		dialogBody: Snippet<[onClose: () => void, onSubmit: () => void]>;
	} = $props();

	let dialog: HTMLDialogElement;

	const onClose = () => dialog.close();
	const onSubmit = () => dialog.close();
</script>

<button onclick={() => dialog.showModal()}>{title}</button>
<dialog bind:this={dialog}>
	{@render dialogBody(onClose, onSubmit)}
</dialog>

<style>
	dialog {
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		padding: 1rem;
		min-width: 30%;
		min-height: 30%;
		border: 2px solid var(--border);
		border-radius: 15px;
		opacity: 1;
		transition-behavior: allow-discrete;
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
