<script lang="ts">
	import { page } from '$app/state';
	import type { Tab } from '$lib/types';

	interface Props {
		tabs: Tab[];
	}
	let { tabs }: Props = $props();
	let tabQueryParameter = $derived(page.url.searchParams.get('tabs'));
	let firstTab = $derived(tabs[0].snippet);
	let selectedTab = $derived(tabs.find((tab) => tab.tab == tabQueryParameter)?.snippet ?? firstTab);
	let pathname = $derived(page.url.pathname + page.url.search);
</script>

<div>
	<div class="switcher">
		{#each tabs as tab}
			<a href={tab.url} data-selected={tab.url === pathname}>
				{tab.title}
			</a>
		{/each}
	</div>
	{@render selectedTab?.()}
</div>

<style>
	a {
		text-decoration: none;
		color: inherit;
		position: relative;
		padding: 0.5rem 1rem 0.5rem 1rem;

		&::before {
			content: '';
			position: absolute;
			width: 0px;
			height: 0.2rem;
			border-radius: 10px;
			left: 50%;
			transform: translate(-50%, 0);
			background-color: var(--blue);
			bottom: -0.2rem;
			transition: width 0.2s ease-out;
		}

		&[data-selected='true']::before {
			width: 70%;
		}

		&:hover {
			background-color: var(--hover-color);
			&::before {
				width: 100%;
			}
		}
	}

	.switcher {
		display: flex;
		gap: 1rem;
		margin: 1rem 0 1rem 0;
	}

	/* Define the keyframes for linear growth */
	@keyframes growLinear {
		from {
			width: 70%; /* Start at 0% width */
		}
		to {
			width: 100%; /* Grow to 100% width */
		}
	}
</style>
