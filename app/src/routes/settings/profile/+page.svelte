<script lang="ts">
	import { pushState } from '$app/navigation';
	import { page } from '$app/state';
	import CreateProfile from '$lib/components/profile/CreateProfile.svelte';
	import ProfileDetails from '$lib/components/profile/ProfileDetails.svelte';

	let { data } = $props();

	const switchToProfileEditMode = () => {
		pushState('', {
			profileEditMode: true,
			projectEditMode: false,
			showTaskPopup: false
		});
	};
</script>

<div>
	{#if page.state.profileEditMode}
		<CreateProfile user={data.profileData} />
	{:else}
		<div class="edit-profile">
			<ProfileDetails profile={data.profileData} />
			<button onclick={switchToProfileEditMode}> Edit Profile </button>
		</div>
	{/if}
</div>

<style>
	.edit-profile {
		display: flex;
		align-items: start;
		justify-content: space-between;
	}

	button {
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
