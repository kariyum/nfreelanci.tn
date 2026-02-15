<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import Navbar from '$lib/components/navbar/Navbar.svelte';
	import NavbarNewUser from '$lib/components/navbar/NavbarNewUser.svelte';
	import './styles.css';
	let { data, children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<script>
		document.documentElement.classList.add(
			localStorage.getItem('app:theme') ??
				(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
		);
	</script>
</svelte:head>

{#if data.user && data.notifications.isOk()}
	<Navbar user={data.user} notifications={data.notifications.unwrap()} />
	<div class="container">
		{@render children()}
	</div>
{:else if data.user && data.notifications.isErr()}
	<div>Oupsie... failed to fetch notifications. Refresh the page please!</div>
{:else}
	<div class="container">
		<NavbarNewUser></NavbarNewUser>
	</div>
	{@render children()}
{/if}

<style>
	.container {
		margin: auto;
		max-width: var(--max-width);
	}
	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	@keyframes fade-out {
		to {
			opacity: 0;
		}
	}

	@keyframes slide-from-right {
		from {
			transform: translateX(30px);
		}
	}

	@keyframes slide-to-left {
		to {
			transform: translateX(-30px);
		}
	}

	:root::view-transition-old(root) {
		animation:
			90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
			300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
	}

	:root::view-transition-new(root) {
		animation:
			210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
			300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
	}

	@media (width < 600px) {
		.container {
			flex-grow: 1;
			width: 100%;
		}
	}
</style>
