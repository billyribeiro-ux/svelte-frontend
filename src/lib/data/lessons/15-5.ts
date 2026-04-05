import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-5',
		title: 'Transitions & Animations',
		phase: 5,
		module: 15,
		lessonIndex: 5
	},
	description: `Transitions in Svelte animate elements as they enter or leave the DOM. The transition: directive applies the same animation in both directions; in: and out: let you pick different animations for enter and exit. Svelte ships fade, fly, slide, scale, blur, and draw (for SVG), and you can compose them with easing functions from svelte/easing for the full range of natural motion.

For fully custom animations, write a function that returns a { duration, easing, css, tick } object. The css callback returns a CSS string interpolated from t (progress 0→1) and u (1−t). Custom transitions let you animate anything CSS can express — rotation, skew, complex gradients, clip-paths — all declaratively and with perfect interruption handling.`,
	objectives: [
		'Apply the built-in transitions fade, fly, slide, scale, blur, and draw',
		'Choose between transition:, in:, and out: for the right effect',
		'Tune duration, delay, and easing from svelte/easing',
		'Write a custom transition function for bespoke motion'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import { fade, fly, slide, scale, blur, draw } from 'svelte/transition';
  import {
    cubicOut,
    quintOut,
    elasticOut,
    bounceOut,
    expoOut,
    backOut
  } from 'svelte/easing';

  // Toggle states
  let showFade: boolean = $state(false);
  let showFly: boolean = $state(false);
  let showSlide: boolean = $state(false);
  let showScale: boolean = $state(false);
  let showBlur: boolean = $state(false);
  let showDraw: boolean = $state(false);
  let showAsym: boolean = $state(false);
  let showCustom: boolean = $state(false);

  // Toast system
  interface Toast { id: number; kind: 'success' | 'info' | 'error'; text: string; }
  let toasts: Toast[] = $state([]);
  let nextId: number = $state(1);

  function pushToast(kind: Toast['kind'], text: string): void {
    const id = nextId++;
    toasts = [...toasts, { id, kind, text }];
    setTimeout(() => { toasts = toasts.filter((t) => t.id !== id); }, 3000);
  }

  // Item list with per-item transitions
  let items: { id: number; text: string }[] = $state([
    { id: 1, text: 'Apples' },
    { id: 2, text: 'Bananas' },
    { id: 3, text: 'Cherries' }
  ]);
  let itemNext: number = $state(4);
  let newItem: string = $state('');

  function addItem(): void {
    if (newItem.trim()) {
      items = [...items, { id: itemNext++, text: newItem.trim() }];
      newItem = '';
    }
  }

  function removeItem(id: number): void {
    items = items.filter((i) => i.id !== id);
  }

  // Custom transition — a "whoosh" spin-and-fade
  function whoosh(node: Element, { duration = 500 }: { duration?: number } = {}) {
    return {
      duration,
      easing: quintOut,
      css: (t: number, u: number) => \`
        opacity: \${t};
        transform: rotate(\${u * 360}deg) scale(\${t});
        filter: blur(\${u * 8}px);
      \`
    };
  }

  // Custom transition — typewriter reveal
  function typewriter(node: Element, { speed = 1 }: { speed?: number } = {}) {
    const text = node.textContent ?? '';
    const duration = text.length / (speed * 0.01);
    return {
      duration,
      tick: (t: number) => {
        const i = Math.trunc(text.length * t);
        node.textContent = text.slice(0, i);
      }
    };
  }

  let showTypewriter: boolean = $state(false);
</script>

<h1>Transitions & Animations</h1>

<section>
  <h2>Built-in transitions</h2>
  <div class="grid">
    <div class="cell">
      <button onclick={() => showFade = !showFade}>fade</button>
      {#if showFade}
        <div class="box fade" transition:fade={{ duration: 400 }}>fade</div>
      {/if}
    </div>

    <div class="cell">
      <button onclick={() => showFly = !showFly}>fly</button>
      {#if showFly}
        <div class="box fly" transition:fly={{ y: -60, duration: 500, easing: quintOut }}>fly</div>
      {/if}
    </div>

    <div class="cell">
      <button onclick={() => showSlide = !showSlide}>slide</button>
      {#if showSlide}
        <div class="box slide" transition:slide={{ duration: 400, easing: cubicOut }}>slide</div>
      {/if}
    </div>

    <div class="cell">
      <button onclick={() => showScale = !showScale}>scale</button>
      {#if showScale}
        <div class="box scale" transition:scale={{ duration: 500, start: 0.2, easing: elasticOut }}>scale</div>
      {/if}
    </div>

    <div class="cell">
      <button onclick={() => showBlur = !showBlur}>blur</button>
      {#if showBlur}
        <div class="box blur" transition:blur={{ duration: 400, amount: 8 }}>blur</div>
      {/if}
    </div>

    <div class="cell">
      <button onclick={() => showDraw = !showDraw}>draw (svg)</button>
      {#if showDraw}
        <svg viewBox="0 0 100 100" class="svg">
          <path
            transition:draw={{ duration: 1200, easing: expoOut }}
            d="M10,50 C20,10 80,10 90,50 C80,90 20,90 10,50 Z"
            fill="none"
            stroke="#6c5ce7"
            stroke-width="3"
          />
        </svg>
      {/if}
    </div>
  </div>
</section>

<section>
  <h2>Asymmetric in: / out:</h2>
  <button onclick={() => showAsym = !showAsym}>toggle</button>
  {#if showAsym}
    <div
      class="box asym"
      in:fly={{ x: -200, duration: 500, easing: bounceOut }}
      out:fade={{ duration: 300 }}
    >
      bounces in from the left, fades out
    </div>
  {/if}
</section>

<section>
  <h2>Custom transition: whoosh</h2>
  <button onclick={() => showCustom = !showCustom}>whoosh</button>
  {#if showCustom}
    <div class="box whoosh" transition:whoosh={{ duration: 700 }}>
      spin + scale + blur
    </div>
  {/if}
</section>

<section>
  <h2>Custom transition: typewriter</h2>
  <button onclick={() => showTypewriter = !showTypewriter}>
    {showTypewriter ? 'hide' : 'type'}
  </button>
  {#if showTypewriter}
    <p class="typewriter" in:typewriter={{ speed: 2 }} out:fade>
      Svelte transitions are declarative, interruptible, and beautiful.
    </p>
  {/if}
</section>

<section>
  <h2>List with staggered transitions</h2>
  <div class="add-row">
    <input
      bind:value={newItem}
      placeholder="Add an item..."
      onkeydown={(e) => e.key === 'Enter' && addItem()}
    />
    <button onclick={addItem}>Add</button>
  </div>
  <ul>
    {#each items as item (item.id)}
      <li
        in:fly={{ x: -30, duration: 350, easing: backOut }}
        out:slide={{ duration: 250 }}
      >
        <span>{item.text}</span>
        <button class="remove" onclick={() => removeItem(item.id)}>remove</button>
      </li>
    {/each}
  </ul>
</section>

<section>
  <h2>Toast notifications</h2>
  <div class="toast-actions">
    <button onclick={() => pushToast('success', 'Saved successfully')}>success</button>
    <button onclick={() => pushToast('info', 'New version available')}>info</button>
    <button onclick={() => pushToast('error', 'Network error, retrying...')}>error</button>
  </div>
  <div class="toast-stack">
    {#each toasts as t (t.id)}
      <div
        class="toast {t.kind}"
        in:fly={{ x: 300, duration: 350, easing: backOut }}
        out:fade={{ duration: 250 }}
      >
        {t.text}
      </div>
    {/each}
  </div>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.75rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin: 0 0 0.5rem; color: #6c5ce7; font-size: 1.05rem; }

  .grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem;
  }
  .cell { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
  .box {
    padding: 0.75rem 1rem; color: white; border-radius: 8px;
    font-weight: 700; text-align: center;
  }
  .box.fade { background: #6c5ce7; }
  .box.fly { background: #0984e3; }
  .box.slide { background: #00b894; }
  .box.scale { background: #e17055; }
  .box.blur { background: #fd79a8; }
  .box.asym { background: #b33771; display: inline-block; margin-top: 0.5rem; }
  .box.whoosh { background: linear-gradient(135deg, #6c5ce7, #fd79a8); display: inline-block; margin-top: 0.5rem; }
  .svg { width: 100px; height: 100px; }

  button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 6px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600; font-size: 0.85rem;
  }
  button:hover { background: #5a4bd1; }
  .remove { background: #ff7675; font-size: 0.72rem; padding: 0.25rem 0.55rem; }

  .typewriter {
    font-family: ui-monospace, monospace;
    padding: 0.75rem; background: #2d3436; color: #00b894;
    border-radius: 6px; margin-top: 0.5rem;
  }

  .add-row { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
  .add-row input { flex: 1; padding: 0.5rem; border: 1px solid #dfe6e9; border-radius: 4px; }
  ul { list-style: none; padding: 0; margin: 0; }
  li {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.5rem 0.75rem; margin-bottom: 0.3rem;
    background: white; border: 1px solid #dfe6e9; border-radius: 6px;
  }

  .toast-actions { display: flex; gap: 0.4rem; margin-bottom: 0.5rem; }
  .toast-stack {
    position: fixed; bottom: 1rem; right: 1rem;
    display: flex; flex-direction: column; gap: 0.5rem; z-index: 1000;
  }
  .toast {
    padding: 0.75rem 1rem; border-radius: 8px; color: white;
    font-weight: 600; font-size: 0.88rem; min-width: 220px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .toast.success { background: #00b894; }
  .toast.info { background: #0984e3; }
  .toast.error { background: #d63031; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
