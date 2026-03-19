import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '12-9',
		title: 'Streaming, {#await} & Parallel Loading',
		phase: 4,
		module: 12,
		lessonIndex: 9
	},
	description: `The {#await} block is Svelte's built-in way to handle promises directly in the template. It renders different content for pending, fulfilled, and rejected states — no manual loading/error state management needed. Combined with SvelteKit's streaming capabilities, you can show fast content immediately while slower data loads in the background.

This lesson covers {#await} block syntax, inline promise handling, and the concept of streaming data from load functions.`,
	objectives: [
		'Use {#await} blocks to handle pending, resolved, and rejected states',
		'Display loading indicators and error messages declaratively',
		'Understand streaming data from load functions for faster perceived performance',
		'Combine multiple {#await} blocks for parallel data display'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Simulated async operations
  function fetchFast(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => resolve('Fast data loaded!'), 500);
    });
  }

  function fetchSlow(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => resolve('Slow data finally loaded!'), 3000);
    });
  }

  function fetchFailing(): Promise<string> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Network timeout')), 1500);
    });
  }

  // Re-assignable promise to trigger new loads
  let fastPromise: Promise<string> = $state(fetchFast());
  let slowPromise: Promise<string> = $state(fetchSlow());
  let failPromise: Promise<string> = $state(fetchFailing());

  function reload() {
    fastPromise = fetchFast();
    slowPromise = fetchSlow();
    failPromise = fetchFailing();
  }
</script>

<main>
  <h1>Streaming, {'{#await}'} & Parallel Loading</h1>

  <section>
    <h2>{'{#await}'} Block Syntax</h2>
    <pre>{\`<!-- Full form: pending / then / catch -->
{#await promise}
  <p>Loading...</p>
{:then data}
  <p>Got: {data}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}

<!-- Short form: no pending state -->
{#await promise then data}
  <p>{data}</p>
{/await}

<!-- Short form: then + catch, no pending -->
{#await promise then data}
  <p>{data}</p>
{:catch error}
  <p>{error.message}</p>
{/await}\`}</pre>
  </section>

  <section>
    <h2>Live Demo: Parallel Loading</h2>
    <button onclick={reload}>Reload All</button>

    <div class="panels">
      <div class="panel">
        <h3>Fast API (500ms)</h3>
        {#await fastPromise}
          <div class="loading">Loading...</div>
        {:then data}
          <div class="success">{data}</div>
        {:catch error}
          <div class="error">{error.message}</div>
        {/await}
      </div>

      <div class="panel">
        <h3>Slow API (3s)</h3>
        {#await slowPromise}
          <div class="loading">Loading... (this one takes a while)</div>
        {:then data}
          <div class="success">{data}</div>
        {:catch error}
          <div class="error">{error.message}</div>
        {/await}
      </div>

      <div class="panel">
        <h3>Failing API (1.5s)</h3>
        {#await failPromise}
          <div class="loading">Loading...</div>
        {:then data}
          <div class="success">{data}</div>
        {:catch error}
          <div class="error">{error.message}</div>
        {/await}
      </div>
    </div>
    <p><em>Notice: each panel resolves independently. Fast content appears while slow content still loads.</em></p>
  </section>

  <section>
    <h2>Streaming in SvelteKit</h2>
    <pre>{\`// +page.server.ts — streaming pattern
export const load: PageServerLoad = async () => {
  return {
    // Awaited: blocks rendering until ready
    title: await getTitle(),

    // NOT awaited: streams in later!
    comments: getComments(),  // returns a Promise
    analytics: getAnalytics() // returns a Promise
  };
};

// +page.svelte — renders fast data first
<script lang="ts">
  let { data } = $props();
</script>

<!-- Shows immediately (was awaited) -->
<h1>{data.title}</h1>

<!-- Streams in when ready -->
{#await data.comments}
  <p>Loading comments...</p>
{:then comments}
  {#each comments as comment}
    <p>{comment.text}</p>
  {/each}
{:catch}
  <p>Failed to load comments</p>
{/await}\`}</pre>
    <div class="demo-box">
      <p><strong>Streaming tip:</strong> Return promises (don't await them) in your load function. SvelteKit will send the page with fast data immediately and stream the rest as it resolves.</p>
    </div>
  </section>
</main>

<style>
  main { max-width: 650px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  .panels { display: flex; flex-direction: column; gap: 0.75rem; margin: 1rem 0; }
  .panel { border: 1px solid #ddd; border-radius: 4px; padding: 0.75rem; }
  .panel h3 { margin: 0 0 0.5rem; font-size: 0.95rem; }
  .loading { color: #1565c0; font-style: italic; padding: 0.5rem; background: #e3f2fd; border-radius: 4px; }
  .success { color: #2e7d32; padding: 0.5rem; background: #e8f5e9; border-radius: 4px; }
  .error { color: #d32f2f; padding: 0.5rem; background: #ffebee; border-radius: 4px; }
  .demo-box { background: #fff3e0; padding: 0.75rem 1rem; border-radius: 4px; border-left: 3px solid #ff9800; margin-top: 0.5rem; }
  button { padding: 0.5rem 1rem; cursor: pointer; margin-bottom: 0.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
