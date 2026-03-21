<script lang="ts">
</script>

<div class="body">
	<div class="card card-padding max-width">
		<div class="icon-circle">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
				<path d="M9 12l2 2 4-4"></path>
			</svg>
		</div>

		<h1>Permission Required</h1>
		<p>
			To continue, this application needs your permission to access your Google account data.
			Without these permissions, the app cannot verify your identity or complete your request.
		</p>

		<div class="footer">
			If you're having trouble, try signing out of Google and signing back in.
			<span class="error-code">Error: access_denied (User refused consent)</span>
		</div>
	</div>
</div>

<style>
	:root {
		--base-color: #3b82f6;
		--icon-blue: light-dark(hsl(from var(--base-color) h s calc(l)), #86b3ff);
		--icon-blue-bg: light-dark(#e8f0fe, #324568);
	}
	.max-width {
		max-width: 600px;
	}

	.card-padding {
		padding: 2rem;
	}

	.body {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.icon-circle {
		width: 64px;
		height: 64px;
		background-color: var(--icon-blue-bg);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 24px;
	}

	.icon-circle svg {
		color: var(--icon-blue);
		width: 32px;
		height: 32px;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 400;
		margin-bottom: 1rem;
		margin: auto;
	}

	p {
		font-size: 14px;
		line-height: 1.6;
		color: var(--sub-title);
	}

	.footer {
		font-size: 0.75rem;
		color: var(--sub-title);
		border-top: 1px solid var(--border);
		padding-top: 1.5rem;
	}

	.error-code {
		font-family: monospace;
		display: block;
		margin-top: 0.5rem;
		font-weight: bold;
		color: var(--error-color);
	}

	@media (max-width: 600px) {
		.card {
			border: none;
			padding: 24px 16px;
		}
		.card:hover {
			box-shadow: none;
		}
	}
</style>
