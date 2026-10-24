<script lang="ts">
	import { startBackground } from "$lib/background.svelte";
	import { triggerAnimateEffect } from "$lib/animateLoad.svelte";
	import { onMount } from "svelte";
	import Photo from "$lib/components/photo.svelte";
	import LoadingScreen from "$lib/components/loading-screen.svelte";

	let canvas: HTMLCanvasElement;
	let photosContainer: HTMLDivElement;
	let imageObserver: IntersectionObserver | undefined;
	let layoutFrame = 0;
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
			layoutMasonry();
			setupLazyLoading();
			pageReady = true;
			revealWhenReady();
		};

		const fallbackTimer = window.setTimeout(runAnimation, 5000);

		if (document.readyState === "complete") {
			runAnimation();
		} else {
			window.addEventListener("load", runAnimation, { once: true });
		}

		window.addEventListener("resize", scheduleMasonryLayout, { passive: true });

		return () => {
			background.stop();
			resumeBackground = undefined;
			imageObserver?.disconnect();
			cancelAnimationFrame(layoutFrame);
			window.clearTimeout(fallbackTimer);
			window.clearTimeout(revealTimer);
			window.clearTimeout(resumeTimer);
			window.removeEventListener("load", runAnimation);
			window.removeEventListener("resize", scheduleMasonryLayout);
		};
	});

	function setupLazyLoading() {
		if (!photosContainer) return;

		const items = Array.from(photosContainer.children) as HTMLElement[];

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const photoElement = entry.target as HTMLElement;
						const img = photoElement.querySelector("img");

						if (img && !img.complete) {
							// Image hasn't loaded yet, wait for it
							img.addEventListener(
								"load",
								() => {
									photoElement.classList.remove("hidden");
									photoElement.classList.add("animate");
									scheduleMasonryLayout();
								},
								{ once: true },
							);
						} else {
							// Image already loaded
							photoElement.classList.remove("hidden");
							photoElement.classList.add("animate");
						}

						observer.unobserve(entry.target);
					}
				});
			},
			{
				rootMargin: "100px", // Start loading before entering viewport
				threshold: 0.01,
			},
		);
		imageObserver = observer;

		items.forEach((item) => {
			observer.observe(item);
		});
	}

	function scheduleMasonryLayout() {
		if (layoutFrame) return;

		layoutFrame = requestAnimationFrame(() => {
			layoutFrame = 0;
			layoutMasonry();
		});
	}

	function layoutMasonry() {
		if (!photosContainer) return;

		const items = Array.from(photosContainer.children) as HTMLElement[];
		const containerWidth = photosContainer.offsetWidth;
		const gap = 16; // 1rem
		const minColumnWidth = 500; // Minimum width per column
		const maxColumnWidth = 800; // Maximum width per column

		// Calculate optimal number of columns
		let columnCount = Math.floor(
			(containerWidth + gap) / (minColumnWidth + gap),
		);
		columnCount = Math.max(1, columnCount); // At least 1 column

		// Calculate actual column width to fill space perfectly
		const columnWidth =
			(containerWidth - gap * (columnCount - 1)) / columnCount;

		// If columns would be too wide, add more columns
		if (columnWidth > maxColumnWidth && columnCount < items.length) {
			columnCount = Math.floor(
				(containerWidth + gap) / (maxColumnWidth + gap),
			);
			columnCount = Math.max(1, columnCount);
		}

		// Recalculate column width with final column count
		const finalColumnWidth =
			(containerWidth - gap * (columnCount - 1)) / columnCount;

		if (columnCount <= 1) {
			// Single column - just stack normally
			items.forEach((item) => {
				item.style.position = "";
				item.style.left = "";
				item.style.top = "";
				item.style.width = "100%";
			});
			photosContainer.style.position = "";
			photosContainer.style.height = "";
			return;
		}

		// Initialize column heights
		photosContainer.style.position = "relative";

		items.forEach((item) => {
			item.style.position = "absolute";
			item.style.left = "";
			item.style.top = "";
			item.style.width = `${finalColumnWidth}px`;
		});

		const itemHeights = items.map((item) => item.offsetHeight);
		const columnHeights = new Array<number>(columnCount).fill(0);

		items.forEach((item, index) => {
			// Find shortest column
			const shortestColumn = columnHeights.indexOf(
				Math.min(...columnHeights),
			);

			// Position item
			item.style.left = `${shortestColumn * (finalColumnWidth + gap)}px`;
			item.style.top = `${columnHeights[shortestColumn]}px`;

			// Update column height
			columnHeights[shortestColumn] += itemHeights[index] + gap;
		});

		// Set container height
		photosContainer.style.height = `${Math.max(...columnHeights)}px`;
	}
</script>

<LoadingScreen visible={isLoading} onSpinComplete={handleSpinComplete} />

<canvas
	bind:this={canvas}
></canvas>

<div class="page animate-on-load">
	<a href="/" data-sveltekit-reload class="back hidden">Go Back</a>
	<div class="photos no-animate" bind:this={photosContainer}>
		<Photo
			image="pictures/cascades1-sep7.jpg"
			location="Cascades, VA"
			time="Sep '26"
		/>
		<Photo
			image="pictures/cascades2-sep7.jpg"
			location="Cascades, VA"
			time="Sep '26"
		/>
		<Photo
			image="pictures/obx1-aug7.jpg"
			location="Outer Banks"
			time="Aug '26"
		/>
		<Photo
			image="pictures/obx2-aug7.jpg"
			location="Outer Banks"
			time="Aug '26"
		/>
		<Photo
			image="pictures/obx3-aug7.jpg"
			location="Outer Banks"
			time="Aug '26"
		/>
		<Photo
			image="pictures/obx4-aug7.jpg"
			location="Outer Banks"
			time="Aug '26"
		/>
		<Photo
			image="pictures/obx5-aug7.jpg"
			location="Outer Banks"
			time="Aug '26"
		/>
		<Photo
			image="pictures/obx6-aug7.JPG"
			location="Outer Banks"
			time="Aug '26"
		/>
		<Photo
			image="pictures/obx7-aug7.jpg"
			location="Outer Banks"
			time="Aug '26"
		/>
		<Photo
			image="pictures/bears3-may25.JPG"
			location="Bear's Den, VA"
			time="May '25"
		/>
		<Photo
			image="pictures/massive-july25.jpg"
			location="Leadville, CO"
			time="July '25"
		/>
		<Photo
			image="pictures/massive2-july25.jpg"
			location="Leadville, CO"
			time="July '25"
		/>
		<Photo
			image="pictures/elbert-july25.jpg"
			location="Leadville, CO"
			time="July '25"
		/>
		<Photo
			image="pictures/elbert2-july25.jpg"
			location="Leadville, CO"
			time="July '25"
		/>

		<Photo
			image="pictures/billy-oct25.jpg"
			location="Great Falls National Park"
			time="Oct '25"
		/>
		<Photo
			image="pictures/billy2-oct25.jpg"
			location="Great Falls National Park"
			time="Oct '25"
		/>
		<Photo
			image="pictures/billy3-oct25.jpg"
			location="Great Falls National Park"
			time="Oct '25"
		/>
		<Photo
			image="pictures/billy4-oct25.jpg"
			location="Great Falls National Park"
			time="Oct '25"
		/>
		<Photo
			image="pictures/billy5-oct25.jpg"
			location="Great Falls National Park"
			time="Oct '25"
		/>

		<Photo
			image="pictures/turks-july25.jpg"
			location="Turks and Caicos"
			time="July '25"
		/>

		<Photo
			image="pictures/bears-may25.jpg"
			location="Bear's Den, VA"
			time="May '25"
		/>
		<Photo
			image="pictures/bears2-may25.jpg"
			location="Bear's Den, VA"
			time="May '25"
		/>

		<Photo
			image="pictures/billy-aug24.jpg"
			location="Great Falls National Park"
			time="Aug '24"
		/>
		<Photo
			image="pictures/billy2-aug24.jpg"
			location="Great Falls National Park"
			time="Aug '24"
		/>
		<Photo
			image="pictures/billy3-aug24.jpg"
			location="Great Falls National Park"
			time="Aug '24"
		/>
		<Photo
			image="pictures/billy4-aug24.jpg"
			location="Great Falls National Park"
			time="Aug '24"
		/>
		<Photo
			image="pictures/billy5-aug24.jpg"
			location="Great Falls National Park"
			time="Aug '24"
		/>
		<Photo
			image="pictures/billy6-aug24.jpg"
			location="Great Falls National Park"
			time="Aug '24"
		/>
		<Photo
			image="pictures/billy7-aug24.jpg"
			location="Great Falls National Park"
			time="Aug '24"
		/>
		<Photo
			image="pictures/billy8-aug24.jpg"
			location="Great Falls National Park"
			time="Aug '24"
		/>
		<Photo
			image="pictures/billy9-aug24.jpg"
			location="Great Falls National Park"
			time="Aug '24"
		/>
		<Photo
			image="pictures/billy10-aug24.jpg"
			location="Great Falls National Park"
			time="Aug '24"
		/>
		<Photo
			image="pictures/billy11-aug24.jpg"
			location="Great Falls National Park"
			time="Aug '24"
		/>

		<Photo
			image="pictures/rocky-july24.jpg"
			location="Rocky Mountain National Park"
			time="July '24"
		/>

		<Photo
			image="pictures/raven-sep24.jpg"
			location="Raven Rocks, WV"
			time="Sep '24"
		/>

		<Photo
			image="pictures/hawks-nov24.jpg"
			location="Shenendoah National Park"
			time="Nov '24"
		/>
		<Photo
			image="pictures/hawks2-nov24.jpg"
			location="Shenendoah National Park"
			time="Nov '24"
		/>
		<Photo
			image="pictures/hawks3-nov24.jpg"
			location="Shenendoah National Park"
			time="Nov '24"
		/>
		<Photo
			image="pictures/hawks4-nov24.jpg"
			location="Shenendoah National Park"
			time="Nov '24"
		/>

		<Photo
			image="pictures/buzzard-dec24.jpg"
			location="Buzzard Hill, VA"
			time="Dec '24"
		/>
		<Photo
			image="pictures/buzzard2-dec24.jpg"
			location="Buzzard Hill, VA"
			time="Dec '24"
		/>
		<Photo
			image="pictures/buzzard3-dec24.jpg"
			location="Buzzard Hill, VA"
			time="Dec '24"
		/>
	</div>
</div>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: block;
		z-index: -1;
	}

	.back {
		margin-top: 2rem;
		padding: 1rem;
		backdrop-filter: blur(2px);
		text-decoration: none;
		transition: all 0.3s ease;
		font-size: 16px;
	}

	.back:hover {
		opacity: 0.7 !important;
	}

	.page {
		width: 90vw;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		position: absolute;
		left: 50dvw;
		transform: translateX(-50%);
	}

	.photos {
		width: 100%;
	}
</style>
