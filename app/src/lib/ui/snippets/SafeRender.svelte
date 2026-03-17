<script lang="ts" generics="T">
	import {
		ClientError,
		NetworkError,
		NotFound,
		ParsingError,
		ServerError,
		TimeoutError,
		UnauthorizedError,
		type FetchResult
	} from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		data: FetchResult<T>;
		component: Snippet<[T]>;
	}

	let { data, component }: Props = $props();
</script>

{#if data.isOk()}
	{@render component(data.unwrap())}
{:else if data.error instanceof UnauthorizedError}
	<div>You are unauthorized to view this resource...</div>
{:else if data.error instanceof ClientError}
	<div>Oups, client error...</div>
{:else if data.error instanceof NotFound}
	<div>404 Resource Not Found!</div>
{:else if data.error instanceof ParsingError}
	<div>Oups, parsing error...</div>
{:else if data.error instanceof NetworkError}
	<div>Network error, you seem to be offline...</div>
{:else if data.error instanceof ServerError}
	<div>Oups, server error...</div>
{:else if data.error instanceof TimeoutError}
	<div>Oups, timeout error...</div>
{:else}
	<div>Oups, unknown error...</div>
{/if}
