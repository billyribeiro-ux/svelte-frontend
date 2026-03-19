import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-6',
		title: 'Spring & Tween Classes: Motion Primitives',
		phase: 5,
		module: 15,
		lessonIndex: 6
	},
	description: `Svelte 5 provides Spring and Tween classes as reactive motion primitives. Unlike transitions that animate enter/leave, these classes create continuously animated values that interpolate between targets over time.

A Spring simulates physical spring dynamics with configurable stiffness, damping, and precision. A Tween interpolates linearly with a specified duration and easing function. Both expose .target (what you want) and .current (the animated value), and they integrate with Svelte's reactivity system. The MediaQuery class and prefersReducedMotion flag help you respect accessibility preferences.`,
	objectives: [
		'Create animated values with new Spring() and new Tween()',
		'Control spring physics with stiffness and damping parameters',
		'Use .target and .current properties for reactive animations',
		'Respect reduced motion preferences with prefersReducedMotion'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import { Spring, Tween, prefersReducedMotion } from 'svelte/motion';

  // Spring for physics-based animation
  const springX = new Spring(0, { stiffness: 0.1, damping: 0.4 });
  const springY = new Spring(0, { stiffness: 0.1, damping: 0.4 });
  const springScale = new Spring(1, { stiffness: 0.2, damping: 0.5 });

  // Tween for duration-based animation
  const tweenProgress = new Tween(0, { duration: 1000 });
  const tweenRotation = new Tween(0, { duration: 600 });

  // Spring for color slider
  const springColor = new Spring(180, { stiffness: 0.05, damping: 0.3 });

  let reducedMotion: boolean = $derived(prefersReducedMotion.current);

  function handleMouseMove(e: MouseEvent): void {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    springX.target = e.clientX - rect.left - 30;
    springY.target = e.clientY - rect.top - 30;
  }

  function bounce(): void {
    springScale.target = 1.5;
    setTimeout(() => { springScale.target = 1; }, 200);
  }

  function animateProgress(): void {
    tweenProgress.target = tweenProgress.target === 0 ? 100 : 0;
  }

  function spin(): void {
    tweenRotation.target += 360;
  }
</script>

<h1>Spring & Tween Motion</h1>

{#if reducedMotion}
  <div class="notice">
    Reduced motion is enabled. Animations will be instant.
  </div>
{/if}

<section>
  <h2>Spring — Follow Cursor</h2>
  <div class="canvas" onmousemove={handleMouseMove}>
    <div
      class="follower"
      style="transform: translate({springX.current}px, {springY.current}px)"
    ></div>
    <p class="canvas-label">Move your mouse here</p>
  </div>
</section>

<section>
  <h2>Spring — Bounce</h2>
  <div class="center">
    <button
      class="bounce-btn"
      onclick={bounce}
      style="transform: scale({springScale.current})"
    >
      Click to Bounce!
    </button>
  </div>
</section>

<section>
  <h2>Tween — Progress Bar</h2>
  <div class="progress-track">
    <div class="progress-fill" style="width: {tweenProgress.current}%"></div>
  </div>
  <p class="value">{tweenProgress.current.toFixed(1)}%</p>
  <button onclick={animateProgress}>
    {tweenProgress.target === 0 ? 'Fill' : 'Empty'}
  </button>
</section>

<section>
  <h2>Tween — Rotation</h2>
  <div class="center">
    <div
      class="spinner-box"
      style="transform: rotate({tweenRotation.current}deg)"
    >
      &#9733;
    </div>
    <button onclick={spin}>Spin +360</button>
  </div>
</section>

<section>
  <h2>Spring — Color Slider</h2>
  <input
    type="range"
    min="0"
    max="360"
    value={springColor.target}
    oninput={(e) => springColor.target = Number((e.target as HTMLInputElement).value)}
  />
  <div
    class="color-swatch"
    style="background: hsl({springColor.current}, 70%, 60%)"
  >
    hsl({Math.round(springColor.current)}, 70%, 60%)
  </div>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; }
  h2 { color: #e17055; font-size: 1.1rem; }
  .notice {
    padding: 0.75rem; background: #ffeaa7; border-radius: 6px;
    margin-bottom: 1rem; font-size: 0.9rem;
  }
  .canvas {
    position: relative; height: 200px; background: #f8f9fa;
    border-radius: 8px; border: 1px solid #dfe6e9; overflow: hidden;
    cursor: crosshair;
  }
  .follower {
    position: absolute; width: 60px; height: 60px;
    background: #e17055; border-radius: 50%;
    pointer-events: none;
  }
  .canvas-label {
    position: absolute; bottom: 0.5rem; left: 50%;
    transform: translateX(-50%); color: #b2bec3; font-size: 0.85rem;
  }
  .center { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
  .bounce-btn {
    padding: 1rem 2rem; border: none; border-radius: 8px;
    background: #e17055; color: white; cursor: pointer;
    font-size: 1.1rem; font-weight: 600;
  }
  .progress-track {
    height: 24px; background: #dfe6e9; border-radius: 12px;
    overflow: hidden; margin-bottom: 0.5rem;
  }
  .progress-fill {
    height: 100%; background: linear-gradient(90deg, #e17055, #fdcb6e);
    border-radius: 12px; transition: none;
  }
  .value { font-family: monospace; font-size: 1.1rem; margin: 0.25rem 0; }
  button {
    padding: 0.5rem 1rem; border: none; border-radius: 4px;
    background: #e17055; color: white; cursor: pointer; font-weight: 600;
  }
  .spinner-box {
    width: 80px; height: 80px; background: #fdcb6e;
    border-radius: 8px; display: flex; align-items: center;
    justify-content: center; font-size: 2.5rem; color: #e17055;
  }
  input[type="range"] { width: 100%; margin-bottom: 0.5rem; }
  .color-swatch {
    padding: 1rem; border-radius: 8px; color: white;
    font-family: monospace; font-weight: 600; text-align: center;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
