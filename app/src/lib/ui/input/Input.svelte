<script lang="ts">
	let {
		value = $bindable(),
		label,
		required = false,
		type = 'text'
	}: { value: string; required?: boolean; type?: string; label: string } = $props();

	let snakeCaseLabel = $derived(label.replaceAll(' ', '_').toLocaleLowerCase());
</script>

<div class="input-label">
	<input name={snakeCaseLabel} {type} placeholder=" " {required} bind:value />
	<label for={snakeCaseLabel}>{label}</label>
</div>

<style>
	input {
		width: 100%;
	}
	div {
		margin: 1.2rem 0rem;
	}
</style>
