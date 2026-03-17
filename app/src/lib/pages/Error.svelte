<script lang="ts">
	let { status, message }: { status: number; message?: string } = $props();
</script>

{#if status == 401}
	<div>🖐️ You are unauthorized to view this resource, please login...</div>
{:else if message && message.trim().length > 0}
	<div>
		{status}
		{message}
	</div>
{:else}
	<div>Unrecoverable error occured! please refresh the page...</div>
{/if}
