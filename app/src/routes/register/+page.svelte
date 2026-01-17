<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { cyrb53, validateEmail } from '$lib/utils.js';
	import { StringValidator, Validator } from '$lib/validator';
	import { Home, MoveLeft } from 'lucide-svelte';
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let formElement: HTMLFormElement;
	const steps = [rolePicker, userInfoForm];
	let currentStep = $state(0);
	let allData: SvelteMap<string, string> = new SvelteMap();

	const validators = (data: Map<string, string>) => {
		return {
			role: Validator.string('Role').required().in(['freelancer', 'recruiter']),
			first_name: Validator.string('first name')
				.required()
				.nonEmpty()
				.withMinSize(2)
				.withMaxSize(20),
			last_name: Validator.string('last name').required().nonEmpty().withMinSize(2).withMaxSize(20),
			email: Validator.string('email').required().nonEmpty().email().withMaxSize(50),
			password: Validator.string('password').required().nonEmpty().withMinSize(8),
			confirm_password: Validator.string('confirm_password')
				.required()
				.equal(data.get('password')?.toString() ?? '', 'password')
		};
	};
	interface FormValidation {
		formErrors: Map<string, string[]>;
		hasFormErrors: boolean;
		getError: (field: string) => string[];
		hasErrors: (field: string) => boolean;
	}

	function reportFormValidation(
		formData: Map<string, string>,
		validators: (data: Map<string, string>) => { [key: string]: StringValidator }
	): FormValidation {
		const formErrors: Map<string, string[]> = new Map();
		Object.entries(validators(formData)).forEach(([field_name, validator]) => {
			const errors = validator
				.validate(formData.get(field_name)?.toString())
				.map((error) => error.toString());
			formErrors.set(field_name, errors);
		});
		return {
			formErrors: formErrors,
			getError(field: string) {
				return formErrors.get(field) ?? [];
			},
			hasErrors(field: string) {
				return (formErrors.get(field) ?? []).length > 0;
			},
			hasFormErrors:
				Array.from(formErrors.values()).some((value) => value.length > 0) ||
				Array.from(formErrors.keys()).length == 0
		};
	}
	let formValidation: FormValidation | undefined = $state(undefined);

	function processFormData() {
		const hashedPassword = cyrb53(allData.get('password') ?? '').toString();
		allData.set('password', hashedPassword);
		allData.delete('confirm_password');
	}

	async function sendRequest() {
		processFormData();
		const payload = new URLSearchParams(Array.from(allData));
		const response = await fetch('/api/auth/register', {
			method: 'POST',
			body: payload
		});

		if (response.ok) {
			await goto('/', { invalidateAll: true });
		}
	}

	async function submit() {
		if (formElement.reportValidity()) {
			captureFormData();
			formValidation = reportFormValidation(allData, validators);
			if (!formValidation?.hasFormErrors) {
				return await sendRequest();
			}
		} else {
			return await Promise.resolve();
		}
	}

	function captureFormData() {
		let formData = new FormData(formElement);
		formData.entries().forEach(([key, value]) => allData.set(key, value.toString()));
	}
</script>

{#snippet errors(errors: string[])}
	{#if errors.length > 0}
		<div class="error-message">
			{#each errors as err}
				<div class="form-reason">{err}</div>
			{/each}
		</div>
	{/if}
{/snippet}

{#snippet userInfoForm()}
	<h2>Tell us about you!</h2>
	<div class="personal-info-container">
		<div class="username">
			<div>
				<div class="input-label">
					<input
						type="text"
						name="first_name"
						id="first_name"
						placeholder=" "
						required
						class:input-error={formValidation?.hasErrors('first_name')}
					/>
					<label for="first_name">First Name</label>
				</div>
				{@render errors(formValidation?.getError('first_name') ?? [])}
			</div>
			<div>
				<div class="input-label">
					<input
						type="text"
						name="last_name"
						id="last_name"
						placeholder=" "
						required
						class:input-error={formValidation?.hasErrors('last_name')}
					/>
					<label for="last_name">Last Name</label>
				</div>
				{@render errors(formValidation?.getError('last_name') ?? [])}
			</div>
		</div>
		<!-- <p class="input-info">
			We use your name and last name to display them throughout the app, (e.g. on your posts,
			discussions and profile)
		</p> -->
		<div>
			<div class="input-label">
				<input
					type="email"
					name="email"
					id="email"
					placeholder=" "
					required
					class:input-error={formValidation?.hasErrors('email')}
				/>
				<label for="email">Email</label>
			</div>
			{@render errors(formValidation?.getError('email') ?? [])}
		</div>
		<div>
			<div class="input-label">
				<input
					type="password"
					name="password"
					id="password"
					placeholder=" "
					required
					class:input-error={formValidation?.hasErrors('password')}
				/>
				<label for="password">Password</label>
				{@render errors(formValidation?.getError('password') ?? [])}
			</div>
		</div>
		<div>
			<div class="input-label">
				<input
					type="password"
					name="confirm_password"
					id="confirm_password"
					placeholder=" "
					required
					class:input-error={formValidation?.hasErrors('confirm_password')}
				/>
				<label for="confirm_password">Confirm Password</label>
			</div>
			{@render errors(formValidation?.getError('confirm_password') ?? [])}
		</div>
	</div>
{/snippet}

{#snippet rolePicker()}
	<div class="role-picker-container">
		<h2>I'm a ...</h2>
		<div class="options" id="role">
			<label class="card" for="recruiter">
				<input
					type="radio"
					id="recruiter"
					name="role"
					value="recruiter"
					required
					checked={allData.get('role') === 'recruiter'}
				/>
				<div class="card-body">
					<h1>Recruiter</h1>
					<p>I have a project, I need freelancers.</p>
				</div>
			</label>
			<label class="card" for="freelancer">
				<input
					type="radio"
					id="freelancer"
					name="role"
					value="freelancer"
					required
					checked={allData.get('role') === 'freelancer'}
				/>
				<div class="card-body">
					<h1>Freelancer</h1>
					<p>I have the skills, looking for work.</p>
				</div>
			</label>
		</div>
	</div>
{/snippet}

<div class="container">
	<div class="sub-container">
		<a href="/" title="Go back home">
			<MoveLeft size="3rem" />
		</a>
		<h1>Join us!</h1>
		<form
			onsubmit={async (event) => {
				event.preventDefault();
				await submit();
			}}
			bind:this={formElement}
		>
			<fieldset>
				{@render steps[currentStep]()}
			</fieldset>
			<div class="actions">
				{#if currentStep == 0}
					<a href="/login">Already have an account? Login!</a>
				{/if}
				<div style="margin-left:auto;">
					<button
						type="button"
						class="secondary-btn"
						onclick={() => (currentStep -= 1)}
						disabled={currentStep <= 0}>Previous</button
					>
					{#if currentStep < steps.length - 1}
						<button
							type="button"
							onclick={() => {
								if (formElement.reportValidity()) {
									captureFormData();
									currentStep += 1;
								}
							}}
							disabled={currentStep >= steps.length - 1}>Continue</button
						>
					{:else}
						<button type="submit">Submit</button>
					{/if}
				</div>
			</div>
		</form>
	</div>
</div>

<style>
	fieldset {
		border: unset;
	}

	.actions {
		margin-top: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.username {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		width: 100%;
		justify-content: stretch;
		align-items: safe;
		> div {
			flex-grow: 1;
		}
	}

	input {
		width: 100%;
	}

	.personal-info-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1rem;
	}

	.role-picker-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	input[type='radio'] {
		z-index: -1;
		position: absolute;
		left: 0;
		bottom: 0;
	}

	.card-body {
		display: flex;
		flex-direction: column;
	}

	.card {
		position: relative;
		border: 2px solid var(--border);
		background-color: var(--background-color);
		padding: 5rem 2rem;
		border-radius: 5px;
		height: 100%;
		cursor: pointer;
		transition:
			background-color 0.2s ease-out,
			border-color 0.2s ease-out,
			box-shadow 0.2s ease-out;
	}

	.card:hover[for='recruiter'],
	.card[for='recruiter']:has(input:checked) {
		/* scale: 1.05; */
		background-color: var(--orange);
		box-shadow: 0 0 1rem var(--orange);
		border-color: var(--orange);
	}

	.card:hover[for='freelancer'],
	.card[for='freelancer']:has(input:checked) {
		/* scale: 1.05; */
		background-color: var(--blue);
		box-shadow: 0 0 1rem var(--blue);
		border-color: var(--blue);
	}

	.options {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.container {
		margin-top: 3rem;
		width: 100%;
	}

	a {
		color: var(--ucla-blue);
	}

	.sub-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 0 1rem;
		max-width: 45rem;
		margin: auto;
	}

	@media (width < 600px) {
		.options {
			display: flex;
			flex-direction: column;
		}

		.username {
			gap: 1rem;
		}
	}
</style>
