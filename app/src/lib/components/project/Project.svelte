<script lang="ts">
	import type { ProjectGET } from '$lib/features/project/models';
	import { capitalize, formatBudget, formatDateSentence } from '$lib/utils';
	let { project }: { project: ProjectGET } = $props();

	function getRandomBgClass(id: number) {
		const classes = ['blue-bg', 'pink-bg', 'violet-bg', 'beige-bg'];
		return classes[id % classes.length];
	}
</script>

<div class="outer-container">
	<a
		href="/project/{project.id}"
		class="project {getRandomBgClass(
			project.content.length + project.title.length + (project.id ?? 0)
		)}"
	>
		<div class="project-top">
			<div class="date">{formatDateSentence(project.created_at)}</div>
		</div>
		<div class="title">{capitalize(project.title)}</div>
		<div class="content rich-content">
			{@html project.content}
		</div>
	</a>
	<div class="actions">
		<div class="price">
			<div class="currency"></div>
			<div>{formatBudget(project.budget)}</div>
		</div>
		<!-- <button>Post Job</button> -->
	</div>
</div>

<style>
	.currency {
		background-size: cover;
		width: 1.2rem;
		aspect-ratio: 38 / 40;
		scale: 0.4;
		line-height: 0;
		margin-top: 0;
		padding: 0;
		background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="38" height="40" viewBox="0 0 38 40" fill="none"> <g> <path d="M36.9988 18.4026C36.9988 18.4026 37.2532 18.1605 36.9988 18.4026L37.2532 15.2548C37.2532 15.2548 37.2532 15.0127 36.9988 15.0127H28.0947C27.8403 14.2862 27.5859 13.5598 27.3315 12.8334C25.2963 7.2642 20.9714 2.66354 15.3746 0H15.1202L14.3569 8.95917V9.20132C17.6642 10.1699 20.717 12.3491 22.7523 15.0127H7.48806C7.48806 15.0127 7.23366 15.0127 7.23366 15.2548V18.1605C7.23366 18.1605 7.23366 18.4026 7.48806 18.4026H24.7875C25.2963 19.3712 25.5507 20.3397 25.8051 21.3083H7.48806C7.48806 21.3083 7.23366 21.3083 7.23366 21.5504V24.4561C7.23366 24.4561 7.23366 24.6983 7.48806 24.6983H26.5683C26.8227 26.8775 27.0771 29.2989 27.0771 31.4782C27.0771 31.7203 26.8227 31.9625 26.5683 31.9625H7.74246C5.19843 32.2046 2.90881 30.7518 2.4 28.3304H1.12798C0.364774 30.5096 0.110367 32.6889 0.110367 34.8681C0.110367 36.321 1.12798 37.7738 2.4 38.5002C3.92642 39.4688 5.70724 40.1952 7.48806 39.9531H29.8755V31.7203C29.8755 29.0568 29.8755 26.8775 29.6211 24.4561H36.7444C36.7444 24.4561 36.9988 24.4561 36.9988 24.214V21.3083C36.9988 21.3083 36.9988 21.0662 36.7444 21.0662H29.3667C29.1123 20.0976 29.1123 19.129 28.8579 18.1605H36.9988V18.4026Z" fill="black" /> </g> <defs> <clipPath> <rect width="37.1429" height="40" fill="white" transform="translate(0.110367)" /> </clipPath> </defs> </svg>');

		:global(.dark) & {
			background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="38" height="40" viewBox="0 0 38 40" fill="none"> <g> <path d="M36.9988 18.4026C36.9988 18.4026 37.2532 18.1605 36.9988 18.4026L37.2532 15.2548C37.2532 15.2548 37.2532 15.0127 36.9988 15.0127H28.0947C27.8403 14.2862 27.5859 13.5598 27.3315 12.8334C25.2963 7.2642 20.9714 2.66354 15.3746 0H15.1202L14.3569 8.95917V9.20132C17.6642 10.1699 20.717 12.3491 22.7523 15.0127H7.48806C7.48806 15.0127 7.23366 15.0127 7.23366 15.2548V18.1605C7.23366 18.1605 7.23366 18.4026 7.48806 18.4026H24.7875C25.2963 19.3712 25.5507 20.3397 25.8051 21.3083H7.48806C7.48806 21.3083 7.23366 21.3083 7.23366 21.5504V24.4561C7.23366 24.4561 7.23366 24.6983 7.48806 24.6983H26.5683C26.8227 26.8775 27.0771 29.2989 27.0771 31.4782C27.0771 31.7203 26.8227 31.9625 26.5683 31.9625H7.74246C5.19843 32.2046 2.90881 30.7518 2.4 28.3304H1.12798C0.364774 30.5096 0.110367 32.6889 0.110367 34.8681C0.110367 36.321 1.12798 37.7738 2.4 38.5002C3.92642 39.4688 5.70724 40.1952 7.48806 39.9531H29.8755V31.7203C29.8755 29.0568 29.8755 26.8775 29.6211 24.4561H36.7444C36.7444 24.4561 36.9988 24.4561 36.9988 24.214V21.3083C36.9988 21.3083 36.9988 21.0662 36.7444 21.0662H29.3667C29.1123 20.0976 29.1123 19.129 28.8579 18.1605H36.9988V18.4026Z" fill="white" /> </g> <defs> <clipPath> <rect width="37.1429" height="40" fill="white" transform="translate(0.110367)" /> </clipPath> </defs> </svg>');
		}
	}

	.outer-container {
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		/* cursor: pointer; */
		border: 2px solid var(--border);
		border-radius: calc(10px + 0.5rem);
		min-height: 20rem;
	}

	@media (width < 45rem) {
		.outer-container {
			width: 100%;
		}
	}

	.content {
		margin-top: 1rem;
		max-height: 15ch;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.title {
		font-size: x-large;
		font-weight: 500;
	}

	.price {
		display: flex;
		font-weight: 500;
		font-size: large;
		margin-left: 0.5rem;
	}

	.actions {
		margin-top: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.date {
		border: 2px solid var(--border);
		background-color: var(--background-color);
		width: fit-content;
		padding: 0.3rem 0.7rem;
		border-radius: 20px;
	}

	.project {
		border-radius: 10px;
		padding: 1rem;
		height: 100%;
		text-decoration: none;
		color: inherit;
		display: flex;
		gap: 0.5rem;
		flex-direction: column;
	}
</style>
