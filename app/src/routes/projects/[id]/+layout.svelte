<script lang="ts">
	import { page } from '$app/state';
	import { ChevronRight } from 'lucide-svelte';

	let { children } = $props();
</script>

{#snippet breadcrumbs()}
	{#if !page.url.pathname.endsWith('discussion')}
		<div style="margin: 1rem;">
			<div class="links">
				<div class="link">
					<a href="/">Projects</a>
					<ChevronRight size="16" />
					{#if page.params.task_id}
						<a href="/projects/{page.params.id}">{page.params.id}</a>
					{:else}
						<div>{page.params.id}</div>
					{/if}
				</div>
				{#if page.params.task_id}
					<div class="link">
						<ChevronRight size="16" />
						<a href="/projects/{page.params.id}">Tasks</a>
						<ChevronRight size="16" />
						<a href="/projects/{page.params.id}/tasks/{page.params.task_id}"
							>{page.params.task_id}</a
						>
					</div>
				{/if}
			</div>
		</div>
	{/if}
{/snippet}

{@render breadcrumbs()}
{@render children()}

<style>
	a {
		text-decoration: none;
		color: inherit;
	}

	.links {
		color: var(--sub-title);
		max-width: var(--page-width);
		display: flex;
		margin: auto;
		view-transition-name: links;
		gap: 0.5rem;
	}

	.link {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		> :last-child {
			color: var(--font-color);
		}
	}

	@media (width < 600px) {
		.links {
			margin: 0;
		}
	}
</style>
