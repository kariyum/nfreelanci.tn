<script lang="ts">
	import { codeInput } from '$lib/attachments/codeInput.svelte';
	let { code = $bindable('') } = $props();

	let digits = $state(['', '', '', '', '', '']);

	$effect(() => {
		code = digits.join('');
	});
</script>

<div class="main">
	<div class="title">We have sent you a code to verify your email</div>
	<div class="inputs" {@attach codeInput}>
		{#each digits as _, i}
			<input
				type="text"
				inputmode="numeric"
				maxlength="1"
				minlength="1"
				size="1"
				required
				pattern="\d*"
				bind:value={digits[i]}
			/>
		{/each}
	</div>
</div>

<style>
	input {
		position: relative;
		padding: 0.225rem 0rem;
		text-align: center;
		font-size: 40px;
	}

	.inputs {
		display: flex;
		gap: 0.75rem;
	}

	.title {
		margin: 1rem 0;
	}

	.main {
	}
</style>
