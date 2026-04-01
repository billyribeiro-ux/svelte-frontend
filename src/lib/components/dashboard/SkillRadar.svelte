<script lang="ts">
	interface SkillPoint {
		label: string;
		value: number; // 0-100
		color: string;
	}

	interface Props {
		skills: SkillPoint[];
	}

	let { skills }: Props = $props();

	let canvas = $state<HTMLCanvasElement | null>(null);

	$effect(() => {
		if (!canvas || skills.length === 0) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const size = 220;
		canvas.width = size * dpr;
		canvas.height = size * dpr;
		canvas.style.width = `${size}px`;
		canvas.style.height = `${size}px`;
		ctx.scale(dpr, dpr);

		const cx = size / 2;
		const cy = size / 2;
		const maxR = 80;
		const n = skills.length;
		const angleStep = (Math.PI * 2) / n;

		ctx.clearRect(0, 0, size, size);

		// Background rings
		for (let ring = 1; ring <= 4; ring++) {
			const r = (maxR / 4) * ring;
			ctx.beginPath();
			for (let i = 0; i <= n; i++) {
				const angle = i * angleStep - Math.PI / 2;
				const x = cx + Math.cos(angle) * r;
				const y = cy + Math.sin(angle) * r;
				i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
			}
			ctx.closePath();
			ctx.strokeStyle = 'rgba(128, 128, 128, 0.15)';
			ctx.lineWidth = 1;
			ctx.stroke();
		}

		// Axis lines
		for (let i = 0; i < n; i++) {
			const angle = i * angleStep - Math.PI / 2;
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
			ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)';
			ctx.stroke();
		}

		// Data polygon
		ctx.beginPath();
		for (let i = 0; i <= n; i++) {
			const idx = i % n;
			const angle = idx * angleStep - Math.PI / 2;
			const r = (skills[idx]!.value / 100) * maxR;
			const x = cx + Math.cos(angle) * r;
			const y = cy + Math.sin(angle) * r;
			i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
		}
		ctx.closePath();
		ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
		ctx.fill();
		ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
		ctx.lineWidth = 2;
		ctx.stroke();

		// Data points
		for (let i = 0; i < n; i++) {
			const angle = i * angleStep - Math.PI / 2;
			const r = (skills[i]!.value / 100) * maxR;
			const x = cx + Math.cos(angle) * r;
			const y = cy + Math.sin(angle) * r;

			ctx.beginPath();
			ctx.arc(x, y, 4, 0, Math.PI * 2);
			ctx.fillStyle = 'rgba(99, 102, 241, 1)';
			ctx.fill();
		}

		// Labels
		ctx.font = '11px system-ui';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		for (let i = 0; i < n; i++) {
			const angle = i * angleStep - Math.PI / 2;
			const r = maxR + 18;
			const x = cx + Math.cos(angle) * r;
			const y = cy + Math.sin(angle) * r;
			ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
			ctx.fillText(skills[i]!.label, x, y);
		}
	});
</script>

<div class="skill-radar">
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.skill-radar {
		display: flex;
		justify-content: center;
		padding: var(--sf-space-3);
	}
</style>
