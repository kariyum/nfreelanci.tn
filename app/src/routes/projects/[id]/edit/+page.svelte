<script lang="ts">
	import CreateProject from '$lib/components/project/CreateProject.svelte';

	const { data } = $props();
</script>

{#if data.project.isOk()}
	<div class="page-padding">
		<CreateProject projectIn={data.project.unwrap()} />
	</div>
{:else if data.project.error?.notFound}
	<div>Project not found</div>
{:else}
	<div>Something went wrong...</div>
{/if}
