import type { Lesson } from '$types/lesson';

export const customTransitions: Lesson = {
	id: 'svelte-core.transitions-and-animations.custom-transitions',
	slug: 'custom-transitions',
	title: 'Custom Transitions',
	description:
		'Write your own transition functions using CSS animations or the tick callback for full control.',
	trackId: 'svelte-core',
	moduleId: 'transitions-and-animations',
	order: 3,
	estimatedMinutes: 15,
	concepts: ['svelte5.transitions.custom', 'svelte5.transitions.css-fn', 'svelte5.transitions.tick-fn'],
	prerequisites: ['svelte5.transitions.directive'],

	content: [
		{
			type: 'text',
			content: `# Custom Transitions

Svelte's built-in transitions cover many cases, but sometimes you need full control. A custom transition is simply a function that returns an object describing how to animate an element.

There are two approaches: **CSS transitions** (performant, runs on the compositor) and **tick functions** (JavaScript-driven, more flexible).`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.transitions.custom'
		},
		{
			type: 'text',
			content: `## CSS-based Custom Transitions

Return a \`css\` function that receives \`t\` (0 to 1) and returns a CSS string.

\`\`\`svelte
<script lang="ts">
  import type { TransitionConfig } from 'svelte/transition';

  function spin(node: Element, { duration = 400 }): TransitionConfig {
    return {
      duration,
      css: (t) => \`
        transform: rotate(\${t * 360}deg) scale(\${t});
        opacity: \${t};
      \`
    };
  }
</script>

{#if visible}
  <div transition:spin={{ duration: 600 }}>Spinning!</div>
{/if}
\`\`\`

**Your task:** Create a custom \`spin\` transition that rotates and scales the element.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Tick-based Custom Transitions

For transitions that need to manipulate the DOM directly (like typewriter effects), use the \`tick\` function instead of \`css\`.

\`\`\`svelte
function typewriter(node: Element, { speed = 30 }): TransitionConfig {
  const text = node.textContent || '';
  const duration = text.length * speed;
  return {
    duration,
    tick: (t) => {
      const i = Math.floor(text.length * t);
      node.textContent = text.slice(0, i);
    }
  };
}
\`\`\`

**Task:** Create a typewriter transition that reveals text character by character.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { TransitionConfig } from 'svelte/transition';

  let showSpin = $state(false);
  let showText = $state(false);

  // TODO: Create a custom spin transition (css-based)

  // TODO: Create a custom typewriter transition (tick-based)
</script>

<div>
  <section>
    <h2>Custom CSS Transition</h2>
    <button onclick={() => showSpin = !showSpin}>Toggle Spin</button>
    {#if showSpin}
      <!-- TODO: Apply spin transition -->
      <div class="box">Spinning Element</div>
    {/if}
  </section>

  <section>
    <h2>Custom Tick Transition</h2>
    <button onclick={() => showText = !showText}>Toggle Text</button>
    {#if showText}
      <!-- TODO: Apply typewriter transition -->
      <p class="typewriter">The quick brown fox jumps over the lazy dog.</p>
    {/if}
  </section>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  section {
    margin-bottom: 2rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 1rem;
  }

  .box {
    width: 150px;
    height: 150px;
    background: #6366f1;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-weight: bold;
  }

  .typewriter {
    font-size: 1.25rem;
    font-family: monospace;
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { TransitionConfig } from 'svelte/transition';

  let showSpin = $state(false);
  let showText = $state(false);

  function spin(node: Element, { duration = 500 }: { duration?: number } = {}): TransitionConfig {
    return {
      duration,
      css: (t) => \`
        transform: rotate(\${t * 360}deg) scale(\${t});
        opacity: \${t};
      \`
    };
  }

  function typewriter(node: Element, { speed = 30 }: { speed?: number } = {}): TransitionConfig {
    const text = node.textContent || '';
    const duration = text.length * speed;
    return {
      duration,
      tick: (t) => {
        const i = Math.floor(text.length * t);
        node.textContent = text.slice(0, i);
      }
    };
  }
</script>

<div>
  <section>
    <h2>Custom CSS Transition</h2>
    <button onclick={() => showSpin = !showSpin}>Toggle Spin</button>
    {#if showSpin}
      <div class="box" transition:spin={{ duration: 600 }}>Spinning Element</div>
    {/if}
  </section>

  <section>
    <h2>Custom Tick Transition</h2>
    <button onclick={() => showText = !showText}>Toggle Text</button>
    {#if showText}
      <p class="typewriter" transition:typewriter={{ speed: 40 }}>The quick brown fox jumps over the lazy dog.</p>
    {/if}
  </section>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  section {
    margin-bottom: 2rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 1rem;
  }

  .box {
    width: 150px;
    height: 150px;
    background: #6366f1;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-weight: bold;
  }

  .typewriter {
    font-size: 1.25rem;
    font-family: monospace;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a custom CSS-based spin transition',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'function spin' },
						{ type: 'contains', value: 'css:' },
						{ type: 'contains', value: 'transition:spin' }
					]
				}
			},
			hints: [
				'Define a function that takes `(node, params)` and returns an object with `duration` and `css`.',
				'The `css` function receives `t` (0 to 1) — use it for transform and opacity.',
				'Create `function spin(node, { duration = 500 }) { return { duration, css: (t) => `transform: rotate(${t * 360}deg) scale(${t}); opacity: ${t}` }; }`'
			],
			conceptsTested: ['svelte5.transitions.custom', 'svelte5.transitions.css-fn']
		},
		{
			id: 'cp-2',
			description: 'Create a custom tick-based typewriter transition',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'function typewriter' },
						{ type: 'contains', value: 'tick:' },
						{ type: 'contains', value: 'transition:typewriter' }
					]
				}
			},
			hints: [
				'Use `tick` instead of `css` — it receives `t` and lets you manipulate the DOM.',
				'Get the text content, calculate duration, and slice the text based on `t`.',
				'`tick: (t) => { const i = Math.floor(text.length * t); node.textContent = text.slice(0, i); }`'
			],
			conceptsTested: ['svelte5.transitions.custom', 'svelte5.transitions.tick-fn']
		}
	]
};
