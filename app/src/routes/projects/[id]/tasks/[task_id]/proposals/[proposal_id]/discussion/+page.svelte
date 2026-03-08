<script lang="ts">
	import Discussion from '$lib/components/conversation/Discussion.svelte';

	let { data } = $props();
</script>

{#if data.task && data.proposal && data.user}
	<Discussion
		discussionId={data.discussionId}
		messages={data.messages}
		proposal={data.proposal}
		receivers={data.receivers}
		task={data.task}
		user={data.user}
	></Discussion>
{:else}
	<div>404 NOT FOUND!</div>
{/if}
