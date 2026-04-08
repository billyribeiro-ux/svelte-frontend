import type { Lesson } from '$types/lesson';

export const allBuiltInTransitions: Lesson = {
	id: 'svelte-core.transitions.all-built-in',
	slug: 'all-built-in-transitions',
	title: 'All 7 Built-in Transitions — Complete Reference',
	description:
		'A comprehensive, visual guide to all seven built-in Svelte transitions — fade, fly, slide, scale, blur, draw, and crossfade — covering every parameter, when to use each, and interactive comparison demos.',
	trackId: 'svelte-core',
	moduleId: 'transitions-and-animations',
	order: 7,
	estimatedMinutes: 30,
	concepts: ['svelte5.transitions.fade', 'svelte5.transitions.fly', 'svelte5.transitions.slide', 'svelte5.transitions.scale', 'svelte5.transitions.blur', 'svelte5.transitions.draw'],
	prerequisites: ['svelte5.transitions.basics', 'svelte5.control-flow.if'],

	content: [
		{
			type: 'text',
			content: `# All 7 Built-in Svelte Transitions

Svelte ships seven transition functions from \`svelte/transition\`. This is a complete reference covering every function, every parameter, the visual effect, and when to use it.

All transitions share these base parameters:
- **\`delay\`** — milliseconds before the transition starts (default: 0)
- **\`duration\`** — milliseconds for the transition to complete (default: varies)
- **\`easing\`** — easing function from \`svelte/easing\` (default: \`linear\` or \`cubicOut\`)

## 1. \`fade\` — Opacity Only

The simplest transition. Fades an element in/out by animating its \`opacity\`.

\`\`\`svelte
<div transition:fade={{ duration: 300 }}>content</div>
\`\`\`

**Parameters:** \`delay\`, \`duration\`, \`easing\`

**Use when:** Toast notifications, modal overlays, loading spinners — any element that appears/disappears without needing spatial context. Also good as a fallback or default when nothing else fits.

**Avoid when:** The element has a spatial relationship with others (use \`fly\` or \`slide\` instead).

## 2. \`fly\` — Translate + Opacity

The workhorse transition. Moves an element from an offset position while fading.

\`\`\`svelte
<!-- From below -->
<div in:fly={{ y: 20, duration: 400 }}>content</div>

<!-- From the right -->
<div in:fly={{ x: 100, duration: 400 }}>content</div>

<!-- From below AND right, with opacity -->
<div in:fly={{ x: 50, y: 20, opacity: 0, duration: 500 }}>content</div>
\`\`\`

**Parameters:** \`x\` (px or string), \`y\` (px or string), \`opacity\` (0–1), \`delay\`, \`duration\`, \`easing\`

**Note on opacity:** The \`opacity\` parameter sets the *starting* opacity for \`in:\` (and ending for \`out:\`). Default is 0, meaning the element fully fades in. Set to 0.5 for a partial fade, 1 to disable opacity animation entirely.

**Use when:** Page content entering from a direction, drawer/panel opening from a side, notification flying in from a corner, staggered list items animating in.

## 3. \`slide\` — Height/Width + Opacity

Slides an element in/out along one axis, animating its size (height by default).

\`\`\`svelte
<!-- Vertical (collapses height) -->
<div transition:slide={{ duration: 300 }}>content</div>

<!-- Horizontal (collapses width) -->
<div transition:slide={{ duration: 300, axis: 'x' }}>content</div>
\`\`\`

**Parameters:** \`delay\`, \`duration\`, \`easing\`, \`axis\` (\`'y'\` or \`'x'\`, default: \`'y'\`)

**How it works:** Unlike \`fly\`, \`slide\` does not use \`transform\` — it actually animates the \`clip-path\` or \`overflow\`/\`height\` of the element. This means surrounding content moves to fill the space as the element collapses.

**Use when:** Accordion content, FAQ answers, expandable sections, collapsible navs — anywhere sibling content should reflow as the element reveals.

**Avoid when:** The element's height is unknown/complex — use \`interpolate-size: allow-keywords\` with CSS height instead.

## 4. \`scale\` — Scale + Opacity

Scales an element from a fractional size to its full size (or vice versa on exit).

\`\`\`svelte
<!-- Scale from 80% with fade -->
<div transition:scale={{ start: 0.8, duration: 250 }}>content</div>

<!-- Pure scale, no opacity -->
<div transition:scale={{ start: 0.95, opacity: 1, duration: 200 }}>content</div>
\`\`\`

**Parameters:** \`start\` (0–1, default: 0), \`opacity\` (0–1, default: 0), \`delay\`, \`duration\`, \`easing\`

**Use when:** Dropdown menus, context menus, tooltips, command palettes, modal dialogs — anything that feels like it "pops" into existence from a point rather than sliding from a direction.

## 5. \`blur\` — Blur Filter + Opacity

Animates a CSS \`blur()\` filter from a starting value to 0 (or vice versa), combined with opacity.

\`\`\`svelte
<!-- Soft blur on enter -->
<div transition:blur={{ amount: 8, duration: 400 }}>content</div>
\`\`\`

**Parameters:** \`amount\` (px, default: 5), \`opacity\` (0–1, default: 0), \`delay\`, \`duration\`, \`easing\`

**Performance note:** CSS blur is GPU-accelerated on modern browsers. However, blurring large elements can be expensive on mobile devices. Use \`will-change: filter\` or test on low-end hardware.

**Use when:** Section headings revealing dramatically, hero text coming into focus, image reveals, premium/cinematic transitions. The blur transition communicates "this just materialised from elsewhere."

## 6. \`draw\` — SVG Stroke Drawing

Animates the \`stroke-dashoffset\` of an SVG path, making it appear to draw itself.

\`\`\`svelte
<!-- Only works on SVG elements with getTotalLength() -->
<svg viewBox="0 0 100 100">
  <path
    d="M10,50 Q50,10 90,50"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    in:draw={{ duration: 800, easing: cubicOut }}
  />
</svg>
\`\`\`

**Parameters:** \`delay\`, \`duration\` (or \`speed\` — px per second), \`easing\`

**Compatible elements:** Any SVG element that has a \`getTotalLength()\` method: \`<path>\`, \`<polyline>\`, \`<polygon>\`, \`<line>\`, \`<circle>\`, \`<ellipse>\`, \`<rect>\`.

**Use when:** Animated logos, signature animations, chart line reveals, icon stroke animations, data visualisations where the connection between points should feel drawn.

## 7. \`crossfade\` — Shared Element Transitions

See the dedicated Crossfade lesson for complete coverage. Summary:

\`\`\`ts
import { crossfade } from 'svelte/transition';
const [send, receive] = crossfade({ duration: 400 });
\`\`\`

\`crossfade\` coordinates the exit of one element with the entry of another with the same key, creating a "fly to new position" effect.

**Use when:** Moving items between lists (kanban, todo), shared hero images between list and detail views, tab content transitions.

---

## Quick Comparison Table

| Transition | Property animated | Surrounding content moves? | Best for |
|---|---|---|---|
| \`fade\` | opacity | No | Overlays, toast, modals |
| \`fly\` | transform + opacity | No | Page content, panels, lists |
| \`slide\` | clip + height/width | **Yes** | Accordions, expandable |
| \`scale\` | transform(scale) + opacity | No | Dropdowns, popovers |
| \`blur\` | filter(blur) + opacity | No | Cinematic reveals |
| \`draw\` | stroke-dashoffset | No (SVG only) | Logos, charts, icons |
| \`crossfade\` | transform + opacity (coordinated) | No | Moving between lists |`
		},
		{
			type: 'checkpoint',
			content: 'cp-transitions-comparison'
		},
		{
			type: 'checkpoint',
			content: 'cp-draw-svg'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  import { fade, fly, slide, scale, blur, draw } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let selected = $state('fade');
  let visible = $state(true);

  function toggle() { visible = !visible; }

  const transitions = {
    fade:  { fn: fade,  params: { duration: 400 } },
    fly:   { fn: fly,   params: { y: 30, duration: 400 } },
    slide: { fn: slide, params: { duration: 400 } },
    scale: { fn: scale, params: { start: 0.8, duration: 400 } },
    blur:  { fn: blur,  params: { amount: 8, duration: 400 } },
  };
</script>

<div class="demo">
  <div class="controls">
    {#each Object.keys(transitions) as name}
      <button
        class:active={selected === name}
        onclick={() => { selected = name; visible = true; }}
      >
        {name}
      </button>
    {/each}
  </div>

  <button class="toggle" onclick={toggle}>
    {visible ? 'Hide' : 'Show'}
  </button>

  <div class="stage">
    <!-- TODO: Apply the selected transition dynamically -->
    <!-- Hint: use transitions[selected] -->
    {#if visible}
      <div class="box">
        <span class="label">{selected}</span>
      </div>
    {/if}
  </div>

  <!-- SVG Draw section -->
  <div class="svg-section">
    <h3>draw transition</h3>
    <!-- TODO: Add in:draw to this path element -->
    {#key selected}
      <svg viewBox="0 0 200 100" class="draw-svg">
        <path
          d="M10,80 C40,10 80,10 100,50 S160,90 190,20"
          fill="none"
          stroke="#6366f1"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
    {/key}
  </div>
</div>

<style>
  .demo { max-width: 500px; margin: 2rem auto; font-family: system-ui, sans-serif; }
  .controls { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  button { padding: 0.4rem 0.8rem; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer; font-size: 0.875rem; }
  button.active { background: #6366f1; color: white; border-color: #6366f1; }
  .toggle { background: #f1f5f9; margin-bottom: 1rem; display: block; }
  .stage { block-size: 120px; display: flex; align-items: center; justify-content: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 1.5rem; overflow: hidden; }
  .box { inline-size: 100px; block-size: 80px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .label { color: white; font-size: 0.75rem; font-weight: 600; }
  .svg-section h3 { font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem; }
  .draw-svg { width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  import { fade, fly, slide, scale, blur, draw } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let selected = $state('fade');
  let visible = $state(true);

  function toggle() { visible = !visible; }

  const transitions = {
    fade:  { fn: fade,  params: { duration: 400, easing: cubicOut } },
    fly:   { fn: fly,   params: { y: 30, duration: 400, easing: cubicOut } },
    slide: { fn: slide, params: { duration: 400, easing: cubicOut } },
    scale: { fn: scale, params: { start: 0.8, duration: 400, easing: cubicOut } },
    blur:  { fn: blur,  params: { amount: 8, duration: 400, easing: cubicOut } },
  };

  const current = $derived(transitions[selected]);
</script>

<div class="demo">
  <div class="controls">
    {#each Object.keys(transitions) as name}
      <button
        class:active={selected === name}
        onclick={() => { selected = name; visible = true; }}
      >
        {name}
      </button>
    {/each}
  </div>

  <button class="toggle" onclick={toggle}>
    {visible ? 'Hide' : 'Show'}
  </button>

  <div class="stage">
    {#if visible}
      <div
        class="box"
        in:{ current.fn }={ current.params }
        out:{ current.fn }={ current.params }
      >
        <span class="label">{selected}</span>
      </div>
    {/if}
  </div>

  <div class="svg-section">
    <h3>draw transition — changes on each selection</h3>
    {#key selected}
      <svg viewBox="0 0 200 100" class="draw-svg">
        <path
          d="M10,80 C40,10 80,10 100,50 S160,90 190,20"
          fill="none"
          stroke="#6366f1"
          stroke-width="3"
          stroke-linecap="round"
          in:draw={{ duration: 800, easing: cubicOut }}
        />
      </svg>
    {/key}
  </div>
</div>

<style>
  .demo { max-width: 500px; margin: 2rem auto; font-family: system-ui, sans-serif; }
  .controls { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  button { padding: 0.4rem 0.8rem; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer; font-size: 0.875rem; }
  button.active { background: #6366f1; color: white; border-color: #6366f1; }
  .toggle { background: #f1f5f9; margin-bottom: 1rem; display: block; }
  .stage { block-size: 120px; display: flex; align-items: center; justify-content: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 1.5rem; overflow: hidden; }
  .box { inline-size: 100px; block-size: 80px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .label { color: white; font-size: 0.75rem; font-weight: 600; }
  .svg-section h3 { font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem; }
  .draw-svg { width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-transitions-comparison',
			description: 'Apply transitions dynamically based on the selected transition type',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'fade' },
						{ type: 'contains', value: 'slide' },
						{ type: 'contains', value: 'scale' },
						{ type: 'contains', value: 'blur' }
					]
				}
			},
			hints: [
				'Import all transitions at the top: `import { fade, fly, slide, scale, blur, draw } from "svelte/transition"`.',
				'Create a lookup object mapping names to transition functions and params.',
				'For dynamic transitions: `<div in:{ fn }={ params }>` — use bracket syntax for programmatic transition application.'
			],
			conceptsTested: ['svelte5.transitions.fade', 'svelte5.transitions.fly', 'svelte5.transitions.slide', 'svelte5.transitions.scale', 'svelte5.transitions.blur']
		},
		{
			id: 'cp-draw-svg',
			description: 'Apply in:draw to an SVG path element',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'draw' },
						{ type: 'contains', value: 'in:draw' }
					]
				}
			},
			hints: [
				'`draw` only works on SVG elements that have a `getTotalLength()` method — `<path>`, `<polyline>`, `<line>`, `<circle>`, etc.',
				'Wrap in a `{#key}` block to re-trigger the draw animation when data changes.',
				'Use `speed` instead of `duration` to make the draw time proportional to path length: `in:draw={{ speed: 200 }}`.'
			],
			conceptsTested: ['svelte5.transitions.draw']
		}
	]
};
