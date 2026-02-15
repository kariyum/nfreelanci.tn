<script lang="ts">
	import LandingPage from '$lib/pages/LandingPage.svelte';
	import Projects from '$lib/components/project/Projects.svelte';
	let { data } = $props();
</script>

{#if data.user && data.projects.isOk()}
	{@const projects = data.projects.unwrap()}
	<div class="page-container">
		<Projects {projects}></Projects>
	</div>
{:else if data.userError?.unauthorizedError}
	<LandingPage></LandingPage>
{:else}
	<div>You seem to be offline...</div>
{/if}
