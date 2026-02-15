<script lang="ts">
	import { invalidate } from '$app/navigation';
	import type { User } from '$lib/features/auth/apis';
	import type { ProjectGET } from '$lib/features/project/models';
	import { formatBudget, formatDate, formatDateSentence, snakeToCapital } from '$lib/utils';
	import { Calendar, HandCoins, SquarePen, UserRound } from 'lucide-svelte';

	interface props {
		projectIn: ProjectGET;
		user?: User;
		onEdit: () => void;
	}
	let { projectIn, user, onEdit }: props = $props();
	let userIsCreator = $derived(user?.email == projectIn.user_id);
</script>

{#snippet tasksSnippet()}
	{#if projectIn.tasks?.length !== 0}
		<div class="tasks-container">
			{#each projectIn.tasks?.sort((a, b) => a.id - b.id) ?? [] as task}
				<a
					class="reset card task hover-effect"
					id={task.id.toString()}
					href={`/project/${projectIn.id}/task/${task.id}`}
				>
					<div class="padding-no-buttom">
						<div class="detail">
							<h3>{task.title}</h3>
							<div class="status" data-type={task.status}>
								{snakeToCapital(task.status)}
							</div>
						</div>
						<div class="task-content rich-content">
							{#if task.content.length === 0}
								<div>No content for this task</div>
							{:else}
								{@html task.content}
							{/if}
						</div>
						<div class="icons">
							<div>
								<UserRound size="14" />
								{task.assignee_id}
							</div>
							<div>
								<Calendar size="14" />
								{formatDateSentence(task.created_at)}
							</div>
							<div>
								<HandCoins size="14" />
								{formatBudget(task.budget)}
							</div>
						</div>
					</div>
					<div class="skills">
						<span>Skills: </span>
						<div class="flex-row" style="flex-wrap: wrap;">
							{#if task.skills.length === 0}
								<div>No skills required.</div>
							{:else}
								{#each task.skills as skill}
									<div class="skill">{skill}</div>
								{/each}
							{/if}
						</div>
					</div>

					<!-- {#if user?.role === 'freelancer'}
						<button
							class="apply-btn"
							disabled={task.proposal_status != undefined}
							data-status={task.proposal_status}
							onclick={() => submitApplication(task.id)}
						>
							{#if task.proposal_status}
								Application {snakeToCapital(task.proposal_status)}
							{:else}
								Submit Application
							{/if}
						</button>
					{:else if user?.role === 'recruiter' && userIsCreator}
						<div class="view-link">
							<a href={`/project/${projectIn.id}/task/${task.id}`}>View</a>
						</div>
					{/if} -->
				</a>
			{/each}
		</div>
	{:else}
		<div>No tasks are available for this project yet!</div>
	{/if}
{/snippet}

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
					{@render tasksSnippet()}
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
	.flex-row {
		display: flex;
		gap: 0.5rem;
	}
	.reset {
		color: unset;
		text-decoration: unset;
	}
	.hover-effect:hover {
		background-color: var(--hover-color);
	}
	.icons {
		display: flex;
		justify-content: start;
		align-items: center;
		gap: 1.5rem;
		> div {
			display: flex;
			align-items: center;
			gap: 0.5rem;
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

	.padding-no-buttom {
		padding: 1rem 1rem 0rem 1rem;
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
	.view-link {
		width: 100%;

		a {
			display: block;
			width: fit-content;
			margin-left: auto;
		}
	}

	.header {
		display: flex;
		justify-content: space-between;
	}

	.apply-btn {
		background-color: var(--blue);
	}

	.apply-btn[data-status='pending'] {
		background-color: var(--orange);
	}
	.apply-btn[data-status='declined'] {
		background-color: unset;
	}
	.apply-btn[data-status='approved'] {
		background-color: var(--green);
	}
	.apply-btn[data-status='cancelled'] {
		background-color: var(--grey);
	}

	.task-content {
		margin: 1rem 0;
	}

	.tasks-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.skills {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-radius: 0 0 15px 15px;
		padding: 0.5rem 1rem;
		min-height: 3rem;
		background-color: var(--secondary);

		> span {
			color: var(--sub-title);
		}
	}

	.skill {
		background-color: var(--tag-bg);
		padding: 0.5rem 0.8rem;
		align-items: center;
		border-radius: 50px;
		width: fit-content;
		line-height: 1rem;
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

	.content {
		margin: 0.5rem 0 0.5rem 0;
		border-radius: 5px;
	}
</style>
