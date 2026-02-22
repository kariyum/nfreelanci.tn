<script lang="ts">
	import { page } from '$app/state';
	import type { TaskGET } from '$lib/features/task/models';
	import { snakeToCapital, formatDateSentence, formatBudget } from '$lib/utils';
	import { UserRound, Calendar, HandCoins } from 'lucide-svelte';

	let { tasks }: { tasks: TaskGET[] } = $props();
	let sortedTasks = $derived(tasks.sort((a, b) => a.id - b.id));
</script>

{#if tasks.length !== 0}
	<div class="tasks-container">
		{#each sortedTasks as task}
			<a
				class="reset card task hover-effect"
				id={task.id.toString()}
				href={`/projects/${page.params.id}/tasks/${task.id}`}
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
							<a href={`/projects/${projectIn.id}/tasks/${task.id}`}>View</a>
						</div>
					{/if} -->
			</a>
		{/each}
	</div>
{:else}
	<div>No tasks are available for this project yet!</div>
{/if}

<style>
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

	.padding-no-buttom {
		padding: 1rem 1rem 0rem 1rem;
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
</style>
