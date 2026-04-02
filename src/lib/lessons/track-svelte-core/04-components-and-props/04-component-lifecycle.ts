import type { Lesson } from '$types/lesson';

export const componentLifecycle: Lesson = {
	id: 'svelte-core.components-and-props.component-lifecycle',
	slug: 'component-lifecycle',
	title: 'Component Lifecycle',
	description:
		'Understand mount, unmount, and how $effect replaces onMount/onDestroy for lifecycle management.',
	trackId: 'svelte-core',
	moduleId: 'components-and-props',
	order: 4,
	estimatedMinutes: 15,
	concepts: ['svelte5.lifecycle.mount', 'svelte5.lifecycle.cleanup', 'svelte5.lifecycle.effect'],
	prerequisites: ['svelte5.runes.state', 'svelte5.runes.effect'],

	content: [
		{
			type: 'text',
			content: `# Component Lifecycle

Svelte 5 simplifies lifecycle management. While \`onMount\` and \`onDestroy\` still work, \`$effect\` is the preferred way to handle side effects that need setup and cleanup.

An \`$effect\` runs after the component mounts, reruns when its dependencies change, and automatically cleans up when the component is destroyed.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.lifecycle.effect'
		},
		{
			type: 'text',
			content: `## $effect for Lifecycle

\`\`\`svelte
<script lang="ts">
  $effect(() => {
    // Runs on mount and when dependencies change
    const timer = setInterval(() => console.log('tick'), 1000);

    return () => {
      // Cleanup: runs before re-run and on unmount
      clearInterval(timer);
    };
  });
</script>
\`\`\`

**Your task:** Create a Timer component that starts an interval on mount and cleans it up on unmount using \`$effect\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Toggling Components

When a component is conditionally rendered, its lifecycle runs each time it enters the DOM. This is perfect for testing cleanup.

**Task:** Add a toggle button in App.svelte that shows/hides the Timer. Verify the interval stops when the component is removed.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## onMount for One-Time Setup

Sometimes you need code that runs exactly once after the first render — like fetching data. \`onMount\` is still useful for this.

\`\`\`svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let data = $state<string[]>([]);

  onMount(async () => {
    const res = await fetch('/api/items');
    data = await res.json();
  });
</script>
\`\`\`

Note: \`$effect\` cannot be \`async\`, so \`onMount\` remains the cleanest option for async initialization.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Timer from './Timer.svelte';

  let showTimer = $state(true);
</script>

<div>
  <!-- TODO: Add a toggle button for showTimer -->
  <!-- TODO: Conditionally render Timer -->
  <Timer />
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }
</style>`
		},
		{
			name: 'Timer.svelte',
			path: '/Timer.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let elapsed = $state(0);

  // TODO: Use $effect to start an interval and return cleanup
</script>

<p>Elapsed: {elapsed}s</p>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Timer from './Timer.svelte';

  let showTimer = $state(true);
</script>

<div>
  <button onclick={() => showTimer = !showTimer}>
    {showTimer ? 'Hide' : 'Show'} Timer
  </button>

  {#if showTimer}
    <Timer />
  {/if}
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
</style>`
		},
		{
			name: 'Timer.svelte',
			path: '/Timer.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let elapsed = $state(0);

  $effect(() => {
    const timer = setInterval(() => {
      elapsed += 1;
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  });
</script>

<p>Elapsed: {elapsed}s</p>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use $effect to start an interval with cleanup',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$effect' },
						{ type: 'contains', value: 'setInterval' },
						{ type: 'contains', value: 'clearInterval' }
					]
				}
			},
			hints: [
				'Use `$effect(() => { ... return () => { ... } })` for setup and cleanup.',
				'Start `setInterval` inside the effect and `clearInterval` in the return function.',
				'`$effect(() => { const timer = setInterval(() => { elapsed += 1; }, 1000); return () => clearInterval(timer); });`'
			],
			conceptsTested: ['svelte5.lifecycle.effect', 'svelte5.lifecycle.cleanup']
		},
		{
			id: 'cp-2',
			description: 'Toggle the Timer component with an {#if} block',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#if' },
						{ type: 'contains', value: 'showTimer' }
					]
				}
			},
			hints: [
				'Add a button that toggles `showTimer` between true and false.',
				'Wrap `<Timer />` in `{#if showTimer}...{/if}`.',
				'Add `<button onclick={() => showTimer = !showTimer}>Toggle</button>` and `{#if showTimer}<Timer />{/if}`'
			],
			conceptsTested: ['svelte5.lifecycle.mount']
		}
	]
};
