<script lang="ts">
	import { type BaseNotification } from '$lib/features/notification/client';
	import {
		type ProposalNotification,
		ProposalNotificationImpl,
		type NewProposalNotification,
		NewProposalNotificationImpl
	} from '$lib/features/notification/socket';
	import { computeTimeAgo } from '$lib/utils';

	let { notifications }: { notifications: BaseNotification[] } = $props();
</script>

{#snippet renderProposalNotification(notif: ProposalNotification)}
	<a class="notif-container proposal" href={ProposalNotificationImpl.getHref(notif)}>
		<h3 style="margin-bottom: 0.5rem;">Application Status</h3>
		<p>
			{ProposalNotificationImpl.getContent(notif)}
		</p>
		<div class="timeago">
			{computeTimeAgo(notif.created_at)}
		</div>
	</a>
{/snippet}

{#snippet renderNewProposalNotification(notif: NewProposalNotification)}
	<a class="notif-container proposal" href={NewProposalNotificationImpl.getHref(notif)}>
		<h3 style="margin-bottom: 0.5rem;">New Application</h3>
		<p>
			{NewProposalNotificationImpl.getContent(notif)}
		</p>
		<div class="timeago">
			{computeTimeAgo(notif.created_at)}
		</div>
	</a>
{/snippet}

<div>
	<h3>Notifications</h3>
	<div>
		{#if notifications.length}
			{#each notifications as notification}
				{#if notification.notification_type === 'proposal'}
					{@render renderProposalNotification(notification as ProposalNotification)}
				{:else if notification.notification_type === 'new_proposal'}
					{@render renderNewProposalNotification(notification as NewProposalNotification)}
				{/if}
			{/each}
		{:else}
			<div>You do not have notifications yet!</div>
		{/if}
	</div>
</div>

<style>
	h3 {
		margin-bottom: 1rem;
		color: var(--font-color);
	}
	.proposal {
		margin: 0.5rem 0 0.5rem 0;
	}

	.notif-container {
		display: flex;
		flex-direction: column;
		text-decoration: none;
		color: inherit;

		padding: 0.5rem;
		border-radius: 10px;

		&:hover {
			background-color: var(--toast-bg);
		}

		.timeago {
			font-size: smaller;
			font-weight: 500;
			align-self: self-end;
		}
	}
</style>
