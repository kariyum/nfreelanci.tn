<script lang="ts">
	import CreateProject from '$lib/components/project/CreateProject.svelte';

	const { data } = $props();
</script>

<div class="page-padding">
	<CreateProject projectIn={data.project} />
</div>
