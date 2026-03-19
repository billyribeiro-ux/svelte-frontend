import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '11-6',
		title: 'Error Pages & <svelte:boundary>',
		phase: 3,
		module: 11,
		lessonIndex: 6
	},
	description: `Errors are inevitable — network failures, invalid data, bugs. Svelte 5 introduces <svelte:boundary> as an error boundary that catches runtime errors in child components. It renders a "failed" snippet when an error occurs and provides a reset function to retry. This replaces SvelteKit's +error.svelte for component-level error handling.

This lesson covers both <svelte:boundary> for component errors and SvelteKit's error page conventions for route-level errors.`,
	objectives: [
		'Use <svelte:boundary> to catch and handle component errors',
		'Render a fallback UI with the failed snippet when errors occur',
		'Use the reset function to retry after an error',
		'Understand how SvelteKit +error.svelte pages work for route errors'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let shouldError: boolean = $state(false);
  let errorCount: number = $state(0);

  function riskyOperation(): string {
    if (shouldError) {
      throw new Error('Something went wrong! (Error #' + (++errorCount) + ')');
    }
    return 'Operation succeeded!';
  }

  let triggerChild: boolean = $state(false);
</script>

<main>
  <h1>Error Pages & &lt;svelte:boundary&gt;</h1>

  <section>
    <h2>&lt;svelte:boundary&gt; — Error Boundaries</h2>
    <pre>{\`<!-- Catches errors in child components -->
<svelte:boundary>
  <RiskyComponent />

  {#snippet failed(error, reset)}
    <p>Error: {error.message}</p>
    <button onclick={reset}>Try Again</button>
  {/snippet}
</svelte:boundary>\`}</pre>
  </section>

  <section>
    <h2>Live Demo</h2>
    <label>
      <input type="checkbox" bind:checked={shouldError} />
      Enable error mode
    </label>

    <svelte:boundary>
      <div class="safe-zone">
        <p>Result: <strong>{riskyOperation()}</strong></p>
        <p>This content is inside the error boundary.</p>
      </div>

      {#snippet failed(error: Error, reset: () => void)}
        <div class="error-ui">
          <h3>Something Broke</h3>
          <p class="error-msg">{error.message}</p>
          <button onclick={() => { shouldError = false; reset(); }}>
            Fix & Retry
          </button>
          <button onclick={reset}>
            Retry (may fail again)
          </button>
        </div>
      {/snippet}
    </svelte:boundary>
  </section>

  <section>
    <h2>SvelteKit Error Pages</h2>
    <pre>{\`src/routes/
├── +error.svelte          ← Root error page
├── +page.svelte
└── blog/
    ├── +error.svelte      ← Blog-specific error page
    └── [slug]/
        └── +page.svelte

<!-- +error.svelte -->
<script lang="ts">
  import { page } from '$app/state';
</script>

<h1>{page.status}: {page.error?.message}</h1>

{#if page.status === 404}
  <p>Page not found.</p>
{:else}
  <p>Something went wrong.</p>
{/if}\`}</pre>
  </section>

  <section>
    <h2>Throwing Errors in Load</h2>
    <pre>{\`// +page.server.ts
import { error } from '@sveltejs/kit';

export function load({ params }) {
  const post = db.getPost(params.slug);

  if (!post) {
    // This renders the nearest +error.svelte
    error(404, { message: 'Post not found' });
  }

  return { post };
}\`}</pre>
  </section>
</main>

<style>
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  .safe-zone { background: #e8f5e9; padding: 1rem; border-radius: 4px; border: 2px solid #4caf50; }
  .error-ui { background: #ffebee; padding: 1rem; border-radius: 4px; border: 2px solid #f44336; }
  .error-msg { color: #d32f2f; font-family: monospace; }
  label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 1rem; }
  button { padding: 0.5rem 1rem; cursor: pointer; margin-right: 0.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
