<script lang="ts">
	import type { CompilationResult } from '$types/editor';

	interface Props {
		compilationResult: CompilationResult | null;
	}

	let { compilationResult }: Props = $props();

	let canvas = $state<HTMLCanvasElement | null>(null);

	interface GraphNode {
		id: string;
		label: string;
		type: 'state' | 'derived' | 'effect' | 'props' | 'other';
		x: number;
		y: number;
		vx: number;
		vy: number;
	}

	interface GraphEdge {
		source: string;
		target: string;
	}

	let nodes = $derived.by(() => {
		const runes = compilationResult?.metadata.runes ?? [];
		const result: GraphNode[] = [];
		const centerX = 200;
		const centerY = 120;

		for (const rune of runes) {
			let type: GraphNode['type'] = 'other';
			if (rune.startsWith('$state')) type = 'state';
			else if (rune.startsWith('$derived')) type = 'derived';
			else if (rune.startsWith('$effect')) type = 'effect';
			else if (rune === '$props' || rune === '$bindable') type = 'props';

			result.push({
				id: rune,
				label: rune,
				type,
				x: centerX + (Math.random() - 0.5) * 200,
				y: centerY + (Math.random() - 0.5) * 150,
				vx: 0,
				vy: 0
			});
		}
		return result;
	});

	let edges = $derived.by(() => {
		const result: GraphEdge[] = [];
		const runeIds = nodes.map((n) => n.id);

		// State -> Derived dependency
		const hasState = runeIds.some((r) => r.startsWith('$state'));
		const derivedNodes = runeIds.filter((r) => r.startsWith('$derived'));
		const effectNodes = runeIds.filter((r) => r.startsWith('$effect'));
		const stateNode = runeIds.find((r) => r === '$state') ?? runeIds.find((r) => r.startsWith('$state'));

		if (stateNode) {
			for (const d of derivedNodes) {
				result.push({ source: stateNode, target: d });
			}
			for (const e of effectNodes) {
				result.push({ source: stateNode, target: e });
			}
		}

		// Derived -> Effect
		for (const d of derivedNodes) {
			for (const e of effectNodes) {
				result.push({ source: d, target: e });
			}
		}

		// Props -> State
		const propsNode = runeIds.find((r) => r === '$props');
		if (propsNode && stateNode) {
			result.push({ source: propsNode, target: stateNode });
		}

		return result;
	});

	const typeColors: Record<string, string> = {
		state: '#ef4444',
		derived: '#3b82f6',
		effect: '#a855f7',
		props: '#22c55e',
		other: '#6b7280'
	};

	$effect(() => {
		if (!canvas || nodes.length === 0) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		ctx.scale(dpr, dpr);

		// Simple force layout
		const simNodes = nodes.map((n) => ({ ...n }));
		const iterations = 50;

		for (let i = 0; i < iterations; i++) {
			// Repulsion
			for (let a = 0; a < simNodes.length; a++) {
				for (let b = a + 1; b < simNodes.length; b++) {
					const dx = simNodes[b]!.x - simNodes[a]!.x;
					const dy = simNodes[b]!.y - simNodes[a]!.y;
					const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
					const force = 2000 / (dist * dist);
					const fx = (dx / dist) * force;
					const fy = (dy / dist) * force;
					simNodes[a]!.x -= fx;
					simNodes[a]!.y -= fy;
					simNodes[b]!.x += fx;
					simNodes[b]!.y += fy;
				}
			}

			// Attraction (edges)
			for (const edge of edges) {
				const a = simNodes.find((n) => n.id === edge.source);
				const b = simNodes.find((n) => n.id === edge.target);
				if (!a || !b) continue;
				const dx = b.x - a.x;
				const dy = b.y - a.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const force = (dist - 80) * 0.01;
				const fx = (dx / Math.max(dist, 1)) * force;
				const fy = (dy / Math.max(dist, 1)) * force;
				a.x += fx;
				a.y += fy;
				b.x -= fx;
				b.y -= fy;
			}

			// Center gravity
			const cx = rect.width / 2;
			const cy = rect.height / 2;
			for (const node of simNodes) {
				node.x += (cx - node.x) * 0.01;
				node.y += (cy - node.y) * 0.01;
			}
		}

		// Draw
		ctx.clearRect(0, 0, rect.width, rect.height);

		// Edges
		ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
		ctx.lineWidth = 1.5;
		for (const edge of edges) {
			const a = simNodes.find((n) => n.id === edge.source);
			const b = simNodes.find((n) => n.id === edge.target);
			if (!a || !b) continue;

			ctx.beginPath();
			ctx.moveTo(a.x, a.y);
			ctx.lineTo(b.x, b.y);
			ctx.stroke();

			// Arrow head
			const angle = Math.atan2(b.y - a.y, b.x - a.x);
			const arrowLen = 8;
			const endX = b.x - Math.cos(angle) * 16;
			const endY = b.y - Math.sin(angle) * 16;
			ctx.beginPath();
			ctx.moveTo(endX, endY);
			ctx.lineTo(endX - arrowLen * Math.cos(angle - 0.4), endY - arrowLen * Math.sin(angle - 0.4));
			ctx.lineTo(endX - arrowLen * Math.cos(angle + 0.4), endY - arrowLen * Math.sin(angle + 0.4));
			ctx.closePath();
			ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
			ctx.fill();
		}

		// Nodes
		for (const node of simNodes) {
			const color = typeColors[node.type] ?? '#6b7280';
			const radius = 14;

			// Glow
			ctx.shadowColor = color;
			ctx.shadowBlur = 8;

			ctx.beginPath();
			ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
			ctx.fillStyle = color;
			ctx.fill();

			ctx.shadowBlur = 0;

			// Label
			ctx.fillStyle = '#fff';
			ctx.font = '10px system-ui';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(node.label, node.x, node.y + radius + 14);
		}

		// Legend
		ctx.shadowBlur = 0;
		const legend = [
			{ label: '$state', color: typeColors.state },
			{ label: '$derived', color: typeColors.derived },
			{ label: '$effect', color: typeColors.effect },
			{ label: '$props', color: typeColors.props }
		];
		let lx = 12;
		const ly = rect.height - 20;
		ctx.font = '11px system-ui';
		for (const item of legend) {
			ctx.fillStyle = item.color ?? '#6b7280';
			ctx.beginPath();
			ctx.arc(lx, ly, 5, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
			ctx.textAlign = 'left';
			ctx.fillText(item.label, lx + 10, ly + 1);
			lx += ctx.measureText(item.label).width + 28;
		}
	});
</script>

<div class="reactivity-graph">
	{#if nodes.length === 0}
		<div class="empty">
			No runes detected in current code. Add <code>$state</code>, <code>$derived</code>, or <code>$effect</code> to see the reactivity graph.
		</div>
	{:else}
		<canvas bind:this={canvas} class="graph-canvas"></canvas>
	{/if}
</div>

<style>
	.reactivity-graph {
		block-size: 100%;
		background: var(--sf-bg-0);
	}

	.graph-canvas {
		inline-size: 100%;
		block-size: 100%;
	}

	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		block-size: 100%;
		color: var(--sf-text-3);
		font-size: var(--sf-font-size-sm);
		padding: var(--sf-space-4);

		:global(code) {
			font-family: var(--sf-font-mono);
			background: var(--sf-bg-3);
			padding: 0.1em 0.3em;
			border-radius: var(--sf-radius-sm);
			color: var(--sf-syntax-rune);
		}
	}
</style>
