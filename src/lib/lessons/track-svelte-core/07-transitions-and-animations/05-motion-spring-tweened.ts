import type { Lesson } from '$types/lesson';

export const motionSpringTweened: Lesson = {
	id: 'svelte-core.transitions-and-animations.motion-spring-tweened',
	slug: 'motion-spring-tweened',
	title: 'Spring & Tweened Motion',
	description:
		'Use spring() and tweened() from svelte/motion to animate continuous value changes with physics-based and duration-based interpolation.',
	trackId: 'svelte-core',
	moduleId: 'transitions-and-animations',
	order: 5,
	estimatedMinutes: 18,
	concepts: ['svelte5.motion.spring', 'svelte5.motion.tweened', 'svelte5.motion.interpolation'],
	prerequisites: ['svelte5.runes.state', 'svelte5.transitions.directive'],

	content: [
		{
			type: 'text',
			content: `# Spring & Tweened Motion

## WHY svelte/motion Exists

If you have worked through the transition lessons, you understand that Svelte's \`transition:\` directive solves a specific problem: animating elements as they **enter and leave** the DOM. But there is an entirely different category of animation that transitions cannot address: **continuous value interpolation while an element stays in the DOM.**

Consider these scenarios:

- A slider thumb moves from position 20 to position 80. You don't want it to teleport -- you want it to glide.
- A progress bar fills from 30% to 75%. It should animate smoothly, not jump.
- A user drags an element across the screen. When released, it should spring back to its origin with realistic physics -- overshoot, bounce, settle.
- A dashboard counter changes from 1,247 to 3,891. The number should roll up visually.

None of these involve elements entering or leaving. The element is *always present*. What changes is a **numeric value** that drives some visual property. This is the domain of \`svelte/motion\`.

The module provides two primitives: \`spring()\` and \`tweened()\`. Both create **reactive motion stores** -- special objects that, when you set a new target value, don't jump to it immediately. Instead, they interpolate from the current value to the target over time, emitting intermediate values on every animation frame. Your UI binds to the current value of the store, so the element moves smoothly.

### Why This Cannot Be Done with CSS Transitions Alone

You might wonder: "Can't I just put \`transition: all 0.3s\` on the element and change a CSS property?" In many simple cases, yes. But svelte/motion solves problems CSS transitions cannot:

1. **Physics-based animation.** CSS transitions use easing curves (cubic-bezier) which are mathematical functions of time. They cannot model physical properties like mass, stiffness, and damping. A spring animation overshoots its target and oscillates before settling -- the number and amplitude of oscillations depend on the physics parameters, not a fixed duration. CSS cannot express this.

2. **Interruption handling.** If the user drags an element, releases it, and immediately grabs it again mid-bounce, a CSS transition would awkwardly restart. A spring store preserves its current velocity, so the interruption feels seamless.

3. **Animating non-CSS values.** What if you want to animate a number displayed as text, or interpolate between two colors in JavaScript, or smoothly update the data array driving a D3 chart? CSS transitions only work on CSS properties. Svelte motion stores animate *any* JavaScript value.

4. **Coordinated multi-property animation.** You might want x, y, rotation, and scale to all spring toward targets with the same physics. With CSS, each property would need its own transition declaration. With a spring store holding an object \`{ x, y, rotation, scale }\`, they all move together with unified physics.

### Under the Hood: How Motion Stores Work

When you call \`spring(initialValue)\` or \`tweened(initialValue)\`, Svelte creates an object that:

1. **Holds internal state:** the current value, the target value, and (for spring) the current velocity.
2. **Runs a frame loop:** When you call \`.set(newTarget)\`, it kicks off a \`requestAnimationFrame\` loop that runs on every frame (~60fps or ~120fps depending on the display).
3. **Computes intermediate values:** Each frame, the spring applies its physics equation (damped harmonic oscillator) or the tweened store applies its easing function to compute the next intermediate value.
4. **Triggers reactive updates:** The new intermediate value is written to the store, which triggers Svelte's reactivity system to re-render any components reading it.
5. **Stops automatically:** The loop stops when the value settles at the target (spring) or the duration elapses (tweened).

Critically, this frame loop runs **outside** Svelte's normal reactivity graph. Setting a spring target does not synchronously trigger a cascade of derivations. Instead, it schedules asynchronous frame callbacks. Each callback writes a single value update, which Svelte batches with any other pending updates. This keeps motion animation performant even when multiple spring stores animate simultaneously.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.motion.spring'
		},
		{
			type: 'text',
			content: `## spring() -- Physics-Based Animation

\`\`\`svelte
<script lang="ts">
  import { spring } from 'svelte/motion';

  let coords = spring({ x: 50, y: 50 }, {
    stiffness: 0.1,
    damping: 0.25
  });
</script>

<svg on:pointermove={(e) => coords.set({ x: e.clientX, y: e.clientY })}>
  <circle cx={$coords.x} cy={$coords.y} r="20" fill="#6366f1" />
</svg>
\`\`\`

### WHY Physics Feels Natural

Humans live in a physical world. When you push a ball, it accelerates, overshoots, bounces back, and gradually settles due to friction. Our brains have deeply internalized these motion patterns over a lifetime. When a UI element moves with physics-based animation, it activates the same neural pathways -- the motion feels *real*, *responsive*, *alive*.

Duration-based animations (tweened, CSS transitions) feel mechanical by comparison because they always take exactly the same time regardless of distance. If you move a slider 5 pixels, it takes 300ms. If you move it 500 pixels, it also takes 300ms. That disconnect from physical reality creates subtle unease.

A spring, by contrast, naturally scales: small movements are fast and snappy; large movements take longer and have more dramatic overshoot. This is because the spring force is proportional to displacement (Hooke's law: F = -kx).

### The Two Parameters That Matter

**stiffness** (0 to 1, default 0.15): How strongly the spring pulls toward its target. Higher stiffness = faster, snappier motion. Lower stiffness = slower, lazier motion. Think of it as the "tightness" of the spring. A value of 0.5 or higher creates very snappy motion suitable for UI elements that should feel responsive. A value of 0.05 creates slow, floaty motion suitable for decorative background elements.

**damping** (0 to 1, default 0.8): How quickly oscillation dies out. Higher damping = less overshoot, settles faster. Lower damping = more bouncy, oscillates longer. A damping of 1.0 is "critically damped" -- it reaches the target as fast as possible without overshooting. A damping of 0.2 creates a very bouncy effect with several visible oscillations.

### Decision Framework: Choosing stiffness and damping

| Use Case | Stiffness | Damping | Why |
|---|---|---|---|
| Cursor follower / tooltip | 0.2-0.3 | 0.6-0.8 | Responsive but smooth, minimal bounce |
| Drag-and-release snap back | 0.1-0.2 | 0.3-0.5 | Visible bounce communicates elasticity |
| Button press feedback | 0.4-0.6 | 0.7-0.9 | Snappy, barely any overshoot |
| Decorative floating element | 0.03-0.08 | 0.5-0.7 | Slow and dreamy |
| Notification badge count | 0.3-0.4 | 0.4-0.6 | Noticeable bounce draws attention |

### The .set() and .update() Methods

\`\`\`typescript
// Jump directly to a new target, no animation:
coords.set({ x: 100, y: 100 }, { hard: true });

// Animate to a new target:
coords.set({ x: 100, y: 100 });

// Update based on current value:
coords.update(current => ({
  x: current.x + 10,
  y: current.y + 10
}));
\`\`\`

The \`{ hard: true }\` option is important. When you need to teleport a value without animation -- for example, when initializing a component or resetting after a context change -- pass \`hard: true\` to bypass the spring physics entirely.

**Your task:** Create a circle that follows the mouse pointer with springy physics. The circle should lag behind the cursor and overshoot when you stop suddenly, then settle into position.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## tweened() -- Duration-Based Interpolation

While spring is driven by physics, \`tweened()\` is driven by **time**. You specify a duration and an easing function, and the value interpolates from A to B over that exact timeframe.

\`\`\`svelte
<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  let progress = tweened(0, {
    duration: 400,
    easing: cubicOut
  });
</script>

<button onclick={() => progress.set(Math.random() * 100)}>
  Randomize
</button>

<div class="bar" style="width: {$progress}%"></div>
<p>{Math.round($progress)}%</p>
\`\`\`

### When to Use tweened vs spring

This is one of the most common questions, and the answer comes down to **predictability vs naturalism:**

**Use tweened when:**
- You need the animation to take a **predictable, fixed duration** (progress bars, loading indicators, timed reveals)
- The animation is **not interactive** -- the user is watching, not driving it
- You need precise **easing control** (ease-in for exits, ease-out for entrances)
- You are building **synchronized animations** where multiple elements must finish at the same time

**Use spring when:**
- The user is **directly manipulating** the value (dragging, scrolling, swiping)
- You want **interruption resilience** -- the user might change the target mid-animation
- You want motion that **scales naturally** with distance
- You want **overshoot and bounce** for personality and physicality

A practical heuristic: if the animation responds to a user gesture in real time, use spring. If the animation responds to a state change in the application, use tweened.

### Custom Interpolators

Both spring and tweened can animate more than numbers. By default they handle numbers and objects/arrays of numbers. For anything else, provide a custom \`interpolate\` function:

\`\`\`typescript
import { tweened } from 'svelte/motion';

// Interpolating colors (hex strings)
function interpolateColor(a: string, b: string) {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);

  return (t: number) => {
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const b_val = Math.round(ab + (bb - ab) * t);
    return '#' + [r, g, b_val].map(v =>
      v.toString(16).padStart(2, '0')
    ).join('');
  };
}

let color = tweened('#ff0000', {
  duration: 800,
  interpolate: interpolateColor
});
\`\`\`

The \`interpolate\` function receives the start value \`a\` and end value \`b\`, and returns a function that takes \`t\` (0-1) and returns the interpolated value at that point. This pattern lets you animate anything: colors, strings, complex nested objects, even arrays of different lengths.

### Performance Considerations

Motion stores are lightweight but not free. Each active store runs a \`requestAnimationFrame\` loop that executes JavaScript on the main thread every frame. For 1-5 simultaneous animations, this is negligible. For 50+ (e.g., animating every item in a large list), you may notice frame drops on lower-end devices.

Strategies for high-animation-count scenarios:
- **Stagger starts:** Don't kick off all animations on the same frame
- **Use CSS transitions instead** for simple property changes on many elements
- **Reduce precision:** For non-critical decorative animations, consider checking \`prefers-reduced-motion\` and skipping animation entirely`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.motion.tweened'
		},
		{
			type: 'xray-prompt',
			content: `Think about what happens inside a spring store when the user changes the target three times in rapid succession (before any animation completes). How does the spring handle the accumulated velocity? Why does this produce more natural motion than restarting a duration-based tween each time? Consider what the velocity vector looks like when the target suddenly shifts -- the spring continues from its current position AND current velocity, creating a smooth redirection rather than an abrupt restart. This is why spring is superior for interactive use cases.`
		},
		{
			type: 'text',
			content: `## Combining Spring and Tweened in a Real UI

A polished interface often uses both primitives together. Consider a settings panel where:

- A **slider thumb** uses \`spring\` because the user drags it (interactive, needs interruption resilience)
- A **value display** uses \`tweened\` because it shows the numeric result (non-interactive, needs predictable timing)
- A **color preview** uses \`tweened\` with a custom interpolator (non-interactive, interpolating a non-numeric value)

\`\`\`svelte
<script lang="ts">
  import { spring, tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  let springPos = spring(50, { stiffness: 0.15, damping: 0.7 });
  let displayValue = tweened(50, { duration: 300, easing: cubicOut });

  function handleInput(e: Event) {
    const val = Number((e.target as HTMLInputElement).value);
    springPos.set(val);
    displayValue.set(val);
  }
</script>

<input type="range" min="0" max="100" value={50} oninput={handleInput} />
<div class="indicator" style="left: {$springPos}%"></div>
<p>Value: {Math.round($displayValue)}</p>
\`\`\`

**Your task:** Build an interactive demo that combines both motion types. Create a slider that controls a value. Use \`tweened\` for a smooth numeric display and \`spring\` for a bouncy circle indicator that tracks the slider position. The circle should overshoot and settle, while the number should glide smoothly.`
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
  // TODO: Import spring and tweened from 'svelte/motion'
  // TODO: Import an easing function from 'svelte/easing'

  // TODO: Create a spring store for the circle's position (start at 50)
  // Hint: use stiffness: 0.15 and damping: 0.5

  // TODO: Create a tweened store for the display value (start at 50)
  // Hint: use duration: 300 and an easing function

  let sliderValue = $state(50);

  function handleInput(e: Event) {
    const val = Number((e.target as HTMLInputElement).value);
    sliderValue = val;
    // TODO: Set the spring and tweened targets to the new value
  }
</script>

<div class="container">
  <h2>Spring & Tweened Demo</h2>

  <div class="slider-section">
    <label>Drag the slider:</label>
    <input
      type="range"
      min="0"
      max="100"
      value={sliderValue}
      oninput={handleInput}
    />
  </div>

  <div class="track">
    <!-- TODO: Position this circle using the spring store value -->
    <!-- Use style="left: {value}%" -->
    <div class="circle"></div>
  </div>

  <div class="value-display">
    <!-- TODO: Show the tweened value here, rounded to nearest integer -->
    <span class="number">--</span>
  </div>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    max-width: 500px;
    margin: 2rem auto;
    padding: 2rem;
  }

  h2 {
    color: #1e293b;
    margin-bottom: 1.5rem;
  }

  .slider-section {
    margin-bottom: 2rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #475569;
    font-weight: 500;
  }

  input[type="range"] {
    width: 100%;
    accent-color: #6366f1;
  }

  .track {
    position: relative;
    height: 60px;
    background: #f1f5f9;
    border-radius: 30px;
    margin-bottom: 1.5rem;
    overflow: visible;
  }

  .circle {
    position: absolute;
    top: 50%;
    width: 40px;
    height: 40px;
    background: #6366f1;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  .value-display {
    text-align: center;
  }

  .number {
    font-size: 3rem;
    font-weight: 700;
    color: #6366f1;
    font-variant-numeric: tabular-nums;
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
  import { spring, tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  let springPos = spring(50, {
    stiffness: 0.15,
    damping: 0.5
  });

  let displayValue = tweened(50, {
    duration: 300,
    easing: cubicOut
  });

  let sliderValue = $state(50);

  function handleInput(e: Event) {
    const val = Number((e.target as HTMLInputElement).value);
    sliderValue = val;
    springPos.set(val);
    displayValue.set(val);
  }
</script>

<div class="container">
  <h2>Spring & Tweened Demo</h2>

  <div class="slider-section">
    <label>Drag the slider:</label>
    <input
      type="range"
      min="0"
      max="100"
      value={sliderValue}
      oninput={handleInput}
    />
  </div>

  <div class="track">
    <div class="circle" style="left: {$springPos}%"></div>
  </div>

  <div class="value-display">
    <span class="number">{Math.round($displayValue)}</span>
  </div>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    max-width: 500px;
    margin: 2rem auto;
    padding: 2rem;
  }

  h2 {
    color: #1e293b;
    margin-bottom: 1.5rem;
  }

  .slider-section {
    margin-bottom: 2rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #475569;
    font-weight: 500;
  }

  input[type="range"] {
    width: 100%;
    accent-color: #6366f1;
  }

  .track {
    position: relative;
    height: 60px;
    background: #f1f5f9;
    border-radius: 30px;
    margin-bottom: 1.5rem;
    overflow: visible;
  }

  .circle {
    position: absolute;
    top: 50%;
    width: 40px;
    height: 40px;
    background: #6366f1;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  .value-display {
    text-align: center;
  }

  .number {
    font-size: 3rem;
    font-weight: 700;
    color: #6366f1;
    font-variant-numeric: tabular-nums;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a spring store and use it to make a circle follow the mouse with physics-based animation',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'spring(' },
						{ type: 'contains', value: "svelte/motion" },
						{ type: 'contains', value: '.set(' }
					]
				}
			},
			hints: [
				'Start by importing `spring` from `svelte/motion` and creating a spring store with an object value like `{ x: 50, y: 50 }`.',
				'Use `spring({ x: 50, y: 50 }, { stiffness: 0.1, damping: 0.25 })` and call `.set()` with new coordinates in a pointer event handler.',
				'Full pattern: `let coords = spring({ x: 50, y: 50 }, { stiffness: 0.1, damping: 0.25 });` then in an `on:pointermove` handler call `coords.set({ x: e.clientX, y: e.clientY })` and bind the circle position to `$coords.x` and `$coords.y`.'
			],
			conceptsTested: ['svelte5.motion.spring']
		},
		{
			id: 'cp-2',
			description: 'Combine spring for the bouncy circle and tweened for the smooth numeric display',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'spring(' },
						{ type: 'contains', value: 'tweened(' },
						{ type: 'contains', value: 'Math.round(' }
					]
				}
			},
			hints: [
				'You need two separate motion stores: one `spring()` for the circle position and one `tweened()` for the number display. Both should update in the `handleInput` function.',
				'Create `let springPos = spring(50, { stiffness: 0.15, damping: 0.5 })` and `let displayValue = tweened(50, { duration: 300, easing: cubicOut })`. Call `.set(val)` on both in `handleInput`.',
				'Bind the circle with `style="left: {$springPos}%"` and show the number with `{Math.round($displayValue)}`. The spring will overshoot and bounce while the tweened value glides smoothly.'
			],
			conceptsTested: ['svelte5.motion.spring', 'svelte5.motion.tweened', 'svelte5.motion.interpolation']
		}
	]
};
