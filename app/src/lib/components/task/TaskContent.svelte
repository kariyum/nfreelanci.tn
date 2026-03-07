<script lang="ts">
	import type { TaskGET } from '$lib/features/task/models';

	interface Props {
		task: TaskGET;
	}
	let { task }: Props = $props();
</script>

<div class="column">
	<div class="card card-padding">
		<h2>Task Content</h2>
		{@html task.content}
	</div>
	<div class="card card-padding">
		<h2>Details</h2>
		<div class="details">
			<div class="detail">
				<span>Assignee</span>
				<span>
					{#if task.assignee_id}
						{task.assignee_id}
					{:else}
						Not Assinged
					{/if}
				</span>
			</div>
			<div class="detail">
				<span>Deadline</span>
				<span>{task.deadline.toDateString()}</span>
			</div>
			<div class="detail">
				<span>Budget</span>
				<span>{task.budget}</span>
			</div>
			<div class="detail">
				<span>Required Skills</span>
				<div class="flex-row">
					{#if task.skills.length === 0}
						<div>No skills required.</div>
					{:else}
						{#each task.skills as skill}
							<div class="skill">{skill}</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.flex-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.details {
		display: grid;
		grid-template-columns: 1fr 1fr;
		row-gap: 1rem;
		column-gap: 1rem;
	}
	.detail {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;

		> span:first-child {
			color: var(--sub-title);
		}
	}
	.column {
		display: flex;
		flex-direction: column;
		gap: 2rem;
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
