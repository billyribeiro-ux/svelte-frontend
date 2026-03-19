import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-2',
		title: '<svelte:boundary>: Error Recovery',
		phase: 5,
		module: 15,
		lessonIndex: 2
	},
	description: `Production applications need graceful error handling. Svelte 5's <svelte:boundary> element catches errors thrown during rendering or in effects within its children, preventing the entire app from crashing.

When an error occurs inside a boundary, the failed snippet renders instead of the broken content. The failed snippet receives the error object and a reset function — calling reset() destroys and recreates the boundary's content, giving the component a fresh start. Boundaries can be nested for granular error isolation.`,
	objectives: [
		'Wrap components in <svelte:boundary> for graceful error recovery',
		'Use the failed snippet to display error UI with error details and reset',
		'Nest boundaries to isolate errors in different parts of the UI',
		'Handle both render errors and effect errors within boundaries'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let shouldError: boolean = $state(false);
  let counter: number = $state(0);
  let widgetAForceError: boolean = $state(false);
  let widgetBForceError: boolean = $state(false);

  function riskyComputation(value: number): string {
    if (value > 5) {
      throw new Error(\`Value \${value} exceeds maximum! Component crashed.\`);
    }
    return \`Result: \${value * 10}\`;
  }
</script>

<h1>Error Boundaries</h1>

<section>
  <h2>Basic Boundary</h2>
  <svelte:boundary>
    <div class="card">
      <p>Counter: {counter}</p>
      <p>{riskyComputation(counter)}</p>
      <button onclick={() => counter++}>Increment (crashes at 6)</button>
    </div>

    {#snippet failed(error, reset)}
      <div class="error-card">
        <h3>Something went wrong!</h3>
        <p class="error-msg">{error.message}</p>
        <button onclick={() => { counter = 0; reset(); }}>
          Reset & Try Again
        </button>
      </div>
    {/snippet}
  </svelte:boundary>
</section>

<section>
  <h2>Nested Boundaries — Independent Recovery</h2>
  <div class="grid">
    <svelte:boundary>
      <div class="card">
        <h3>Widget A</h3>
        {#if widgetAForceError}
          {riskyComputation(999)}
        {:else}
          <p>Widget A is healthy.</p>
          <button onclick={() => widgetAForceError = true}>Break Widget A</button>
        {/if}
      </div>

      {#snippet failed(error, reset)}
        <div class="error-card">
          <h3>Widget A Failed</h3>
          <p class="error-msg">{error.message}</p>
          <button onclick={() => { widgetAForceError = false; reset(); }}>
            Recover A
          </button>
        </div>
      {/snippet}
    </svelte:boundary>

    <svelte:boundary>
      <div class="card">
        <h3>Widget B</h3>
        {#if widgetBForceError}
          {riskyComputation(999)}
        {:else}
          <p>Widget B is healthy.</p>
          <button onclick={() => widgetBForceError = true}>Break Widget B</button>
        {/if}
      </div>

      {#snippet failed(error, reset)}
        <div class="error-card">
          <h3>Widget B Failed</h3>
          <p class="error-msg">{error.message}</p>
          <button onclick={() => { widgetBForceError = false; reset(); }}>
            Recover B
          </button>
        </div>
      {/snippet}
    </svelte:boundary>
  </div>
  <p class="hint">Each widget recovers independently — breaking one doesn't affect the other.</p>
</section>

<section>
  <h2>Outer Boundary — Last Resort</h2>
  <svelte:boundary>
    <svelte:boundary>
      {#if shouldError}
        {riskyComputation(999)}
      {:else}
        <div class="card">
          <p>Inner boundary content is fine.</p>
          <button onclick={() => shouldError = true}>Trigger Error</button>
        </div>
      {/if}

      {#snippet failed(error, reset)}
        <div class="error-card warning">
          <p>Inner boundary caught: {error.message}</p>
          <button onclick={() => { shouldError = false; reset(); }}>
            Inner Reset
          </button>
        </div>
      {/snippet}
    </svelte:boundary>

    {#snippet failed(error, reset)}
      <div class="error-card critical">
        <h3>Outer boundary caught an unhandled error!</h3>
        <p class="error-msg">{error.message}</p>
        <button onclick={reset}>Last Resort Reset</button>
      </div>
    {/snippet}
  </svelte:boundary>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; }
  h2 { color: #d63031; font-size: 1.1rem; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .card {
    padding: 1rem; background: #f8f9fa; border-radius: 8px;
    border: 1px solid #dfe6e9;
  }
  .card h3 { margin-top: 0; }
  .error-card {
    padding: 1rem; background: #fff5f5; border-radius: 8px;
    border: 2px solid #ff7675;
  }
  .error-card.warning { border-color: #fdcb6e; background: #ffeaa7; }
  .error-card.critical { border-color: #d63031; background: #fab1a0; }
  .error-card h3 { margin-top: 0; color: #d63031; }
  .error-msg {
    font-family: monospace; font-size: 0.9rem; color: #d63031;
    background: rgba(255,255,255,0.5); padding: 0.5rem; border-radius: 4px;
  }
  button {
    padding: 0.5rem 1rem; border: none; border-radius: 4px;
    background: #d63031; color: white; cursor: pointer; font-weight: 600;
  }
  button:hover { background: #c0392b; }
  .hint { font-size: 0.85rem; color: #636e72; margin-top: 0.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
