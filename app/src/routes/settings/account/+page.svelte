<script lang="ts">
	import { validateObject, type ValidationErrors } from '$lib';
	import { cyrb53 } from '$lib/utils.js';
	import { Validator } from '$lib/validator.js';

	let { data } = $props();
	let formElement: HTMLFormElement;
	let formErrors: ValidationErrors<PasswordUpdate> | undefined = $state(undefined);
	interface InfoMessageInterface {
		message: string;
		status: number;
	}
	let infoMessage: InfoMessageInterface | undefined = $state(undefined);
	interface PasswordUpdate {
		currentPassword: any;
		newPassword: any;
		confirmPassword: any;
	}
	interface FormValidation {
		errors: ValidationErrors<PasswordUpdate>;
		hasErrors: boolean;
	}

	async function submit(event: SubmitEvent) {
		infoMessage = undefined;
		event.preventDefault();
		const formData = new FormData(formElement);
		const form: PasswordUpdate = {
			currentPassword: formData.get('current_password'),
			newPassword: formData.get('new_password'),
			confirmPassword: formData.get('confirm_password')
		};
		console.log(form)
		const validators = {
			currentPassword: Validator.string('current_password').required().nonEmpty(),
			newPassword: Validator.string('new_password').required().nonEmpty().withMinSize(8),
			confirmPassword: Validator.string('confirm_password')
				.required()
				.equal(formData.get('new_password')?.toString() ?? '', 'new_password')
		};
		formErrors = validateObject(form, validators);
		const hasErrors = Object.values(formErrors).some((errors) => errors.length > 0);
		if (hasErrors) {
			return;
		}

		const payload = {
			current_password: cyrb53((formData.get('current_password') as string) ?? '').toString(),
			new_password: cyrb53((formData.get('new_password') as string) ?? '').toString()
		};

		const response = await fetch('/api/auth/user/password', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		if (response.status == 200) {
			infoMessage = {
				message: 'Password updated!',
				status: response.status
			};
		} else if (response.status == 401) {
			infoMessage = {
				message: 'Verify current password',
				status: response.status
			};
		} else {
			infoMessage = {
				message: `Error: Request failed`,
				status: response.status
			};
		}
	}
</script>

<h2>Change Your Password</h2>
<form bind:this={formElement} onsubmit={submit}>
	<input type="email" hidden value={data.user?.email} />
	<div>
		<div class="input-label">
			<input type="password" placeholder=" " name="current_password" />
			<label for="current_password">Current Password</label>
		</div>
		{#if formErrors}
			{@render errors(formErrors.currentPassword ?? [])}
		{/if}
	</div>
	<div>
		<div class="input-label">
			<input type="password" placeholder=" " name="new_password" />
			<label for="new_password">New Password</label>
		</div>
		{#if formErrors}
			{@render errors(formErrors.newPassword ?? [])}
		{/if}
	</div>
	<div>
		<div class="input-label">
			<input type="password" placeholder=" " name="confirm_password" />
			<label for="confirm_password">Confirm New Password</label>
		</div>
		{#if formErrors}
			{@render errors(formErrors.confirmPassword ?? [])}
		{/if}
	</div>
	{@render render_info_message(infoMessage)}
	<input class="action" type="submit" value="Update" />
</form>

{#snippet errors(errors: string[])}
	{#if errors.length > 0}
		<div class="error-message">
			{#each errors as err}
				<div class="form-reason">{err}</div>
			{/each}
		</div>
	{/if}
{/snippet}

{#snippet render_info_message(infoMessage: InfoMessageInterface | undefined)}
	{#if infoMessage}
		<div>
			<p data-status={infoMessage.status}>{infoMessage.message}</p>
		</div>
	{/if}
{/snippet}

<style>
	h2 {
		color: var(--font-color);
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	input[type='password'] {
		max-width: 60%;
		width: 100%;
	}
	@media (width < 600px) {
		input {
			max-width: 100%;
		}
	}
	p[data-status='401'] {
		color: var(--error-color);
	}
	p[data-status='200'] {
		color: var(--success-color);
	}
</style>
