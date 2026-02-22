<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ProjectDetails from '$lib/components/project/ProjectDetails.svelte';

	const { data } = $props();
</script>

{#if data.project.isOk()}
	<div class="page-padding">
		<ProjectDetails
			projectIn={data.project.unwrap()}
			user={data.user}
			onEdit={async () => {
				if (document.startViewTransition) {
					document.startViewTransition(async () => {
						await goto(`/projects/${page.params.id}/edit`);
					});
				} else {
					await goto(`/projects/${page.params.id}/edit`);
				}
			}}
		/>
	</div>
{:else if data.project.error?.notFound}
	<div>Project not found</div>
{:else}
	<div>Something went wrong...</div>
{/if}
