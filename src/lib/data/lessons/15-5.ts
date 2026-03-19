import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-5',
		title: 'Transitions & Animations',
		phase: 5,
		module: 15,
		lessonIndex: 5
	},
	description: `Svelte provides built-in transition directives that animate elements as they enter and leave the DOM. The transition: directive applies the same animation on both entry and exit, while in: and out: let you specify different animations for each direction.

Svelte ships with several transition functions — fade, fly, slide, scale, blur, and draw — each accepting parameters for duration, delay, and easing. Easing functions from svelte/easing control the acceleration curve, letting you create natural-feeling motion with minimal code.`,
	objectives: [
		'Apply fade, fly, slide, scale, and blur transitions to elements',
		'Use in: and out: directives for asymmetric enter/exit animations',
		'Configure transition parameters including duration, delay, and easing',
		'Combine multiple transitions for rich animation effects'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import { fade, fly, slide, scale, blur } from 'svelte/transition';
  import { quintOut, elasticOut, bounceOut } from 'svelte/easing';

  let showFade: boolean = $state(false);
  let showFly: boolean = $state(false);
  let showSlide: boolean = $state(false);
  let showScale: boolean = $state(false);
  let showBlur: boolean = $state(false);
  let showCombo: boolean = $state(false);

  let items: string[] = $state(['Apple', 'Banana', 'Cherry']);
  let newItem: string = $state('');

  function addItem(): void {
    if (newItem.trim()) {
      items = [...items, newItem.trim()];
      newItem = '';
    }
  }

  function removeItem(index: number): void {
    items = items.filter((_, i) => i !== index);
  }
</script>

<h1>Transitions & Animations</h1>

<section>
  <h2>Basic Transitions</h2>
  <div class="demo-grid">
    <div class="demo">
      <button onclick={() => showFade = !showFade}>Fade</button>
      {#if showFade}
        <div class="box" transition:fade={{ duration: 400 }}>fade</div>
      {/if}
    </div>

    <div class="demo">
      <button onclick={() => showFly = !showFly}>Fly</button>
      {#if showFly}
        <div class="box" transition:fly={{ y: -50, duration: 500, easing: quintOut }}>fly</div>
      {/if}
    </div>

    <div class="demo">
      <button onclick={() => showSlide = !showSlide}>Slide</button>
      {#if showSlide}
        <div class="box" transition:slide={{ duration: 400 }}>slide</div>
      {/if}
    </div>

    <div class="demo">
      <button onclick={() => showScale = !showScale}>Scale</button>
      {#if showScale}
        <div class="box" transition:scale={{ duration: 400, easing: elasticOut, start: 0.2 }}>scale</div>
      {/if}
    </div>

    <div class="demo">
      <button onclick={() => showBlur = !showBlur}>Blur</button>
      {#if showBlur}
        <div class="box" transition:blur={{ duration: 400, amount: 10 }}>blur</div>
      {/if}
    </div>
  </div>
</section>

<section>
  <h2>Asymmetric in: / out:</h2>
  <button onclick={() => showCombo = !showCombo}>Toggle</button>
  {#if showCombo}
    <div
      class="box highlight"
      in:fly={{ x: -200, duration: 600, easing: bounceOut }}
      out:fade={{ duration: 300 }}
    >
      Flies in from left, fades out
    </div>
  {/if}
</section>

<section>
  <h2>Transition on List Items</h2>
  <div class="add-row">
    <input
      bind:value={newItem}
      placeholder="Add a fruit..."
      onkeydown={(e) => e.key === 'Enter' && addItem()}
    />
    <button onclick={addItem}>Add</button>
  </div>
  <ul class="item-list">
    {#each items as item, i (item)}
      <li
        in:fly={{ x: -30, duration: 300 }}
        out:slide={{ duration: 200 }}
      >
        <span>{item}</span>
        <button class="remove" onclick={() => removeItem(i)}>x</button>
      </li>
    {/each}
  </ul>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; }
  h2 { color: #6c5ce7; font-size: 1.1rem; }
  .demo-grid { display: flex; gap: 1rem; flex-wrap: wrap; }
  .demo {
    display: flex; flex-direction: column; align-items: center;
    gap: 0.5rem; min-width: 80px;
  }
  .box {
    padding: 1rem 1.5rem; background: #a29bfe; color: white;
    border-radius: 8px; font-weight: 600; text-align: center;
  }
  .box.highlight { background: #fd79a8; }
  button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600;
  }
  button:hover { background: #5a4bd1; }
  .add-row { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
  .add-row input {
    padding: 0.4rem; border: 1px solid #ddd; border-radius: 4px; flex: 1;
  }
  .item-list { list-style: none; padding: 0; }
  .item-list li {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.5rem 0.75rem; margin-bottom: 0.25rem;
    background: #f8f9fa; border-radius: 4px;
  }
  .remove {
    padding: 0.2rem 0.5rem; background: #ff7675; font-size: 0.8rem;
    border-radius: 50%;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
