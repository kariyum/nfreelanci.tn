<script>
	import { resolve } from '$app/paths';
	import ThemeToggler from '$lib/components/utility/ThemeToggler.svelte';
</script>

<div class="navbar" style="view-transition-name: header">
	<!-- svelte-ignore a11y_consider_explicit_label -->
	<a class="left-group" href={resolve('/')}>
		<div class="logo"></div>
	</a>

	<div class="right-group">
		<a href={resolve('/projects')}>View Projects</a>
		<div>
			<ThemeToggler></ThemeToggler>
		</div>
		<a href={resolve('/login')}>
			<button class="primary-btn">Login</button>
		</a>
	</div>
</div>

<style>
	a {
		text-decoration: none;
		color: inherit;
	}
	.navbar {
		display: flex;
		flex-direction: row nowrap;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1rem 0 1rem;
		> * {
			flex-grow: 1;
		}

		.left-group,
		.right-group {
			display: flex;
			flex-direction: row;
			gap: 1rem;
			align-items: center;
		}

		.right-group {
			justify-content: end;
		}
	}

	.logo {
		background-image: url('/logo_dark.svg');
		height: 1.2rem;
		width: 100px;
		background-size: cover;
		margin-left: 0.7rem;

		:global(.dark) & {
			background-image: url('/logo_white.svg');
		}
	}
</style>
