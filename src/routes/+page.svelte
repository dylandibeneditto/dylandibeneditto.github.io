<script lang="ts">
	import { startBackground } from "$lib/background.svelte";
	import { triggerAnimateEffect } from "$lib/animateLoad.svelte";
	import { onMount } from "svelte";
	import Header from "$lib/components/header.svelte";
	import Projects from "$lib/components/projects.svelte";
	import Footer from "$lib/components/footer.svelte";
	import LoadingScreen from "$lib/components/loading-screen.svelte";

	let canvas: HTMLCanvasElement;
	let isLoading = $state(true);
	let spinComplete = false;
	let pageReady = false;
	let revealTimer: number | undefined;
	let resumeTimer: number | undefined;
	let resumeBackground: (() => void) | undefined;

	function revealWhenReady() {
		if (!spinComplete || !pageReady || revealTimer !== undefined) return;

		revealTimer = window.setTimeout(() => {
			isLoading = false;
			resumeTimer = window.setTimeout(() => resumeBackground?.(), 250);
		}, 250);
	}

	function handleSpinComplete() {
		spinComplete = true;
		revealWhenReady();
	}

	onMount(() => {
		const background = startBackground(canvas, true);
		resumeBackground = background.resume;
		let animationStarted = false;

		const runAnimation = () => {
			if (animationStarted) return;
			animationStarted = true;
			window.clearTimeout(fallbackTimer);
			window.removeEventListener("load", runAnimation);
			triggerAnimateEffect();
			pageReady = true;
			revealWhenReady();
		};

		const fallbackTimer = window.setTimeout(runAnimation, 5000);

		if (document.readyState === "complete") {
			runAnimation();
		} else {
			window.addEventListener("load", runAnimation, { once: true });
		}

		return () => {
			background.stop();
			resumeBackground = undefined;
			window.clearTimeout(fallbackTimer);
			window.clearTimeout(revealTimer);
			window.clearTimeout(resumeTimer);
			window.removeEventListener("load", runAnimation);
		};
	});
</script>

<LoadingScreen visible={isLoading} onSpinComplete={handleSpinComplete} />

<canvas
	bind:this={canvas}
></canvas>

<div class="page">
	<div></div>
	<Header />
	<div></div>
	<Projects />
	<div></div>
	<Footer />
</div>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: block;
		z-index: 0;
		pointer-events: none;
	}

	.page {
		display: grid;
		grid-template-rows: 10rem auto 5rem auto 5rem auto;
		z-index: 1;
		width: 100dvw;
		height: fit-content;
		justify-content: center;
		justify-items: center;
		background: none;
	}
</style>
