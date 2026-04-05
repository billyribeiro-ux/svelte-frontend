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

A Spring simulates physical spring dynamics with configurable stiffness, damping, and precision. A Tween interpolates linearly with a specified duration and easing function. Both expose .target (what you want) and .current (the animated value), and they integrate with Svelte's reactivity system.

As of svelte@5.55, the public option types are exported directly from svelte/motion: TweenOptions, SpringOptions, SpringUpdateOptions, and Updater. Use them to type-check your configuration objects. For props-driven values, prefer the static Spring.of(fn) and Tween.of(fn) constructors — they re-run whenever the source function's dependencies change. prefersReducedMotion is a built-in MediaQuery that tells you whether the user wants minimal motion.`,
	objectives: [
		'Create animated values with new Spring() and new Tween()',
		'Type configuration with SpringOptions, TweenOptions, SpringUpdateOptions',
		'Bind animations to reactive sources using Spring.of() and Tween.of()',
		'Use .set(value, { instant, preserveMomentum }) for fine-grained control',
		'Respect reduced motion preferences with prefersReducedMotion'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import {
    Spring,
    Tween,
    prefersReducedMotion,
    type SpringOptions,
    type TweenOptions,
    type SpringUpdateOptions
  } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  // Typed options — new in svelte@5.55 (previously inline-only)
  const softSpring: SpringOptions = { stiffness: 0.1, damping: 0.4 };
  const firmSpring: SpringOptions = { stiffness: 0.2, damping: 0.5 };
  const slowTween: TweenOptions<number> = { duration: 1000, easing: cubicOut };

  // Spring for physics-based animation
  const springX = new Spring(0, softSpring);
  const springY = new Spring(0, softSpring);
  const springScale = new Spring(1, firmSpring);

  // Tween for duration-based animation
  const tweenProgress = new Tween(0, slowTween);
  const tweenRotation = new Tween(0, { duration: 600 });

  // Spring for color slider
  const springColor = new Spring(180, { stiffness: 0.05, damping: 0.3 });

  // Spring.of() — binds to a reactive source. The spring chases whatever
  // the function returns, including derived and prop values.
  let sliderValue: number = $state(50);
  const followSpring = Spring.of(() => sliderValue, firmSpring);

  // Force an instant update (bypassing the animation) with .set() options
  function snap() {
    // SpringUpdateOptions: { instant?: boolean; preserveMomentum?: number }
    const opts: SpringUpdateOptions = { instant: true };
    springX.set(0, opts);
    springY.set(0, opts);
  }

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

  // ─────────────────────────────────────────────────────────────
  // Extra demos
  // ─────────────────────────────────────────────────────────────

  // Chain of springs — each one follows the previous with lag
  const chainA = new Spring(0, { stiffness: 0.1, damping: 0.5 });
  const chainB = Spring.of(() => chainA.current, { stiffness: 0.08, damping: 0.5 });
  const chainC = Spring.of(() => chainB.current, { stiffness: 0.06, damping: 0.5 });
  const chainD = Spring.of(() => chainC.current, { stiffness: 0.04, damping: 0.5 });

  function sweep(): void {
    chainA.target = chainA.target === 0 ? 240 : 0;
  }

  // Spring of a derived — value chases a computed source
  let multiplier: number = $state(1);
  let base: number = $state(50);
  const derivedSpring = Spring.of(() => base * multiplier, firmSpring);

  // Scroll-linked tween — manual scroll handler drives a tween
  const scrollTween = new Tween(0, { duration: 250, easing: cubicOut });
  let trackEl: HTMLDivElement | undefined = $state();
  function onTrackScroll(): void {
    if (!trackEl) return;
    const pct = trackEl.scrollLeft / (trackEl.scrollWidth - trackEl.clientWidth);
    scrollTween.target = Math.round(pct * 100);
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
  <div class="canvas" role="application" onmousemove={handleMouseMove}>
    <div
      class="follower"
      style="transform: translate({springX.current}px, {springY.current}px)"
    ></div>
    <p class="canvas-label">Move your mouse here</p>
  </div>
  <button onclick={snap}>Snap to Origin (instant)</button>
</section>

<section>
  <h2>Spring.of() — React to a Source</h2>
  <p>Drag the slider — <code>followSpring</code> chases it automatically:</p>
  <input
    type="range"
    min="0"
    max="200"
    bind:value={sliderValue}
  />
  <div class="followbar">
    <div class="dot" style="transform: translateX({followSpring.current}px)"></div>
  </div>
  <p class="value">target: {sliderValue} • current: {followSpring.current.toFixed(2)}</p>
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
  <h2>Spring Chain — each stage lags the previous</h2>
  <div class="chain">
    <div class="chip a" style="transform: translateX({chainA.current}px)">A</div>
    <div class="chip b" style="transform: translateX({chainB.current}px)">B</div>
    <div class="chip c" style="transform: translateX({chainC.current}px)">C</div>
    <div class="chip d" style="transform: translateX({chainD.current}px)">D</div>
  </div>
  <button onclick={sweep}>Sweep</button>
</section>

<section>
  <h2>Spring.of a derived source</h2>
  <label>base: <input type="range" min="0" max="100" bind:value={base} /> {base}</label>
  <label>× multiplier: <input type="range" min="1" max="5" bind:value={multiplier} /> {multiplier}</label>
  <div class="derived-bar">
    <div class="derived-fill" style="width: {derivedSpring.current}px"></div>
  </div>
  <p class="value">target: {base * multiplier} • current: {derivedSpring.current.toFixed(1)}</p>
</section>

<section>
  <h2>Scroll-linked Tween</h2>
  <p class="hint">Scroll the track horizontally. The indicator below smoothly tweens to the current scroll percentage.</p>
  <div class="track" bind:this={trackEl} onscroll={onTrackScroll}>
    <div class="track-inner"></div>
  </div>
  <div class="scroll-indicator">
    <div class="scroll-fill" style="width: {scrollTween.current}%"></div>
  </div>
  <p class="value">{scrollTween.current.toFixed(0)}%</p>
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
  .followbar {
    position: relative; height: 24px; background: #f8f9fa;
    border-radius: 12px; border: 1px solid #dfe6e9; margin-top: 0.5rem;
  }
  .followbar .dot {
    position: absolute; top: 2px; left: 2px; width: 20px; height: 20px;
    background: #e17055; border-radius: 50%;
  }
  code { background: #fde68a; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }

  .chain { position: relative; height: 60px; margin-bottom: 0.5rem; }
  .chip {
    position: absolute; width: 40px; height: 40px; border-radius: 8px;
    color: white; display: flex; align-items: center; justify-content: center;
    font-weight: 800;
  }
  .chip.a { top: 0; background: #e17055; }
  .chip.b { top: 0; left: 50px; background: #fdcb6e; }
  .chip.c { top: 0; left: 100px; background: #00b894; }
  .chip.d { top: 0; left: 150px; background: #0984e3; }

  .derived-bar { height: 24px; background: #dfe6e9; border-radius: 12px; overflow: hidden; margin: 0.5rem 0; }
  .derived-fill { height: 100%; background: linear-gradient(90deg, #e17055, #fdcb6e); border-radius: 12px; }

  .track {
    width: 100%; height: 60px; overflow-x: auto; background: #f1f3f5;
    border-radius: 8px; margin-bottom: 0.5rem;
  }
  .track-inner { width: 2000px; height: 100%; background: repeating-linear-gradient(90deg, #e17055 0 20px, #fdcb6e 20px 40px); }
  .scroll-indicator { height: 10px; background: #dfe6e9; border-radius: 5px; overflow: hidden; }
  .scroll-fill { height: 100%; background: #e17055; }
  .hint { font-size: 0.82rem; color: #636e72; margin: 0 0 0.5rem; }
  label { display: block; margin-bottom: 0.25rem; font-size: 0.85rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
