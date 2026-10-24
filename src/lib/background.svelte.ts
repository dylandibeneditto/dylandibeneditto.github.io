export function startBackground(
	canvas: HTMLCanvasElement,
	startPaused = false,
): { pause: () => void; resume: () => void; stop: () => void } {
	const context = canvas.getContext("2d");
	if (!context) {
		return { pause: () => {}, resume: () => {}, stop: () => {} };
	}
	const ctx: CanvasRenderingContext2D = context;

	let frame = 0;
	let paused = startPaused;
	let scale = 1;
	let width = 0;
	let height = 0;
	let mouseX = 0;
	let mouseY = 0;
	const maxDevicePixelRatio = 2;

	function resize() {
		width = window.innerWidth;
		height = window.innerHeight;
		scale = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio);
		canvas.width = Math.round(width * scale);
		canvas.height = Math.round(height * scale);
		ctx.setTransform(scale, 0, 0, scale, 0, 0);
	}

	function draw(t: number) {
		ctx.clearRect(0, 0, width, height);

		const time = t * 0.001;

		// res tall grid
		const resY = 30;
		const resX = resY * (width / height);

		const noiseScale = 0.1;
		const multiplier = 75;
		const k = 3000;
		const distMax = 75;
		ctx.fillStyle = "#000";

		for (let x = 0; x < resX; x++) {
			for (let y = 0; y < resY; y++) {
				let px = ((x - resX / 8) / (resX * 0.75)) * width;
				let py = ((y - resY / 8) / (resY * 0.75)) * height;

				const n =
					perlin(x * noiseScale, y * noiseScale, time * noiseScale) *
					Math.PI *
					2;

				px += Math.cos(n) * multiplier;
				py += Math.sin(n) * multiplier;

				const dx = mouseX - px;
				const dy = mouseY - py;
				const distanceSquared = dx * dx + dy * dy;
				const dist =
					distanceSquared > distMax * distMax
						? Math.sqrt(distanceSquared)
						: distMax;

				const dirx = dx / dist;
				const diry = dy / dist;

				px += -dirx * (k / dist);
				py += -diry * (k / dist);

				ctx.beginPath();
				ctx.arc(px, py, 1, 0, 2 * Math.PI);
				const opacity = n / (Math.PI * 6) + 0.1 - 100 / (t + 0.1);
				ctx.globalAlpha = opacity;
				ctx.fill();
			}
		}

		ctx.globalAlpha = 1;
		if (!paused && !document.hidden) {
			frame = requestAnimationFrame(draw);
		}
	}

	function handleVisibility() {
		if (document.hidden) {
			cancelAnimationFrame(frame);
		} else if (!paused) {
			frame = requestAnimationFrame(draw);
		}
	}

	function pause() {
		paused = true;
		cancelAnimationFrame(frame);
	}

	function resume() {
		if (!paused) return;
		paused = false;
		if (!document.hidden) {
			frame = requestAnimationFrame(draw);
		}
	}

	function handleMouseMove(event: MouseEvent) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}

	resize();
	window.addEventListener("resize", resize, { passive: true });
	document.addEventListener("visibilitychange", handleVisibility);
	document.addEventListener("mousemove", handleMouseMove, { passive: true });
	if (!paused && !document.hidden) {
		frame = requestAnimationFrame(draw);
	}

	return {
		pause,
		resume,
		stop() {
			cancelAnimationFrame(frame);
			window.removeEventListener("resize", resize);
			document.removeEventListener("visibilitychange", handleVisibility);
			document.removeEventListener("mousemove", handleMouseMove);
		},
	};
}

//
// PERLIN NOISE IMPLEMENTATION
//
const PERM = new Uint8Array(512);
const P = new Uint8Array([
	151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,
	140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,
	247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,
	57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,
	74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,
	60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,
	65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,
	200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,
	52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,
	207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,
	119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
	129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,
	218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,
	81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,
	184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,
	222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
]);

for (let i = 0; i < 512; i++) PERM[i] = P[i & 255];

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + t * (b - a);

function grad(hash: number, x: number, y: number, z: number) {
	const h = hash & 15;
	const u = h < 8 ? x : y;
	const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
	return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
}

function perlin(x: number, y: number, z: number): number {
	const X = Math.floor(x) & 255;
	const Y = Math.floor(y) & 255;
	const Z = Math.floor(z) & 255;

	x -= Math.floor(x);
	y -= Math.floor(y);
	z -= Math.floor(z);

	const u = fade(x);
	const v = fade(y);
	const w = fade(z);

	const A  = PERM[X] + Y;
	const AA = PERM[A] + Z;
	const AB = PERM[A + 1] + Z;
	const B  = PERM[X + 1] + Y;
	const BA = PERM[B] + Z;
	const BB = PERM[B + 1] + Z;

	return lerp(
		lerp(
			lerp(grad(PERM[AA], x, y, z),     grad(PERM[BA], x - 1, y, z),     u),
			lerp(grad(PERM[AB], x, y - 1, z), grad(PERM[BB], x - 1, y - 1, z), u),
			v
		),
		lerp(
			lerp(grad(PERM[AA + 1], x, y, z - 1),     grad(PERM[BA + 1], x - 1, y, z - 1),     u),
			lerp(grad(PERM[AB + 1], x, y - 1, z - 1), grad(PERM[BB + 1], x - 1, y - 1, z - 1), u),
			v
		),
		w
	) * 0.5 + 0.5; // normalize to 0 → 1
}
