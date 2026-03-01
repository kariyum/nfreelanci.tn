<div class="progress-dual">
	<div class="bar bar-primary"></div>
	<div class="bar bar-secondary"></div>
</div>

<style>
	.progress-dual {
		z-index: 1;
		width: 100%;
		height: 4px;
		background-color: transparent;
		overflow: hidden;
		position: fixed;
	}

	.bar {
		position: absolute;
		top: 0;
		bottom: 0;
		background-color: var(--progress-bar-bg);
		border-radius: 999px;
	}

	.bar-primary {
		animation: primary-slide 2.1s infinite linear;
		animation-delay: 0.2s;
	}

	.bar-secondary {
		animation: secondary-slide 2.1s infinite linear;
		animation-delay: 1.15s;
	}

	@keyframes primary-slide {
		0% {
			left: -35%;
			width: 35%;
		}
		60% {
			left: 100%;
			width: 90%;
		}
		100% {
			left: 100%;
			width: 90%;
		}
	}

	@keyframes secondary-slide {
		0% {
			left: -200%;
			width: 200%;
		}
		60% {
			left: 107%;
			width: 8%;
		}
		100% {
			left: 107%;
			width: 8%;
		}
	}
</style>
