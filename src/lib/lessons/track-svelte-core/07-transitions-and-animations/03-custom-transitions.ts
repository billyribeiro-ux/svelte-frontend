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

## WHY You Need Custom Transitions

Svelte's built-in transitions (\`fade\`, \`fly\`, \`slide\`, \`scale\`, \`blur\`, \`draw\`) cover the most common animation patterns, but they represent a small fraction of what is possible. Custom transitions let you animate *anything* -- 3D rotations, color shifts, clip paths, text reveals, particle effects, SVG morphing, and more.

A custom transition is just a function with a specific signature. The function receives the DOM node and optional parameters, and returns an object describing how to animate the element. There is no magic -- the same machinery that powers the built-in transitions powers yours.

### The Transition Function Signature

Every transition function follows this contract:

\`\`\`typescript
function myTransition(
  node: Element,
  params: MyParams
): TransitionConfig {
  return {
    delay?: number,      // ms before animation starts (default: 0)
    duration?: number,    // ms total animation time (default: 400)
    easing?: (t: number) => number,  // easing function (default: cubicOut for in, cubicIn for out)
    css?: (t: number, u: number) => string,  // CSS string generator
    tick?: (t: number, u: number) => void     // JS callback per frame
  };
}
\`\`\`

The \`TransitionConfig\` type is imported from \`svelte/transition\`. You must return **either** \`css\` or \`tick\` (not both). The \`t\` parameter goes from 0 to 1 during intro and from 1 to 0 during outro. \`u\` is always \`1 - t\`, provided as a convenience.

### CSS vs. Tick: A Deep Comparison

**CSS-based transitions (\`css\` function)**

When you return a \`css\` function, Svelte calls it once at the start of the transition with many sample values of \`t\`, generates a complete \`@keyframes\` rule, injects it into a \`<style>\` element, and applies it to the node via \`animation-name\`. The browser then handles all interpolation on the compositor thread.

Advantages:
- Runs on the GPU compositor thread (60fps even during heavy main-thread work)
- No per-frame JavaScript execution
- Automatically handles interruption (CSS animations can be reversed mid-flight)

Constraints:
- Can only animate CSS properties (not text content, attribute values, or DOM structure)
- The CSS string is sampled at discrete points, not continuously (Svelte generates ~60 keyframe steps)
- Cannot access the DOM during animation (the function runs before the animation starts)

**Tick-based transitions (\`tick\` function)**

When you return a \`tick\` function, Svelte calls it on every animation frame with the current \`t\` value. This runs in JavaScript on the main thread.

Advantages:
- Can manipulate anything: text content, SVG attributes, canvas drawing, scroll position
- Continuous interpolation (no keyframe sampling artifacts)
- Can read DOM measurements during animation

Constraints:
- Runs on the main thread (can cause jank if callback is expensive)
- No GPU acceleration
- More work for the garbage collector if creating objects per frame

### Decision Framework: When to Use Which

| Animation Target | Use \`css\` | Use \`tick\` |
|---|---|---|
| transform, opacity, filter | Yes | Avoid |
| width, height, margin | Possible but costly | Better (Svelte's \`slide\` uses this approach internally) |
| text content (typewriter) | Impossible | Required |
| SVG path morphing | Possible with \`d\` attribute via CSS | Easier and more precise |
| Scroll position | Impossible | Required |
| Canvas / WebGL | Impossible | Required |
| Counter / number interpolation | Impossible | Required |`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.transitions.custom'
		},
		{
			type: 'text',
			content: `## CSS-based Custom Transitions

Return a \`css\` function that receives \`t\` (0 to 1) and \`u\` (1 to 0) and returns a CSS string. Svelte samples this function at many points, builds a \`@keyframes\` rule, and applies it.

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

### Building a Spin Transition from Scratch

Let us trace through what happens when this transition runs:

1. **Intro starts:** \`t\` goes from 0 to 1. At \`t=0\`: rotate(0deg), scale(0), opacity(0) -- invisible. At \`t=0.5\`: rotate(180deg), scale(0.5), opacity(0.5) -- half-visible, rotated halfway. At \`t=1\`: rotate(360deg), scale(1), opacity(1) -- fully visible, completed full rotation.

2. **Svelte samples** the \`css\` function at ~60 evenly-spaced \`t\` values and generates:
   \`\`\`css
   @keyframes svelte_spin_123 {
     0% { transform: rotate(0deg) scale(0); opacity: 0; }
     1.67% { transform: rotate(6deg) scale(0.017); opacity: 0.017; }
     /* ... 58 more keyframes ... */
     100% { transform: rotate(360deg) scale(1); opacity: 1; }
   }
   \`\`\`

3. **The animation runs** entirely on the compositor -- no JavaScript per frame.

### Combining Multiple CSS Properties

You can animate any combination of CSS properties. Just return a single string with all properties:

\`\`\`typescript
css: (t) => \`
  transform: translateX(\${(1 - t) * 100}px) rotate(\${t * 360}deg);
  opacity: \${t};
  filter: blur(\${(1 - t) * 4}px);
  clip-path: circle(\${t * 100}% at 50% 50%);
\`
\`\`\`

**Your task:** Create a custom \`spin\` transition that rotates and scales the element. Experiment with the interpolation values to get a feel for how \`t\` maps to visual properties.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Tick-based Custom Transitions: The Typewriter Effect

For transitions that need to manipulate the DOM directly, use the \`tick\` function. The typewriter effect is the classic example -- it reveals text character by character, which requires changing \`textContent\` on every frame.

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

### Building the Typewriter from Scratch

Let us trace the logic:

1. **Capture the original text** before the animation starts. This is critical -- we read \`node.textContent\` in the outer function (which runs once), not in \`tick\` (which runs per frame).

2. **Calculate duration** from text length. A 40-character string at 30ms per character = 1200ms total. This makes the animation duration proportional to content length, which feels natural.

3. **On each frame**, compute how many characters should be visible: \`Math.floor(text.length * t)\`. At \`t=0\`, zero characters (empty). At \`t=0.5\`, half the characters. At \`t=1\`, all characters.

4. **Set textContent** to the slice. This is a direct DOM mutation -- something CSS animations cannot do.

### Performance Considerations for Tick Functions

The \`tick\` function runs on every \`requestAnimationFrame\` (typically 60 times per second). For the typewriter example, the work per frame is trivial: one multiplication, one \`Math.floor\`, one \`String.slice\`, one property assignment. This will never cause jank.

But if your tick function does something expensive -- measuring layout, creating DOM nodes, performing complex calculations -- it can drop frames. Profile with the browser's Performance tab if you see jank.

### Beyond Typewriter: Other Tick Patterns

- **Counter animation:** Interpolate a number from 0 to its final value
- **Canvas drawing:** Progressively reveal a canvas illustration
- **Scramble text:** Show random characters that resolve into the final text
- **Progress bar:** Animate a width alongside text content showing the percentage

**Task:** Create a typewriter transition that reveals text character by character. Consider the interplay between \`speed\` (per-character delay) and \`duration\` (total animation time). They are linked: \`duration = text.length * speed\`.`
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
				'The `css` function receives `t` (0 to 1) -- use it for transform and opacity.',
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
				'Use `tick` instead of `css` -- it receives `t` and lets you manipulate the DOM.',
				'Get the text content, calculate duration, and slice the text based on `t`.',
				'`tick: (t) => { const i = Math.floor(text.length * t); node.textContent = text.slice(0, i); }`'
			],
			conceptsTested: ['svelte5.transitions.custom', 'svelte5.transitions.tick-fn']
		}
	]
};
