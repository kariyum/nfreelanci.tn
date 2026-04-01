<script>
	import { resolve } from '$app/paths';
	import Footer from '$lib/components/navbar/Footer.svelte';

	let cards = [
		{
			title: 'Post Projects & Tasks',
			description:
				'Effortlessly create and publish detailed project listings. Define scopes, set budgets, and attach files with ease.'
		},
		{
			title: 'Invite & Collaborate',
			description:
				'Find and invite the perfect freelancers for your team. Collaborate seamlessly with built-in tools.'
		},
		{
			title: 'Manage Proposals',
			description:
				'Review, accept, or decline work proposals with a click. Keep track of all your potential hires.'
		},
		{
			title: 'Real-time Chat',
			description:
				'Communicate instantly with clients and freelancers through our integrated real-time chat.'
		},
		{
			title: 'Skill-Matched Projects',
			description:
				'Freelancers, discover projects perfectly aligned with your expertise and career goals.'
		},
		{
			title: 'Scout Top Talent',
			description:
				'Clients, easily browse and discover a diverse pool of skilled freelancers ready for your next project.'
		}
	];
</script>

<div class="container">
	<div>
		<h1 class="title">
			<p>Recruit Top Tunisian Freelancers</p>
			<p>& Build Your Dream Team</p>
		</h1>
		<p class="subtitle">Effortlessly connect with skilled local talent!</p>
	</div>
	<a href={resolve('/register')} class="btn-a"> Get Started - It's Free! </a>
</div>
<div class="bg">
	<div class="can-do">
		<h1>Unleash Your Potential with nfreelanci</h1>
		<ul>
			{#each cards as card (card)}
				<li>
					<span>{card.title}</span>
					<p>{card.description}</p>
				</li>
			{/each}
		</ul>
	</div>

	<div class="body">
		<h1>Meet the Team!</h1>
		<p>
			Born from a passion for empowering Tunisian talent, nfreelanci was founded by a team of young
			Tunisian software engineers committed to building high-quality products for our community.
			This is our first app, and we're excited to connect you with the best.
		</p>
	</div>

	<div class="opportunity-section">
		<h1>Ready to tackle your next opportunity?</h1>
		<p>Join nfreelanci today and experience the future of freelance work. It's totally free</p>
		<a href={resolve('/register')} class="btn-a"> Sign-up Now</a>
	</div>

	<Footer></Footer>
</div>

<style>
	.btn-a {
		text-decoration: none;
		background-color: var(--btn-bg);
		color: inherit;
		padding: 0.75rem 1rem;
		font-size: medium;
		border-radius: 5px;
	}
	.container {
		margin-top: 8rem;
		font-size: x-large;
		display: flex;
		flex-direction: column;
		padding: 2rem 1rem 0 1rem;
		gap: 1rem;
		align-items: center;
		text-align: center;
	}
	.title {
		color: var(--title);
	}
	.subtitle {
		margin: 2rem 0;
		color: var(--sub-title);
	}
	.bg {
		background-color: var(--darker-bg);
		border-top: 1px solid var(--border);
		margin-top: 20rem;
		padding-top: 2rem;
	}
	.opportunity-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 1rem;
		max-width: 80rem;
		margin: 2rem auto;
		text-align: center;

		p {
			padding-top: 1rem;
			font-size: 1.5rem;
			color: var(--sub-title);
		}

		a {
			display: inline;
			width: fit-content;
			margin: auto;
			text-decoration: none;
			border-radius: 5px;
		}
	}
	.body {
		padding: 1rem;
		max-width: 80rem;
		margin: auto;
		margin-top: 2rem;
		text-align: center;

		p {
			padding-top: 2rem;
			font-size: 1.5rem;
			color: var(--sub-title);
		}
	}

	.can-do {
		display: flex;
		flex-direction: column;
		padding: 2rem;
		gap: 1rem;
		font-size: large;
		max-width: 50rem;
		margin: auto;

		h1:first-child {
			margin-bottom: 2rem;
			text-align: center;
		}
	}

	ul {
		list-style: none;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}

	li {
		background-color: var(--card-bg);
		border-radius: 10px;
		border: 1px solid var(--border);
		padding: 2rem;
		text-align: center;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 1rem;

		span {
			font-size: larger;
			font-weight: 500;
			color: var(--title);
		}

		p {
			color: var(--sub-title);
		}
	}

	h2 {
		letter-spacing: 0.1ch;
	}

	@media (width < 600px) {
		ul {
			grid-template-columns: 1fr;
		}
	}
</style>
