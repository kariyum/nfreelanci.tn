<script lang="ts">
	import Discussion from '$lib/components/conversation/Discussion.svelte';
	import type { User } from '$lib/features/auth/client.js';
	import type { Messages } from '$lib/features/messages/client.js';
	import type { ProposalGET } from '$lib/features/proposals/models.js';
	import type { TaskGET } from '$lib/features/task/models.js';
	import type { FetchErrors } from '$lib/types.js';
	import SafeRender from '$lib/ui/snippets/SafeRender.svelte';
	import { Result, UnauthorizedError } from '$lib/utils.js';

	let { data } = $props();
	type Prop = {
		messages: Result<Messages, FetchErrors>;
		proposal: Result<ProposalGET, FetchErrors>;
		task: Result<TaskGET, FetchErrors>;
		user: Result<User, FetchErrors>;
	};

	let prop = $derived.by(() => {
		const prop = {
			messages: data.messages,
			proposal: data.proposal,
			task: data.task,
			user: data.user
				? (Result.ok(data.user) as Result<User, FetchErrors>)
				: (Result.err({ unauthorizedError: new UnauthorizedError('Unauthorized') }) as Result<
						User,
						FetchErrors
					>)
		};

		return Result.combine<Prop, FetchErrors>(prop);
	});
</script>

<SafeRender data={prop}>
	{#snippet component(prop)}
		<Discussion {...prop}></Discussion>
	{/snippet}
</SafeRender>
