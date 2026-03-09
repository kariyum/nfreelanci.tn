<script lang="ts">
	import { onDestroy } from 'svelte';
	import { tick } from 'svelte';
	import { SendHorizontal } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { ClientMessage } from '$lib/types.js';
	import type { User } from '$lib/features/auth/client';
	import { WebSocketService, type MessagesJsonResponse } from '$lib/features/notification/socket';
	import type { Messages } from '$lib/features/messages/client';

	interface Props {
		messagesProp: Messages;
		user: User;
	}
	const { messagesProp, user }: Props = $props();

	let webSocketService: WebSocketService;
	let unsubscribe: () => void;
	let message: string = $state('');
	let smoothScroll: boolean = false;
	let justSwitched: boolean = true;
	let viewport: HTMLDivElement;
	let messageInputBox: HTMLInputElement;
	let receivers: string[] = $derived.by(() => {
		return messagesProp.members.filter((member) => member != user.email);
	});
	let discussionId = $derived(messagesProp.discussion_id);
	let remoteMessages = $derived(messagesProp.messages);

	let localMessages: Array<MessagesJsonResponse> = $derived.by(() => {
		remoteMessages;
		let result = $state([]);
		return result;
	});
	let messages: Array<MessagesJsonResponse> = $derived(remoteMessages.concat(localMessages));

	onMount(() => {
		if (browser) {
			webSocketService = WebSocketService.getInstance();
			unsubscribe = webSocketService.subscribeToChatMessages((msg) => {
				if (discussionId == msg.discussion_id) {
					localMessages.push(msg);
				}
			});
		}

		if (window && window.visualViewport) {
			window.visualViewport.addEventListener('resize', () => {
				if (window.visualViewport && window.visualViewport.height < window.innerHeight) {
					messageInputBox.scrollIntoView({ behavior: 'instant' });
				}
			});
		}
	});

	onDestroy(() => {
		if (browser) {
			unsubscribe();
			// return this in the onMount since it returns synchronously
		}
	});

	function toClientMessage(content: string) {
		let res: ClientMessage = {
			discussion_id: discussionId,
			content: content,
			receivers: receivers
		};
		return JSON.stringify(res);
	}

	function onClick(event: Event) {
		event.preventDefault();
		if (message.length == 0 || message.trim().length == 0) {
			return;
		}
		try {
			webSocketService.send(toClientMessage(message));
		} catch (err) {
			console.error('Failed to push message upstream...');
		}
		if (user.email == undefined) {
			console.log('Email is undefined');
			return;
		}
		const msg: MessagesJsonResponse = {
			id: Math.random(),
			notification_type: 'message',
			from_user_id: user.email,
			content: message,
			discussion_id: discussionId,
			created_at: new Date()
		};
		localMessages.push(msg);
		message = '';
	}

	// $effect is used here to clear localMessages when data.messages changes;
	// meaning when the user clicks on another discussion
	$effect.pre(() => {
		remoteMessages;
		smoothScroll = false;
		justSwitched = true;
	});

	$effect.pre(() => {
		messages;
		const autoscroll = viewport && Math.abs(viewport.scrollTop) < 100;
		if (viewport && autoscroll) {
			viewport.scrollBy({
				left: 0,
				top: 10,
				behavior: 'instant'
			});
			tick().then(() => {
				viewport.scrollBy({
					left: 0,
					top: 0,
					behavior: 'smooth'
				});
			});
		}
	});
</script>

<div class="root">
	<div class="outer-container">
		<div class="messages" bind:this={viewport}>
			{#each messages.reverse() as message}
				<div
					class="message"
					data-sender={message.from_user_id == user.email ? 'me' : message.from_user_id}
				>
					{message.content}
				</div>
			{/each}
		</div>
	</div>

	<div class="input">
		<form class="input-form" onsubmit={onClick}>
			<input
				type="text"
				bind:this={messageInputBox}
				bind:value={message}
				class="test"
				placeholder="Type a message... as {user.email}"
			/>
			<button tabindex="-1" class="icon" onmousedown={onClick} type="submit">
				<SendHorizontal />
			</button>
		</form>
	</div>
</div>

<style>
	.icon {
		background-color: transparent;
		border: none;
		line-height: 0;
	}

	.outer-container {
		display: flex;
		scroll-behavior: smooth;
		flex: 1;
		max-height: 75vh;
		min-height: 75vh;
	}

	.messages {
		width: 100%;
		flex-grow: 1;
		flex: 1;
		background-color: var(--canvas-color);
	}

	.message {
		padding: 0.75rem;
		border-radius: 9px;
		background-color: var(--message-bg);
		width: fit-content;
		max-width: 70ch;
		word-wrap: break-word;
	}

	.message[data-sender='me'] {
		margin-left: auto;
	}

	.message {
		margin: 0.5rem 0.5rem 0.5rem 0.5rem;
	}

	.input {
		display: flex;
		width: 100%;
	}

	.input-form {
		display: flex;
		width: 100%;
		border-top: 2px solid var(--border);
	}

	.input-form input[type='text'] {
		flex: 1;
		padding: 0.75rem;
		border-radius: 0;
		border: 0;
		outline: none;
	}

	.input-form button[type='submit'] {
		padding: 0.75rem 1rem;
		cursor: pointer;
		border-left: 0;
		border-top: 0;
		border-radius: 0;
		background-color: var(--input-bg);
	}
	.root {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.messages {
		height: 100%;
		display: flex;
		flex-direction: column-reverse;
		overflow-y: scroll;
	}
	@media (width < 600px) {
		.input {
			position: fixed;
			bottom: 0;
		}
	}
</style>
