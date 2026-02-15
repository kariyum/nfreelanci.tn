<script lang="ts">
	import Projects from '$lib/components/project/Projects.svelte';
	let { data } = $props();
</script>

{#if data.projects.isOk()}
	<div class="container">
		<Projects projects={data.projects.unwrap()}></Projects>
	</div>
{:else}
	<div>Oupsie... failed to serve your request.</div>
{/if}

<style>
	.container {
		padding: 1rem;
		margin: auto;
		max-width: var(--max-width);
	}
</style>
