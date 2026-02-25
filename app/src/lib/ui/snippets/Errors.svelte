<script lang="ts">
	let { errors = [] }: { errors?: string[] } = $props();
</script>

{#if errors.length > 0}
	<div class="error-message">
		{#each errors as err}
			<div class="form-reason">{err}</div>
		{/each}
	</div>
{/if}
