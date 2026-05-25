<script lang="ts">
	interface Props {
		direction: 'horizontal' | 'vertical';
		onresize: (delta: number) => void;
	}

	let { direction, onresize }: Props = $props();

	let isDragging = $state(false);
	let startPos = $state(0);

	const STEP = 20;

	function handlePointerDown(event: PointerEvent) {
		isDragging = true;
		startPos = direction === 'horizontal' ? event.clientX : event.clientY;
		(event.target as HTMLElement).setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!isDragging) return;
		const currentPos = direction === 'horizontal' ? event.clientX : event.clientY;
		const delta = currentPos - startPos;
		startPos = currentPos;
		onresize(delta);
	}

	function handlePointerUp() {
		isDragging = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		const isHorizontal = direction === 'horizontal';
		let delta = 0;

		if (isHorizontal) {
			if (event.key === 'ArrowLeft') delta = -STEP;
			else if (event.key === 'ArrowRight') delta = STEP;
		} else {
			if (event.key === 'ArrowUp') delta = -STEP;
			else if (event.key === 'ArrowDown') delta = STEP;
		}

		if (delta !== 0) {
			event.preventDefault();
			onresize(delta);
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class={["resizer", direction, isDragging && "dragging"]}
	role="separator"
	aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
	aria-label={direction === 'horizontal' ? 'Resize panels horizontally' : 'Resize panels vertically'}
	aria-valuenow={50}
	tabindex="0"
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
	onkeydown={handleKeydown}
>
	<div class="handle"></div>
</div>

<style>
	.resizer {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--sf-bg-1);
		transition: background var(--sf-transition-fast);
		touch-action: none;
		user-select: none;

		&:hover,
		&.dragging {
			background: var(--sf-accent-subtle);

			& .handle {
				opacity: 1;
			}
		}

		&:focus-visible {
			background: var(--sf-accent-subtle);
			outline: 2px solid var(--sf-accent);
			outline-offset: -2px;

			& .handle {
				opacity: 1;
				background: var(--sf-accent);
			}
		}
	}

	.horizontal {
		inline-size: 6px;
		cursor: col-resize;
		border-inline: 1px solid var(--sf-bg-3);

		& .handle {
			inline-size: 2px;
			block-size: 24px;
		}
	}

	.vertical {
		block-size: 6px;
		cursor: row-resize;
		border-block: 1px solid var(--sf-bg-3);

		& .handle {
			inline-size: 24px;
			block-size: 2px;
		}
	}

	.handle {
		background: var(--sf-text-3);
		border-radius: var(--sf-radius-full);
		opacity: 0;
		transition: opacity var(--sf-transition-fast);
	}
</style>
