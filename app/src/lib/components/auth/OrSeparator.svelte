<div class="wavy-separator">or</div>

<style>
	.wavy-separator {
		display: flex;
		align-items: center;
		text-align: center;
		color: var(--sub-title);
		font-size: 14px;
		margin: 24px 0;
	}

	.wavy-separator::before,
	.wavy-separator::after {
		content: '';
		flex: 1;
		height: 10px;
		background-image: url("data:image/svg+xml,%3Csvg width='20' height='10' viewBox='0 0 20 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 5 C 5 0, 5 10, 10 5 C 15 0, 15 10, 20 5' stroke='%23dadce0' fill='transparent' stroke-width='1.5'/%3E%3C/svg%3E");
		background-repeat: repeat-x;
		background-position: center;
	}

	.wavy-separator::before {
		margin-right: 0.75rem;
	}

	.wavy-separator::after {
		margin-left: 0.75rem;
	}
</style>
