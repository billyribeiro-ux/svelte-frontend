import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '9-7',
		title: 'The this Keyword',
		phase: 3,
		module: 9,
		lessonIndex: 7
	},
	description: `JavaScript's "this" keyword is a common source of bugs in event handlers. When you write onclick={obj.method}, the method loses its "this" context — it becomes undefined or the global object instead of obj. Arrow functions and bind:this solve different aspects of this problem.

This lesson demonstrates why "this" breaks in callbacks, how to fix it with arrow functions, and how bind:this gives you a direct reference to the underlying DOM element for imperative operations like focusing or measuring.`,
	objectives: [
		'Understand why onclick={obj.method} loses its "this" context',
		'Fix "this" binding issues using arrow functions in event handlers',
		'Use bind:this to get a reference to a DOM element',
		'Perform imperative DOM operations using element references'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // bind:this gives a DOM element reference
  let inputEl: HTMLInputElement | undefined = $state();
  let canvasEl: HTMLDivElement | undefined = $state();

  // Object with methods — demonstrates "this" context issues
  const counter = {
    count: $state(0),
    label: 'Counter',

    // This method uses "this" — careful how you call it!
    increment() {
      this.count++;
    },

    getLabel() {
      return this.label;
    }
  };

  function focusInput() {
    // Use the DOM reference from bind:this
    inputEl?.focus();
  }

  function measureBox() {
    if (canvasEl) {
      alert(\`Box size: \${canvasEl.clientWidth}x\${canvasEl.clientHeight}px\`);
    }
  }
</script>

<main>
  <h1>The "this" Keyword</h1>

  <!-- Demonstrating "this" context -->
  <section>
    <h2>"this" in Event Handlers</h2>
    <p>Count: <strong>{counter.count}</strong></p>

    <!-- BROKEN: onclick={counter.increment} loses "this" -->
    <!-- Uncomment to see the error: -->
    <!-- <button onclick={counter.increment}>Broken increment</button> -->

    <!-- FIXED: arrow function preserves "this" -->
    <button onclick={() => counter.increment()}>
      Increment (arrow function fix)
    </button>

    <p><em>onclick=&#123;counter.increment&#125; would break because "this" becomes undefined. Wrapping in an arrow function calls the method properly on the object.</em></p>
  </section>

  <!-- bind:this for DOM references -->
  <section>
    <h2>bind:this — DOM References</h2>
    <input
      bind:this={inputEl}
      type="text"
      placeholder="Click the button to focus me"
    />
    <button onclick={focusInput}>Focus the Input</button>
    <p><em>bind:this gives you the actual HTMLInputElement, so you can call .focus() on it.</em></p>
  </section>

  <!-- Measuring elements with bind:this -->
  <section>
    <h2>Measuring with bind:this</h2>
    <div class="measure-box" bind:this={canvasEl}>
      This box can be measured using the DOM reference.
    </div>
    <button onclick={measureBox}>Measure Box</button>
  </section>
</main>

<style>
  main { max-width: 500px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  input { width: 100%; padding: 0.5rem; font-size: 1rem; box-sizing: border-box; margin-bottom: 0.5rem; }
  button { padding: 0.5rem 1rem; cursor: pointer; margin-right: 0.5rem; }
  .measure-box {
    padding: 2rem;
    background: #e8f5e9;
    border: 2px dashed #4caf50;
    border-radius: 4px;
    text-align: center;
    margin-bottom: 0.5rem;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
