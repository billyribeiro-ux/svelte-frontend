import type { Lesson } from '$types/lesson';

export const transitionDirective: Lesson = {
	id: 'svelte-core.transitions-and-animations.transition-directive',
	slug: 'transition-directive',
	title: 'The Transition Directive',
	description:
		'Add smooth enter/exit animations with transition:fade, transition:fly, transition:slide, and transition:scale.',
	trackId: 'svelte-core',
	moduleId: 'transitions-and-animations',
	order: 1,
	estimatedMinutes: 12,
	concepts: ['svelte5.transitions.directive', 'svelte5.transitions.built-in'],
	prerequisites: ['svelte5.runes.state', 'svelte5.components.basic'],

	content: [
		{
			type: 'text',
			content: `# The Transition Directive

Svelte makes it easy to animate elements as they enter and leave the DOM. The \`transition:\` directive applies an animation in both directions — when the element is added and when it is removed.

Svelte ships with several built-in transitions: \`fade\`, \`fly\`, \`slide\`, \`scale\`, \`blur\`, and \`draw\`.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.transitions.directive'
		},
		{
			type: 'text',
			content: `## Using Built-in Transitions

\`\`\`svelte
<script lang="ts">
  import { fade, fly, slide, scale } from 'svelte/transition';
  let visible = $state(true);
</script>

<button onclick={() => visible = !visible}>Toggle</button>

{#if visible}
  <p transition:fade>I fade in and out</p>
  <p transition:fly={{ y: 50, duration: 300 }}>I fly in from below</p>
{/if}
\`\`\`

**Your task:** Create a toggle that shows/hides elements with different transitions. Use \`fade\`, \`fly\`, and \`slide\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Transition Parameters

Each transition accepts configuration parameters:

- \`fade\`: \`duration\`, \`delay\`, \`easing\`
- \`fly\`: \`x\`, \`y\`, \`duration\`, \`delay\`, \`easing\`, \`opacity\`
- \`slide\`: \`duration\`, \`delay\`, \`easing\`, \`axis\` (\`'x'\` or \`'y'\`)
- \`scale\`: \`start\`, \`duration\`, \`delay\`, \`easing\`, \`opacity\`

**Task:** Add a \`scale\` transition with custom parameters and experiment with the \`delay\` option to stagger multiple elements.`
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
  // TODO: Import transitions from 'svelte/transition'
  let visible = $state(true);
</script>

<div>
  <button onclick={() => visible = !visible}>
    {visible ? 'Hide' : 'Show'} Elements
  </button>

  {#if visible}
    <!-- TODO: Add transitions to these elements -->
    <div class="box fade-box">Fade</div>
    <div class="box fly-box">Fly</div>
    <div class="box slide-box">Slide</div>
    <div class="box scale-box">Scale</div>
  {/if}
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
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
    padding: 1rem;
    margin: 0.5rem 0;
    border-radius: 8px;
    color: white;
    font-weight: bold;
  }

  .fade-box { background: #6366f1; }
  .fly-box { background: #ec4899; }
  .slide-box { background: #14b8a6; }
  .scale-box { background: #f59e0b; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { fade, fly, slide, scale } from 'svelte/transition';
  let visible = $state(true);
</script>

<div>
  <button onclick={() => visible = !visible}>
    {visible ? 'Hide' : 'Show'} Elements
  </button>

  {#if visible}
    <div class="box fade-box" transition:fade={{ duration: 300 }}>Fade</div>
    <div class="box fly-box" transition:fly={{ y: 50, duration: 400, delay: 100 }}>Fly</div>
    <div class="box slide-box" transition:slide={{ duration: 400, delay: 200 }}>Slide</div>
    <div class="box scale-box" transition:scale={{ start: 0.5, duration: 400, delay: 300 }}>Scale</div>
  {/if}
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
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
    padding: 1rem;
    margin: 0.5rem 0;
    border-radius: 8px;
    color: white;
    font-weight: bold;
  }

  .fade-box { background: #6366f1; }
  .fly-box { background: #ec4899; }
  .slide-box { background: #14b8a6; }
  .scale-box { background: #f59e0b; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add fade, fly, and slide transitions to the elements',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'transition:fade' },
						{ type: 'contains', value: 'transition:fly' },
						{ type: 'contains', value: 'transition:slide' }
					]
				}
			},
			hints: [
				'Import `fade`, `fly`, and `slide` from `svelte/transition`.',
				'Add `transition:fade` to the first box, `transition:fly={{ y: 50 }}` to the second, etc.',
				'Import the transitions and add them: `<div transition:fade>`, `<div transition:fly={{ y: 50 }}>`, `<div transition:slide>`.'
			],
			conceptsTested: ['svelte5.transitions.directive', 'svelte5.transitions.built-in']
		},
		{
			id: 'cp-2',
			description: 'Add a scale transition with custom parameters and stagger delays',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'transition:scale' },
						{ type: 'contains', value: 'delay' }
					]
				}
			},
			hints: [
				'Import `scale` from `svelte/transition` and add it to the last box.',
				'Use `transition:scale={{ start: 0.5, duration: 400 }}`.',
				'Add `delay` to each transition to stagger them: `delay: 100`, `delay: 200`, `delay: 300`.'
			],
			conceptsTested: ['svelte5.transitions.built-in']
		}
	]
};
