<script lang="ts">
	let { children } = $props();
</script>

<div class="page">
	{@render children()}
</div>

<style>
	.page {
		padding-top: 0;
		height: 100%;
	}

	@media (width < 600px) {
		.page {
			display: flex;
			flex-direction: column;
		}
	}
</style>
