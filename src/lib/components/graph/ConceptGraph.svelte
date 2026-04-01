<script lang="ts">
	import { graphState } from '$lib/stores/graph.svelte';
	import type { ConceptCategory } from '$types/concept';

	const CATEGORY_COLORS: Record<ConceptCategory, string> = {
		html: 'oklch(0.70 0.20 25)',
		css: 'oklch(0.70 0.15 230)',
		typescript: 'oklch(0.78 0.15 75)',
		svelte: 'oklch(0.65 0.25 275)',
		sveltekit: 'oklch(0.72 0.19 155)'
	};

	const MASTERY_OPACITY: Record<string, number> = {
		unstarted: 0.4,
		introduced: 0.6,
		practicing: 0.7,
		competent: 0.85,
		mastered: 1.0
	};

	const CATEGORY_LABELS: ConceptCategory[] = ['html', 'css', 'typescript', 'svelte', 'sveltekit'];

	interface SimNode {
		id: string;
		x: number;
		y: number;
		vx: number;
		vy: number;
		radius: number;
		color: string;
		opacity: number;
		title: string;
		category: ConceptCategory;
	}

	let canvas: HTMLCanvasElement | undefined = $state();
	let simNodes: SimNode[] = $state([]);
	let animationId = 0;

	// Camera state
	let camX = $state(0);
	let camY = $state(0);
	let camZoom = $state(1);

	// Interaction state
	let dragging = $state(false);
	let dragStartX = 0;
	let dragStartY = 0;
	let camStartX = 0;
	let camStartY = 0;
	let hoveredNodeId: string | null = $state(null);

	function screenToWorld(sx: number, sy: number, rect: DOMRect) {
		return {
			wx: (sx - rect.left - rect.width / 2) / camZoom + camX,
			wy: (sy - rect.top - rect.height / 2) / camZoom + camY
		};
	}

	function initSimulation() {
		const nodes = graphState.nodes;
		if (nodes.length === 0) return;

		simNodes = nodes.map((n, i) => {
			const angle = (i / nodes.length) * Math.PI * 2;
			const spread = 200 + Math.random() * 150;
			return {
				id: n.id,
				x: Math.cos(angle) * spread + (Math.random() - 0.5) * 80,
				y: Math.sin(angle) * spread + (Math.random() - 0.5) * 80,
				vx: 0,
				vy: 0,
				radius: 8 + n.difficulty * 2,
				color: CATEGORY_COLORS[n.category],
				opacity: MASTERY_OPACITY[n.mastery] ?? 0.4,
				title: n.title,
				category: n.category
			};
		});
	}

	function simulate() {
		const damping = 0.85;
		const repulsion = 3000;
		const attraction = 0.005;
		const gravity = 0.02;
		const nodeMap = new Map(simNodes.map((n) => [n.id, n]));

		for (let i = 0; i < simNodes.length; i++) {
			const a = simNodes[i]!;

			// Gravity toward center
			a.vx -= a.x * gravity;
			a.vy -= a.y * gravity;

			// Node-node repulsion
			for (let j = i + 1; j < simNodes.length; j++) {
				const b = simNodes[j]!;
				let dx = a.x - b.x;
				let dy = a.y - b.y;
				const distSq = dx * dx + dy * dy + 1;
				const force = repulsion / distSq;
				const fx = dx * force;
				const fy = dy * force;
				a.vx += fx;
				a.vy += fy;
				b.vx -= fx;
				b.vy -= fy;
			}
		}

		// Edge attraction
		for (const edge of graphState.edges) {
			const source = nodeMap.get(edge.source);
			const target = nodeMap.get(edge.target);
			if (!source || !target) continue;
			const dx = target.x - source.x;
			const dy = target.y - source.y;
			const fx = dx * attraction * edge.weight;
			const fy = dy * attraction * edge.weight;
			source.vx += fx;
			source.vy += fy;
			target.vx -= fx;
			target.vy -= fy;
		}

		// Apply velocity
		for (const node of simNodes) {
			node.vx *= damping;
			node.vy *= damping;
			node.x += node.vx;
			node.y += node.vy;
		}
	}

	function render() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		ctx.clearRect(0, 0, rect.width, rect.height);
		ctx.save();
		ctx.translate(rect.width / 2, rect.height / 2);
		ctx.scale(camZoom, camZoom);
		ctx.translate(-camX, -camY);

		const nodeMap = new Map(simNodes.map((n) => [n.id, n]));
		const filteredSet = new Set(graphState.filteredNodes.map((n) => n.id));
		const hasFilter = graphState.filterCategory !== null || graphState.searchQuery !== '';

		// Draw edges
		for (const edge of graphState.edges) {
			const source = nodeMap.get(edge.source);
			const target = nodeMap.get(edge.target);
			if (!source || !target) continue;

			const visible = !hasFilter || (filteredSet.has(source.id) && filteredSet.has(target.id));
			ctx.beginPath();
			ctx.moveTo(source.x, source.y);
			ctx.lineTo(target.x, target.y);
			ctx.strokeStyle = visible ? 'oklch(0.60 0.02 260 / 0.3)' : 'oklch(0.60 0.02 260 / 0.06)';
			ctx.lineWidth = edge.type === 'prerequisite' ? 1.5 : 1;
			ctx.stroke();
		}

		// Draw nodes
		for (const node of simNodes) {
			const visible = !hasFilter || filteredSet.has(node.id);
			const selected = graphState.selectedNodeId === node.id;
			const hovered = hoveredNodeId === node.id;
			const alpha = visible ? node.opacity : 0.08;

			ctx.beginPath();
			ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
			ctx.fillStyle = node.color;
			ctx.globalAlpha = alpha;
			ctx.fill();
			ctx.globalAlpha = 1;

			if (selected) {
				ctx.strokeStyle = 'oklch(0.95 0 0)';
				ctx.lineWidth = 3;
				ctx.stroke();
			} else if (hovered && visible) {
				ctx.strokeStyle = 'oklch(0.85 0 0 / 0.6)';
				ctx.lineWidth = 2;
				ctx.stroke();
			}

			// Label
			if (camZoom > 0.5 && visible) {
				ctx.font = `${Math.max(10, 12 / camZoom * 0.8)}px system-ui, sans-serif`;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'top';
				ctx.fillStyle = visible ? 'oklch(0.85 0 0 / 0.9)' : 'oklch(0.85 0 0 / 0.15)';
				ctx.fillText(node.title, node.x, node.y + node.radius + 4);
			}
		}

		ctx.restore();
	}

	function tick() {
		simulate();
		render();
		animationId = requestAnimationFrame(tick);
	}

	function findNodeAt(sx: number, sy: number): string | null {
		if (!canvas) return null;
		const rect = canvas.getBoundingClientRect();
		const { wx, wy } = screenToWorld(sx, sy, rect);

		for (let i = simNodes.length - 1; i >= 0; i--) {
			const node = simNodes[i]!;
			const dx = wx - node.x;
			const dy = wy - node.y;
			if (dx * dx + dy * dy <= (node.radius + 4) * (node.radius + 4)) {
				return node.id;
			}
		}
		return null;
	}

	function handlePointerDown(e: PointerEvent) {
		const nodeId = findNodeAt(e.clientX, e.clientY);
		if (nodeId) {
			graphState.selectNode(nodeId);
			return;
		}
		dragging = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		camStartX = camX;
		camStartY = camY;
	}

	function handlePointerMove(e: PointerEvent) {
		if (dragging) {
			camX = camStartX - (e.clientX - dragStartX) / camZoom;
			camY = camStartY - (e.clientY - dragStartY) / camZoom;
		} else {
			hoveredNodeId = findNodeAt(e.clientX, e.clientY);
		}
	}

	function handlePointerUp() {
		dragging = false;
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const factor = e.deltaY > 0 ? 0.9 : 1.1;
		camZoom = Math.min(4, Math.max(0.15, camZoom * factor));
	}

	// Initialize simulation when nodes change
	$effect(() => {
		if (graphState.nodes.length > 0 && simNodes.length === 0) {
			initSimulation();
		}
	});

	// Start / stop render loop
	$effect(() => {
		if (!canvas || simNodes.length === 0) return;
		animationId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(animationId);
	});
</script>

<div class="graph-controls">
	<div class="graph-search">
		<input
			class="graph-search-input"
			type="search"
			placeholder="Search concepts..."
			value={graphState.searchQuery}
			oninput={(e) => { graphState.searchQuery = (e.target as HTMLInputElement).value; }}
		/>
	</div>

	<div class="graph-filters">
		<button
			class="filter-chip"
			class:active={graphState.filterCategory === null}
			onclick={() => graphState.setFilter(null)}
		>
			All
		</button>
		{#each CATEGORY_LABELS as cat}
			<button
				class="filter-chip"
				class:active={graphState.filterCategory === cat}
				style:--chip-color={CATEGORY_COLORS[cat]}
				onclick={() => graphState.setFilter(graphState.filterCategory === cat ? null : cat)}
			>
				{cat}
			</button>
		{/each}
	</div>
</div>

<!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
<canvas
	bind:this={canvas}
	class="graph-canvas"
	class:grabbing={dragging}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointerleave={handlePointerUp}
	onwheel={handleWheel}
	role="img"
	aria-label="Interactive concept graph visualization"
></canvas>

<style>
	.graph-controls {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-3);
		padding-block-end: var(--sf-space-3);
	}

	.graph-search {
		inline-size: 100%;
	}

	.graph-search-input {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-base);
		color: var(--sf-text-0);
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-4);
		border-radius: var(--sf-radius-md);
		padding-block: var(--sf-space-2);
		padding-inline: var(--sf-space-3);
		inline-size: 100%;
		outline: none;
		transition: border-color var(--sf-transition-fast), box-shadow var(--sf-transition-fast);

		&::placeholder {
			color: var(--sf-text-3);
		}

		&:focus {
			border-color: var(--sf-accent);
			box-shadow: 0 0 0 2px var(--sf-accent-subtle);
		}
	}

	.graph-filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sf-space-2);
	}

	.filter-chip {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xs);
		font-weight: 500;
		color: var(--sf-text-2);
		background: var(--sf-bg-2);
		border: 1px solid var(--sf-bg-4);
		border-radius: var(--sf-radius-full);
		padding-block: var(--sf-space-1);
		padding-inline: var(--sf-space-3);
		cursor: pointer;
		transition: background var(--sf-transition-fast), color var(--sf-transition-fast),
			border-color var(--sf-transition-fast);

		&:hover {
			background: var(--sf-bg-3);
			color: var(--sf-text-1);
		}

		&.active {
			background: var(--chip-color, var(--sf-accent));
			color: oklch(0.15 0 0);
			border-color: transparent;
		}
	}

	.graph-canvas {
		inline-size: 100%;
		block-size: 100%;
		border-radius: var(--sf-radius-lg);
		background: var(--sf-bg-0);
		cursor: grab;
		touch-action: none;

		&.grabbing {
			cursor: grabbing;
		}
	}
</style>
