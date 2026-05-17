import type { Lesson } from '$types/lesson';

export const springAndTween: Lesson = {
	id: 'svelte-core.transitions.spring-and-tween',
	slug: 'spring-and-tween',
	title: 'Spring & Tween — Physics-Based Motion',
	description:
		'Master svelte/motion\'s Spring and Tween classes to build fluid, physics-based animations — animated counters, smooth sliders, and spring-loaded UI — the Svelte 5 way.',
	trackId: 'svelte-core',
	moduleId: 'transitions-and-animations',
	order: 5,
	estimatedMinutes: 25,
	concepts: ['svelte5.motion.spring', 'svelte5.motion.tween', 'svelte5.motion.reduced-motion'],
	prerequisites: ['svelte5.transitions.basics', 'svelte5.runes.state', 'svelte5.runes.derived'],

	content: [
		{
			type: 'text',
			content: `# Spring & Tween — Physics-Based Motion

Transitions in Svelte handle entering and leaving the DOM. But what about values that already exist and need to change smoothly over time? A score that animates upward when points are earned. A progress bar that flows to its new position. A card that snaps back with a bounce.

That is what \`svelte/motion\` is for.

## The Two Motion Primitives

Svelte 5 exposes two class-based motion primitives:

**\`Tween\`** — interpolates a value from its current position to a target over a fixed duration using an easing function. Use it when you want predictable, timing-based animation: "animate to X over 600 milliseconds, easing with cubicOut."

**\`Spring\`** — simulates a physical spring. Instead of a duration, it has \`stiffness\` (how strong the spring is) and \`damping\` (how quickly oscillation decays). Use it when you want natural, physics-based feel: a draggable element that snaps back, a tooltip that bounces into position.

## Tween — Time-Based Interpolation

\`\`\`svelte
<script>
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  // Create a tween starting at 0, animating with cubicOut over 800ms
  const progress = new Tween(0, { duration: 800, easing: cubicOut });
</script>

<!-- progress.current is reactive — use it in the template -->
<div class="bar" style="width: {progress.current}%"></div>

<button onclick={() => { progress.target = 75; }}>Animate to 75%</button>
\`\`\`

Key properties:
- **\`tween.target\`** — set this to trigger animation to a new value
- **\`tween.current\`** — the live interpolated value (reactive, use in templates)
- Constructor options: \`duration\` (ms), \`easing\`, \`delay\`, \`interpolate\` (for non-numeric values)

The old \`tweened()\` store still works but is deprecated in Svelte 5. Always use \`new Tween()\` in new code.

## Spring — Physics-Based Animation

\`\`\`svelte
<script>
  import { Spring } from 'svelte/motion';

  const position = new Spring({ x: 0, y: 0 }, {
    stiffness: 0.15,  // 0–1: higher = snappier
    damping: 0.8      // 0–1: higher = less bouncy
  });

  function handleMouseMove(e) {
    position.target = { x: e.clientX, y: e.clientY };
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="scene" onmousemove={handleMouseMove}>
  <div class="dot" style="transform: translate({position.current.x}px, {position.current.y}px)"></div>
</div>
\`\`\`

Spring physics feel natural because they match how objects behave in the real world. The spring accelerates toward its target and naturally decelerates as it approaches. With low damping, it overshoots and oscillates before settling — that "snap" that makes UI feel alive.

### Tuning Spring Parameters

| stiffness | damping | Feel |
|---|---|---|
| 0.05 | 0.3 | Slow, very bouncy (like Jello) |
| 0.15 | 0.7 | Smooth, slightly bouncy (like elastic) |
| 0.3 | 0.9 | Snappy, barely bouncy (like a firm spring) |
| 0.8 | 1.0 | Near-instant, no overshoot (overdamped) |

## Tween.of() and Spring.of() — Derived Motion

Svelte 5 introduces \`Tween.of()\` and \`Spring.of()\` — methods that create motion values tied to a reactive expression. They are the motion equivalent of \`$derived\`:

\`\`\`svelte
<script>
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  let { score } = $props();

  // Automatically animates whenever score prop changes
  const animatedScore = Tween.of(() => score, { duration: 600, easing: cubicOut });
</script>

<h1>{Math.round(animatedScore.current)}</h1>
\`\`\`

When the \`score\` prop changes from 1200 to 1350, \`animatedScore.current\` smoothly counts from 1200 to 1350 over 600ms. No manual assignment needed.

## Respecting \`prefersReducedMotion\`

Always check for the user's reduced-motion preference. Svelte provides a reactive helper:

\`\`\`svelte
<script>
  import { Tween } from 'svelte/motion';
  import { prefersReducedMotion } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  let { value } = $props();

  const animated = Tween.of(
    () => value,
    {
      // Duration is 0 when user prefers reduced motion — instant switch
      duration: prefersReducedMotion.current ? 0 : 600,
      easing: cubicOut
    }
  );
</script>
\`\`\`

\`prefersReducedMotion\` is a reactive \`MediaQuery\` instance. Setting \`duration: 0\` effectively disables the animation while keeping your code clean — no \`{#if}\` branches needed.

## set() for One-Off Overrides

Both \`Spring\` and \`Tween\` have a \`set()\` method that lets you animate with different settings for a specific update:

\`\`\`ts
// Normally smooth, but this specific update should be instant
await tween.set(newValue, { duration: 0 });

// Animate from a specific position, not the current one
spring.set(newTarget, { preserveMomentum: 200 });
\`\`\`

\`set()\` returns a \`Promise\` that resolves when the animation completes — useful for sequencing animations.`
		},
		{
			type: 'checkpoint',
			content: 'cp-tween-counter'
		},
		{
			type: 'checkpoint',
			content: 'cp-spring-drag'
		},
		{
			type: 'xray-prompt',
			content: 'Open X-Ray and look at the Performance tab while animating. Notice that Spring and Tween drive their animations using `requestAnimationFrame` — they run off the main thread update cycle. They do not trigger Svelte\'s reactivity on every frame — only `tween.current` and `spring.current` are reactive, updated efficiently on each frame.'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  import { Tween, Spring } from 'svelte/motion';
  import { cubicOut, elasticOut } from 'svelte/easing';

  // Part 1: Animated score counter
  let score = $state(0);
  // TODO: Create a Tween for the score with duration: 800 and cubicOut easing
  // const animatedScore = new Tween(...)

  function addPoints() {
    score += Math.floor(Math.random() * 100) + 50;
    // TODO: Update animatedScore.target = score
  }

  // Part 2: Spring-based draggable
  // TODO: Create a Spring with { stiffness: 0.15, damping: 0.75 }
  // const pos = new Spring({ x: 200, y: 150 }, ...)

  let isDragging = $state(false);
  let offset = $state({ x: 0, y: 0 });
</script>

<div class="demo">
  <!-- Score Counter -->
  <div class="section">
    <h2>Animated Counter (Tween)</h2>
    <!-- TODO: Display animatedScore.current instead of score -->
    <div class="score">{score}</div>
    <button onclick={addPoints}>+ Add Points</button>
  </div>

  <!-- Spring Ball -->
  <div class="section">
    <h2>Spring Physics</h2>
    <div class="arena">
      <!-- TODO: Position the ball using pos.current.x and pos.current.y -->
      <div
        class="ball"
        style="transform: translate(200px, 50px)"
      ></div>
    </div>
    <p class="hint">Click inside the arena to move the ball</p>
  </div>
</div>

<style>
  .demo { max-width: 600px; margin: 0 auto; font-family: system-ui, sans-serif; padding: 2rem; display: flex; flex-direction: column; gap: 2rem; }
  .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; }
  h2 { margin: 0 0 1rem; font-size: 1rem; color: #64748b; }
  .score { font-size: 4rem; font-weight: 800; color: #6366f1; font-variant-numeric: tabular-nums; margin-bottom: 1rem; }
  button { padding: 0.5rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
  .arena { position: relative; width: 100%; height: 160px; background: #f1f5f9; border-radius: 8px; overflow: hidden; cursor: crosshair; }
  .ball { position: absolute; width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #818cf8, #6366f1); box-shadow: 0 4px 12px rgba(99,102,241,0.4); top: -20px; left: -20px; pointer-events: none; }
  .hint { font-size: 0.75rem; color: #94a3b8; margin: 0.5rem 0 0; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  import { Tween, Spring, prefersReducedMotion } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  // Part 1: Animated score counter
  let score = $state(0);
  const animatedScore = new Tween(0, {
    duration: prefersReducedMotion.current ? 0 : 800,
    easing: cubicOut
  });

  function addPoints() {
    score += Math.floor(Math.random() * 100) + 50;
    animatedScore.target = score;
  }

  // Part 2: Spring-based interactive ball
  const pos = new Spring({ x: 200, y: 75 }, {
    stiffness: 0.15,
    damping: 0.75
  });

  function handleArenaClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    pos.target = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
</script>

<div class="demo">
  <div class="section">
    <h2>Animated Counter (Tween)</h2>
    <div class="score">{Math.round(animatedScore.current).toLocaleString()}</div>
    <button onclick={addPoints}>+ Add Points</button>
  </div>

  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="section">
    <h2>Spring Physics — click to move</h2>
    <div class="arena" onclick={handleArenaClick}>
      <div
        class="ball"
        style="transform: translate({pos.current.x}px, {pos.current.y}px)"
      ></div>
    </div>
    <p class="hint">Click anywhere in the arena</p>
  </div>
</div>

<style>
  .demo { max-width: 600px; margin: 0 auto; font-family: system-ui, sans-serif; padding: 2rem; display: flex; flex-direction: column; gap: 2rem; }
  .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; }
  h2 { margin: 0 0 1rem; font-size: 1rem; color: #64748b; }
  .score { font-size: 4rem; font-weight: 800; color: #6366f1; font-variant-numeric: tabular-nums; margin-bottom: 1rem; }
  button { padding: 0.5rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
  .arena { position: relative; width: 100%; height: 160px; background: #f1f5f9; border-radius: 8px; overflow: hidden; cursor: crosshair; }
  .ball { position: absolute; width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #818cf8, #6366f1); box-shadow: 0 4px 12px rgba(99,102,241,0.4); top: -20px; left: -20px; pointer-events: none; }
  .hint { font-size: 0.75rem; color: #94a3b8; margin: 0.5rem 0 0; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-tween-counter',
			description: 'Create a Tween for the score and animate it when points are added',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'new Tween' },
						{ type: 'contains', value: 'animatedScore.target' },
						{ type: 'contains', value: 'animatedScore.current' }
					]
				}
			},
			hints: [
				'`new Tween(initialValue, { duration, easing })` — create the tween with the initial score of 0.',
				'In `addPoints()`, set `animatedScore.target = score` after updating `score`.',
				'In the template, display `Math.round(animatedScore.current)` — it\'s a reactive value that interpolates toward `target`.'
			],
			conceptsTested: ['svelte5.motion.tween']
		},
		{
			id: 'cp-spring-drag',
			description: 'Create a Spring and move the ball by clicking in the arena',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'new Spring' },
						{ type: 'contains', value: 'stiffness' },
						{ type: 'contains', value: 'pos.current' }
					]
				}
			},
			hints: [
				'`new Spring({ x, y }, { stiffness, damping })` — stiffness 0.1–0.3, damping 0.6–0.85 gives a natural feel.',
				'Update `pos.target = { x, y }` in the click handler using the arena\'s bounding rect to calculate relative coordinates.',
				'Position the ball with `transform: translate({pos.current.x}px, {pos.current.y}px)` — the offset accounts for the ball\'s center.'
			],
			conceptsTested: ['svelte5.motion.spring']
		}
	]
};
