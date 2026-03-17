<script lang="ts">
	import LandingPage from '$lib/pages/LandingPage.svelte';
	import RootPage from '$lib/pages/RootPage.svelte';
	import { UnauthorizedError } from '$lib/utils';
	let { data } = $props();
</script>

{#if data.user.isOk()}
	<RootPage projects={data.projects}></RootPage>
{:else if data.user.error instanceof UnauthorizedError}
	<LandingPage></LandingPage>
{:else}
	<div>You seem to be offline...</div>
{/if}
