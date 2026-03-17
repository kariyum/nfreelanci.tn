<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ProjectDetails from '$lib/components/project/ProjectDetails.svelte';

	const { data } = $props();
</script>

<div class="page-padding">
	<ProjectDetails
		projectIn={data.project}
		user={data.user}
		onEdit={async () => {
			await goto(resolve(`/projects/${page.params.id}/edit`));
		}}
	/>
</div>
