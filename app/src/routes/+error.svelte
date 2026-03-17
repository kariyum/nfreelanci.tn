<script lang="ts">
	import { page } from '$app/state';
	import Error from '$lib/pages/Error.svelte';
</script>

<Error status={page.status} message={page.error?.message}></Error>
