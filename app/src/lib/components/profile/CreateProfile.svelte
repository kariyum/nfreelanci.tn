<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Skills from '$lib/components/skills/Skills.svelte';
	import type { ProfileGET } from '$lib/features/profiles/models';

	type Props = {
		user: ProfileGET;
	};

	let { user }: Props = $props();

	let skills: string[] = $derived.by(() => {
		let skills = $state(user.skills ?? []);
		return skills;
	});
	let form: HTMLFormElement;

	const addSkill = (skill: string) => skills.push(skill);
	const removeSkillAtIndex = (index: number) => skills.splice(index, 1);

	async function saveProfile(event: SubmitEvent) {
		event.preventDefault();
		const formData = new FormData(form);
		const entries = formData.entries();
		const profile = Object.fromEntries(entries);
		const payload = {
			bio: profile.bio === '' ? undefined : profile.bio,
			linkedin_link: profile.linkedin_link === '' ? undefined : profile.linkedin_link,
			github_link: profile.github_link === '' ? undefined : profile.github_link,
			first_name: profile.first_name,
			last_name: profile.last_name,
			portfolio: profile.portfolio,
			skills
		};
		const response = await fetch('/api/profile', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});
		if (response.ok) {
			await invalidate('/api/profile');
			history.back();
		} else {
			console.error('/api/profile failed');
		}
	}
</script>

<div class="top-container">
	<div class="container">
		<form bind:this={form} onsubmit={saveProfile}>
			<div class="name">
				<div class="input input-label input-group">
					<input
						type="text"
						id="first_name"
						name="first_name"
						autocapitalize="words"
						placeholder=" "
						value={user.first_name}
					/>

					<label for="first_name">First Name</label>
				</div>
				<div class="input input-label input-group">
					<input
						type="text"
						id="last_name"
						name="last_name"
						autocapitalize="words"
						placeholder=" "
						value={user.last_name}
					/>
					<label for="last_name">Last Name</label>
				</div>
			</div>

			<div class="input textarea-label input-group">
				<textarea
					id="description"
					name="bio"
					autocapitalize="sentences"
					placeholder=" "
					value={user.bio}
				></textarea>
				<label for="description">Tell us about yourself</label>
			</div>
			{#if user.role == 'freelancer'}
				<div class="input-group">
					<label for="linkedin_profile">LinkedIn Profile</label>
					<input
						type="text"
						id="linkedin_profile"
						name="linkedin_link"
						value={user.linkedin_link}
					/>
				</div>
				<div class="input-group">
					<label for="portfolio">Personal Website</label>
					<input type="text" id="portfolio" name="portfolio" value={user.portfolio_link} />
				</div>
				<div class="input-group">
					<label for="skills">Skills</label>
					<div class="skills">
						<Skills skillsIn={skills} {addSkill} {removeSkillAtIndex}></Skills>
					</div>
				</div>
			{/if}
			<div class="actions">
				<button
					onclick={(event) => {
						event.preventDefault();
						history.back();
					}}>Cancel</button
				>
				<input type="submit" value="Save" />
			</div>
		</form>
	</div>
</div>

<style>
	.name {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.top-container {
		width: 100%;
	}
	.skills {
		width: 30rem;
	}
	label {
		width: fit-content;
	}
	form {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.input-group {
		flex-grow: 2;
	}

	input,
	textarea {
		border: 2px solid var(--border);
		width: 100%;
	}

	input[type='submit'] {
		cursor: pointer;
		margin-left: auto;
		background-color: var(--btn-bg);
		border-width: 1px;
		&:hover {
			background-color: var(--hover-color);
		}
	}

	.skills {
		width: 100%;

		&:focus {
			outline: 2px solid var(--blue);
			outline-offset: -2px;
		}
	}

	.actions {
		display: flex;
		margin-left: auto;
		gap: 0.5rem;
	}
</style>
