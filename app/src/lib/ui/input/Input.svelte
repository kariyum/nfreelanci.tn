<script lang="ts">
	let {
		value = $bindable(),
		label,
		required = false,
		type = 'text',
		errors = [],
		margin = '1.2rem'
	}: {
		label: string;
		value?: string;
		required?: boolean;
		type?: string;
		errors?: string[];
		margin?: string;
	} = $props();

	let snakeCaseLabel = $derived(label.replaceAll(' ', '_').toLocaleLowerCase());
</script>

<div class="container" style:--mprop={margin}>
	<div class="input-label">
		<input name={snakeCaseLabel} {type} placeholder=" " {required} bind:value />
		<label for={snakeCaseLabel}>{label}</label>
	</div>
	{#if errors.length > 0}
		<div class="error-message">
			{#each errors as err}
				<div class="form-reason">{err}</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	input {
		width: 100%;
	}
	.container {
		margin: var(--mprop) 0rem;
	}
</style>
