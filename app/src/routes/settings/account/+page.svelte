<script lang="ts">
	import { accountClient, accountService } from '$lib/features/account/client.js';
	import type { PasswordUpdate } from '$lib/features/account/models.js';
	import type { ValidationErrors } from '$lib/object-validator.js';
	import Input from '$lib/ui/input/Input.svelte';
	import { ClientError } from '$lib/utils.js';

	let { data } = $props();
	let formElement: HTMLFormElement;
	let formErrors: ValidationErrors<PasswordUpdate> | undefined = $state(undefined);
	interface InfoMessageInterface {
		message: string;
		status: number;
	}
	let infoMessage: InfoMessageInterface | undefined = $state(undefined);

	async function submit(event: SubmitEvent) {
		infoMessage = undefined;
		event.preventDefault();
		const formData = new FormData(formElement);
		const payload = accountService.getPatchPasswordPayload(formData);
		if (payload.isOk()) {
			const response = await accountClient(fetch).patchPassword(payload.unwrap());
			if (response.isOk()) {
				infoMessage = {
					message: 'Password updated! 👍',
					status: 200
				};
				formElement.reset();
			} else if (response.error instanceof ClientError) {
				infoMessage = {
					message: 'Verify current password',
					status: response.error.status
				};
			} else {
				infoMessage = {
					message: `Error: Request failed`,
					status: 0
				};
			}
		}
		formErrors = payload.error;
	}
</script>

<div>
	<h2>Change Your Password</h2>
	<form bind:this={formElement} onsubmit={submit}>
		<input type="email" hidden value={data.user.email} />
		<Input errors={formErrors?.currentPassword} type="password" label="Current Password"></Input>
		<Input errors={formErrors?.newPassword} type="password" label="New Password"></Input>
		<Input errors={formErrors?.confirmPassword} type="password" label="Confirm Password"></Input>
		{@render render_info_message(infoMessage)}
		<input class="action" type="submit" value="Update" />
	</form>
</div>

{#snippet render_info_message(infoMessage: InfoMessageInterface | undefined)}
	{#if infoMessage}
		<div style="margin: 1.2rem 0rem">
			<p data-status={infoMessage.status}>{infoMessage.message}</p>
		</div>
	{/if}
{/snippet}

<style>
	.action {
		float: right;
	}
	h2 {
		color: var(--font-color);
		margin: 0;
	}

	:global(input[type='password']) {
		max-width: 340px;
		width: 100%;
	}
	@media (width < 600px) {
		:global(input[type='password']) {
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
