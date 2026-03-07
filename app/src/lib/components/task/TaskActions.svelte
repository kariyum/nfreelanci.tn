<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SquarePen } from 'lucide-svelte';
</script>

<div class="column">
	<div class="card">
		<h2 style="padding: 1rem; padding-bottom:0;">Task Actions</h2>
		<div class="actions">
			<button
				class="row"
				onclick={async () => {
					await goto(`/projects/${page.params.id}/edit`);
				}}
			>
				<div class="icon">
					<SquarePen />
				</div>
				<div class="btn-text">
					<div>Edit Task</div>
					<div>Change task details or content</div>
				</div>
			</button>
			<!-- <button>Close Task</button> -->
		</div>
	</div>
</div>

<style>
	.column {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	.actions {
		> button:first-child {
			border-bottom: 0;
		}
		> button:last-child {
			border-top: 0;
			border-radius: 0 0 15px 15px;
		}
		> button {
			width: 100%;
			border-radius: 0;
		}
	}
	.row {
		display: flex;
		gap: 1rem;
	}
	.btn-text {
		text-align: left;

		> div:last-child {
			color: var(--sub-title);
		}
	}
</style>
