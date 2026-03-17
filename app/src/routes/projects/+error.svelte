<script>
	import { page } from '$app/state';
	import Error from '$lib/pages/Error.svelte';
</script>

<div class="page">
	<div class="container">
		<Error status={page.status} message={page.error?.message}></Error>
	</div>
</div>

<style>
	.container {
		padding: 1rem;
		margin: auto;
		max-width: var(--max-width);
	}
</style>
