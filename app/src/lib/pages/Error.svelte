<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let { status, message }: { status: number; message?: string } = $props();

	let isUserDefined: boolean = $derived(page.data.user.isOk());

	onMount(async () => {
		if (status === 401 && isUserDefined) {
			await invalidate('/api/auth/whoami');
		}
	});
</script>

{#if status === 401}
	<div>
		🖐️ You are unauthorized to view this resource, please <a href={resolve('/login')}>login..</a>.
	</div>
{:else if message && message.trim().length > 0}
	<div>
		{status}
		{message}
	</div>
{:else}
	<div>Unrecoverable error occured! please refresh the page...</div>
{/if}
