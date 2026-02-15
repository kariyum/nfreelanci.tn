<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Project from '$lib/components/project/Project.svelte';
	import type { ProjectGET } from '$lib/features/project/models';
	import { untrack } from 'svelte';
	let { projects }: { projects: ProjectGET[] } = $props();

	let searchQuery = $state(page.url.searchParams.get('q') || '');
	let searchedQuery: string = $state(page.url.searchParams.get('q') || '');
	let timeout: number | undefined = undefined;

	$effect(() => {
		searchQuery;
		searchedQuery;
		if (searchedQuery != searchQuery) {
			untrack(() => {
				if (timeout === undefined) {
					timeout = setTimeout(async () => {
						searchedQuery = searchQuery;
						const url = searchQuery.trim().length == 0 ? `/projects` : `/projects?q=${searchQuery}`;
						await goto(url, { keepFocus: true, replaceState: true });
						timeout = undefined;
					}, 1000);
				}
			});
		}
	});
</script>

<div class="outer-container">
	<input
		autofocus={page.url.searchParams.get('q') ? true : false}
		type="text"
		name="search"
		id="search"
		placeholder="Type to search products and tasks..."
		bind:value={searchQuery}
	/>
	<h3 style="view-transition-name: header3;">Available Projects</h3>
	<div>
		{#if projects.length === 0}
			<p>Sorry for the inconvenience, no projects were found.</p>
		{:else}
			<div class="container">
				{#each projects as project}
					<Project {project} />
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	input {
		max-width: 40rem;
		width: 100%;
		margin-bottom: 1rem;
		view-transition-name: input-element;
	}
	.outer-container {
		margin: auto;
	}
	.container {
		margin-top: 1rem;
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	@media (width > 600px) {
		.container {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
