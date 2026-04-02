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

## WHY Svelte Has a Built-in Transition System

Most frameworks treat animation as an afterthought -- something you bolt on with a CSS library or a JavaScript animation engine. Svelte takes a fundamentally different approach by making transitions a **compiler-level primitive**. The reason is tied to a problem that is genuinely hard to solve from userland: **animating elements as they enter and leave the DOM.**

Adding an element is easy: insert it and apply a CSS animation. But *removing* an element is paradoxical: you need to animate it *before* it is removed, which means you need to keep the element alive in the DOM temporarily after the condition that created it becomes false. In vanilla JavaScript, you would need to intercept the removal, play the animation, wait for it to finish, and then actually remove the element. This requires lifecycle management that is deeply intertwined with the rendering engine.

Svelte solves this at the compiler level. When you write \`transition:fade\` on an element inside an \`{#if}\` block, the compiler generates code that:

1. **On enter:** Inserts the element, then immediately starts the intro animation
2. **On exit:** Intercepts the removal, plays the outro animation, then removes the element after it completes
3. **On interruption:** If the condition toggles mid-animation, reverses the current animation smoothly from its current position

This interception-and-reversal behavior is nearly impossible to implement correctly from userland because it requires coordination with the framework's DOM reconciliation.

### CSS Keyframes vs. JavaScript Tick Functions

Svelte transitions support two animation strategies, and the choice between them has significant performance implications:

**CSS-based transitions** (the \`css\` function) generate dynamic \`@keyframes\` rules and apply them via CSS animations. The browser's compositor handles the interpolation on a separate thread (the compositor thread), meaning the main thread is free to handle user input and other JavaScript. This is why CSS transitions are the default for \`fade\`, \`fly\`, \`slide\`, and \`scale\` -- they are inherently performant because they leverage GPU acceleration.

**Tick-based transitions** (the \`tick\` function) run a JavaScript callback on every frame via \`requestAnimationFrame\`. This runs on the main thread and can cause jank if the callback is expensive. Tick functions exist for cases where CSS cannot express the animation (e.g., a typewriter effect that changes text content, or a counter that interpolates numbers).

### GPU-Accelerated Properties

Not all CSS properties can be animated on the compositor. The properties that *can* be GPU-accelerated are:
- \`transform\` (translate, rotate, scale)
- \`opacity\`
- \`filter\` (blur, etc.)

Properties like \`width\`, \`height\`, \`margin\`, \`padding\`, and \`color\` trigger layout or paint, which runs on the main thread. Svelte's built-in transitions are carefully designed to use only GPU-friendly properties:

- **fade:** Animates \`opacity\` (GPU)
- **fly:** Animates \`transform: translate()\` + \`opacity\` (GPU)
- **scale:** Animates \`transform: scale()\` + \`opacity\` (GPU)
- **slide:** Animates \`height\`/\`width\` + \`overflow\` (not GPU -- uses the tick approach for accuracy)
- **blur:** Animates \`filter: blur()\` + \`opacity\` (GPU)
- **draw:** Animates SVG \`stroke-dasharray\` (not GPU but lightweight)

### Transition Lifecycle

Every transition moves through a lifecycle that the compiler manages:

1. **Pending:** Element exists in the DOM but transition has not started (respects \`delay\`)
2. **Running:** Animation is playing; the \`t\` parameter moves from 0 to 1 (intro) or 1 to 0 (outro)
3. **Complete:** Animation finished; element is fully visible (after intro) or removed from DOM (after outro)

The \`t\` parameter is your interpolation value. At \`t=0\` the element is in its "absent" state; at \`t=1\` it is in its "present" state. Svelte also provides \`u = 1 - t\` as a convenience for computing the inverse.`
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

### The transition: Directive is Bidirectional

A key insight: \`transition:fade\` applies the same animation function in both directions. On intro, \`t\` goes 0->1. On outro, \`t\` goes 1->0. The same \`css\` function produces the correct CSS for both directions because it is written in terms of \`t\`. At \`t=0\`, opacity is 0 (invisible). At \`t=1\`, opacity is 1 (visible). Whether the element is appearing or disappearing, the function just needs the right \`t\` value.

This bidirectionality is why \`transition:\` is the default choice. You only need separate \`in:\` and \`out:\` when you want *different* animations for entering and leaving.

**Your task:** Create a toggle that shows/hides elements with different transitions. Use \`fade\`, \`fly\`, and \`slide\`. Observe how all three animate smoothly in both directions with a single directive.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Transition Parameters

Each transition accepts configuration parameters that control timing, positioning, and easing:

- \`fade\`: \`duration\`, \`delay\`, \`easing\`
- \`fly\`: \`x\`, \`y\`, \`duration\`, \`delay\`, \`easing\`, \`opacity\`
- \`slide\`: \`duration\`, \`delay\`, \`easing\`, \`axis\` (\`'x'\` or \`'y'\`)
- \`scale\`: \`start\`, \`duration\`, \`delay\`, \`easing\`, \`opacity\`

### Staggering with delay

The \`delay\` parameter is particularly useful for creating staggered animations where multiple elements appear in sequence. When several elements share the same \`{#if}\` block, they all transition simultaneously by default. Adding incrementing \`delay\` values creates a cascade effect:

\`\`\`svelte
<div transition:fade={{ delay: 0 }}>First</div>
<div transition:fade={{ delay: 100 }}>Second</div>
<div transition:fade={{ delay: 200 }}>Third</div>
\`\`\`

### Easing Functions

The \`easing\` parameter accepts any function that maps \`t\` (0-1) to a new value. Svelte ships many easings in \`svelte/easing\`: \`cubicOut\`, \`quintInOut\`, \`elasticOut\`, \`bounceOut\`, etc. The default easing for most transitions is \`cubicOut\` for intros (fast start, slow finish) and \`cubicIn\` for outros (slow start, fast finish), which feels natural to users.

Choosing the right easing is a UX decision:
- **cubicOut**: Natural deceleration. Best for elements entering the viewport.
- **cubicIn**: Natural acceleration. Best for elements leaving.
- **elasticOut**: Bouncy overshoot. Good for playful UI, bad for serious applications.
- **linear**: Mechanical, robotic. Rarely the right choice for UI.

**Task:** Add a \`scale\` transition with custom parameters and experiment with the \`delay\` option to stagger multiple elements. Notice how staggering creates a more polished, intentional feel than having everything animate at once.`
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
