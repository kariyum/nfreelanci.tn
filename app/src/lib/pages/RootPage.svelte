<script lang="ts">
	import Projects from '$lib/components/project/Projects.svelte';
	import type { ProjectGET } from '$lib/features/project/models';
	import type { FetchErr, FetchOk } from '$lib/utils';
	let { projects }: { projects: FetchOk<ProjectGET[]> | FetchErr } = $props();
</script>

{#if projects.isOk()}
	<div class="page-container">
		<Projects projects={projects.value}></Projects>
	</div>
{/if}
