<script lang="ts">
	import NotificationMenu from '$lib/components/notification/NotificationMenu.svelte';

	let { data } = $props();
</script>

<div class="page-container">
	<NotificationMenu notifications={data.notifications.getOrElse([])} />
</div>
