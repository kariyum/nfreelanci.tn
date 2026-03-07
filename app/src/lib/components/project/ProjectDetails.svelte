<script lang="ts">
	import type { User } from '$lib/features/auth/client';
	import type { ProjectGET } from '$lib/features/project/models';
	import { formatBudget, formatDateSentence } from '$lib/utils';
	import { SquarePen } from 'lucide-svelte';
	import Tasks from '../task/TasksList.svelte';

	interface props {
		projectIn: ProjectGET;
		user?: User;
		onEdit: () => void;
	}
	let { projectIn, user, onEdit }: props = $props();
	let userIsCreator = $derived(user?.email == projectIn.user_id);
</script>

<div class="container">
	<div class="sub-container">
		<div class="header">
			<h1>{projectIn.title}</h1>
			{#if userIsCreator}
				<button onclick={onEdit} class="button-icon"><SquarePen size="14" />Edit</button>
			{/if}
		</div>
		<div class="body">
			<div class="column" style="flex-grow: 5;">
				<div class="card card-padding">
					<h2>Description</h2>
					{#if projectIn.content.length === 0}
						<span>No content for this project</span>
					{:else}
						<span>{@html projectIn.content}</span>
					{/if}
				</div>
				<h2>Tasks ({projectIn.tasks?.length || 0})</h2>
				<div>
					<Tasks tasks={projectIn.tasks ?? []}></Tasks>
				</div>
			</div>
			<div class="column" style="flex-grow: 1;">
				<div class="card card-padding">
					<h2>Details</h2>
					<div class="detail">
						<span>Creator</span>
						<span>{projectIn.user_id}</span>
					</div>
					<div class="detail">
						<span>Created On</span>
						<span>{formatDateSentence(projectIn.created_at)}</span>
					</div>
					<div class="detail">
						<span>Project ID</span>
						<span>{projectIn.id}</span>
					</div>
				</div>
				<div class="card card-padding">
					<h2>Key Information</h2>
					<div class="information">
						<span>Deadline</span>
						<span>{formatDateSentence(projectIn.deadline)}</span>
					</div>
					<div class="information">
						<span>Budget</span>
						<span>{formatBudget(projectIn.budget)}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	:global(ol) {
		margin-left: 2rem;
	}
	.information {
		span:first-child {
			color: var(--sub-title);
		}
		span:last-child {
			display: block;
			font-size: medium;
		}
	}

	.detail {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		flex-wrap: wrap;
		> span:first-child {
			color: var(--sub-title);
		}
	}
	.column {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	@media (width >= 600px) {
		.body {
			display: grid;
			grid-template-columns: 5fr 2fr;
			column-gap: 2rem;
			row-gap: 2rem;
		}
	}

	@media (width < 600px) {
		.body {
			margin-top: 1rem;
			display: flex;
			gap: 2rem;
			flex-direction: column-reverse;
		}
	}
	.button-icon {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		height: fit-content;
		padding: 0.5rem 0.8rem;
		font-size: medium;
	}

	.header {
		display: flex;
		justify-content: space-between;
	}

	.container {
		margin-top: 1rem;
	}

	.sub-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: var(--page-width);
		margin: auto;
	}
</style>
