<script lang="ts">
	import faviconOutline from "$lib/assets/favicon-outline.svg";
	import { onMount } from "svelte";

	let {
		visible,
		onSpinComplete,
	}: { visible: boolean; onSpinComplete: () => void } = $props();
	let started = $state(false);

	onMount(() => {
		started = true;
	});
</script>

<div class="loading-screen" class:complete={!visible} aria-hidden={!visible}>
	<div class="loader" role="status" aria-label="Loading page">
		<div
			class="gradient-fill"
			style={`--favicon-mask: url("${faviconOutline}")`}
		>
			<div
				class="gradient"
				class:active={started}
				onanimationiteration={onSpinComplete}
			></div>
		</div>
	</div>
</div>

<style>
	.loading-screen {
		position: fixed;
		inset: 0;
		z-index: 10;
		display: grid;
		place-items: center;
		background: var(--bg, #fff);
		opacity: 1;
		transition: opacity 250ms ease;
	}

	.loading-screen.complete {
		visibility: hidden;
		opacity: 0;
		transition:
			opacity 250ms ease,
			visibility 0s linear 250ms;
	}

	.loader {
		position: relative;
		display: grid;
		width: 12rem;
		aspect-ratio: 1;
		place-items: center;
	}

	.gradient-fill {
		position: relative;
		grid-area: 1 / 1;
		width: 8.5rem;
		height: 8.5rem;
		mask: var(--favicon-mask) center / contain no-repeat;
		-webkit-mask: var(--favicon-mask) center / contain no-repeat;
		pointer-events: none;
	}

	.gradient {
		position: absolute;
		inset: -50%;
		background: conic-gradient(
			transparent 0deg,
			transparent 230deg,
			rgba(0, 0, 0, 0.2) 290deg,
			#000 340deg,
			transparent 360deg
		);
	}

	.gradient.active {
		animation: loading-spin 1s linear infinite;
	}

	@keyframes loading-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.loading-screen,
		.loading-screen.complete {
			transition: none;
		}

		.gradient.active {
			animation-duration: 2s;
		}
	}
</style>
