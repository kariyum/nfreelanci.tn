<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import GoogleLogin from '$lib/components/auth/GoogleLogin.svelte';
	import OrSeparator from '$lib/components/auth/OrSeparator.svelte';
	import AlreadyLoggedIn from '$lib/pages/AlreadyLoggedIn.svelte';
	import { cyrb53 } from '$lib/utils.js';
	import { MoveLeft } from 'lucide-svelte';
	let { data } = $props();

	function login(email: string, password: string): Promise<Response> {
		return fetch('/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				email: email,
				password: password
			})
		});
	}

	let password: string | undefined = $state(undefined);
	let email: string | undefined = $state(undefined);
	let final_error_message = $state('');

	async function handleSubmit() {
		if (email && password) {
			await login(email, cyrb53(password).toString()).then(
				async (response) => {
					if (response.ok) {
						await goto(resolve(data.redirectionUrl), { invalidateAll: true });
					} else if (response.status == 401) {
						final_error_message = 'Wrong combination';
					} else {
						final_error_message = 'Connection issues, retry later';
					}
				},
				(reason) => {
					console.error('Connection issues, retry later', reason);
					final_error_message = 'Connection issues, retry later';
				}
			);
		}
	}
</script>

{#if data.user.isOk()}
	<AlreadyLoggedIn />
{:else}
	<div class="container">
		<div class="sub-container">
			<a href={resolve('/')}>
				<MoveLeft size="3rem" />
			</a>
			<h1>Welcome back !</h1>
			<form class="fields-container" method="post" onsubmit={(event) => event.preventDefault()}>
				<div class="fields">
					<div class="input-label">
						<input name="email" type="email" placeholder=" " required bind:value={email} />
						<label for="email">Email</label>
					</div>
					<div class="input-label">
						<input name="password" type="password" placeholder=" " required bind:value={password} />
						<label for="password">Password</label>
					</div>
				</div>
				{#if final_error_message.length > 0}
					<p class="error-message">
						{final_error_message}
					</p>
				{/if}
				<div
					style="display:flex; justify-content: space-between; align-items: center; margin: 1rem 0;"
				>
					<a href={resolve('/register')}>Don't have an account? Register!</a>
					<button type="submit" onclick={handleSubmit}>Login</button>
				</div>
			</form>
			<OrSeparator></OrSeparator>
			<GoogleLogin></GoogleLogin>
		</div>
	</div>
{/if}

<style>
	.container {
		margin-top: 3rem;
		width: 100%;
	}
	.fields {
		display: flex;
		gap: 1rem;
		flex-direction: column;
	}

	input {
		width: 100%;
	}

	p {
		padding: 0;
		margin: 0rem;
		margin-top: 1rem;
	}

	.fields-container {
		display: flex;
		flex-direction: column;
	}

	a {
		color: var(--ucla-blue);
	}

	.sub-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 0 1rem;
		max-width: 40rem;
		margin: auto;
	}
</style>
