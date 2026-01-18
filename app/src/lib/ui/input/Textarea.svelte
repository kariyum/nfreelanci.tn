<script lang="ts">
	let {
		value = $bindable(),
		label,
		required
	}: { value: string; label: string; required?: boolean } = $props();
</script>

<div class="textarea-label">
	<textarea name={label} id={label} bind:value {required}></textarea>
	<label for={label}>{label}</label>
</div>

<style>
	div {
		margin: 1.2rem 0rem;
	}
</style>
