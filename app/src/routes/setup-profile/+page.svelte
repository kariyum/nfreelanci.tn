<script lang="ts">
	import RegisterForm from '$lib/components/auth/RegisterForm.svelte';

	let { data } = $props();
</script>

{#if data.userJsonResponse.isOk()}
	<RegisterForm userProviderData={data.userJsonResponse.value}></RegisterForm>
{:else}
	Relogin please...
{/if}
