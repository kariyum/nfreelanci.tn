<script lang="ts">
	import Discussion from '$lib/components/conversation/Discussion.svelte';

	let { data } = $props();
</script>

<Discussion {...data}></Discussion>
