<script lang="ts">
	import LandingPage from '$lib/pages/LandingPage.svelte';
	import RootPage from '$lib/pages/RootPage.svelte';
	let { data } = $props();
</script>

{#if data.user}
	<RootPage projects={data.projects}></RootPage>
{:else if data.userError?.unauthorizedError}
	<LandingPage></LandingPage>
{:else}
	<div>You seem to be offline...</div>
{/if}
