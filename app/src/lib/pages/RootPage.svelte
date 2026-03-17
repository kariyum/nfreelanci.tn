<script lang="ts">
	import Projects from '$lib/components/project/Projects.svelte';
	import type { ProjectGET } from '$lib/features/project/models';
	import type { FetchResult } from '$lib/utils';
	let { projects }: { projects: FetchResult<ProjectGET[]> } = $props();
</script>

{#if projects.isOk()}
	<div class="page-container">
		<Projects projects={projects.unwrap()}></Projects>
	</div>
{/if}
