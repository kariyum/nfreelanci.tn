<script lang="ts">
	import { capitalize } from '$lib/utils';
	import type { ProfileGET } from '$lib/features/profiles/models';

	type Props = {
		profile: ProfileGET;
	};
	let { profile }: Props = $props();
	let links = $derived([profile.github_link, profile.linkedin_link, profile.portfolio_link]);
</script>

<div class="container">
	<h1>Profile</h1>
	<p style="color:var(--sub-title)">This information is displayed publicly.</p>
	<div class="avatar-container" style="padding: 0;">
		<div class="avatar" data-content={profile.first_name.charAt(0).toUpperCase()}></div>
		<div>
			<h2>{capitalize(profile.first_name + ' ' + profile.last_name)}</h2>
			<p>{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</p>
		</div>
	</div>
	<div>
		<h2 style="margin-bottom: 0.2rem;">Email Address</h2>
		<p>{profile.user_id}</p>
	</div>
	<div>
		<h2 style="margin-bottom: 1rem;">Bio</h2>
		{#if !profile.bio || profile.bio?.length == 0}
			<p style="color: var(--sub-title)">Edit to add a bio</p>
		{:else}
			<p>
				{profile.bio}
			</p>
		{/if}
	</div>
	{#if profile.role === 'freelancer'}
		<div class="links">
			<h4>Links</h4>
			{#if links.every((value) => !value)}
				Edit to add links.
			{:else}
				{#if profile.linkedin_link}
					<a href={profile.linkedin_link}>LinkedIn</a>
				{/if}
				{#if profile.portfolio_link}
					<a href={profile.portfolio_link}>Portfolio Website</a>
				{/if}
			{/if}
		</div>
		<div>
			<h4>Skills</h4>
			{#if !profile.skills || profile.skills?.length === 0}
				<div>Edit to add skills.</div>
			{:else}
				<div class="skills">
					{#each profile.skills as skill}
						<div class="skill">{skill}</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	a {
		width: fit-content;
	}
	.links {
		display: flex;
		flex-direction: column;
	}

	.container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.skills {
		display: flex;
		margin-top: 0.5rem;
		gap: 0.5rem;
	}

	.skill {
		background-color: var(--tag-bg);
		padding: 0.5rem 0.8rem;
		align-items: center;
		border-radius: 5px;
		width: fit-content;
		line-height: 1rem;
	}
</style>
