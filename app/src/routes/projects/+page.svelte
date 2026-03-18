<script lang="ts">
	import Projects from '$lib/components/project/Projects.svelte';
	let { data } = $props();
</script>

<div class="container">
	<Projects projects={data.projects}></Projects>
</div>

<style>
	.container {
		padding: 1rem;
		margin: auto;
		max-width: var(--max-width);
	}
</style>
