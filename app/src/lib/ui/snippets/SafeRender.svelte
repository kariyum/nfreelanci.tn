<script lang="ts" generics="T">
	import type { FetchErrors } from '$lib/types';
	import type { Result } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		data: Result<T, FetchErrors>;
		component: Snippet<[T]>;
	}

	let { data, component }: Props = $props();
</script>

{#if data.isOk()}
	{@render component(data.unwrap())}
{:else if data.error?.unauthorizedError}
	<div>You are unauthorized to view this resource...</div>
{:else if data.error?.clientError}
	<div>Oups, client error...</div>
{:else if data.error?.notFound}
	<div>Resource unavailable!</div>
{:else if data.error?.parsingError}
	<div>Oups, parsing error...</div>
{:else if data.error?.networkError}
	<div>Oups, network error...</div>
{:else if data.error?.serverError}
	<div>Oups, server error...</div>
{:else if data.error?.timeoutError}
	<div>Oups, timeout error...</div>
{:else}
	<div>Oups, unknown error...</div>
{/if}
