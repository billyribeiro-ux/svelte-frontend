import type { Lesson } from '$types/lesson';

export const easingFunctions: Lesson = {
	id: 'svelte-core.transitions.easing-functions',
	slug: 'easing-functions',
	title: 'Easing Functions — The 33 Curves of Motion',
	description:
		'Master all 33 easing functions from svelte/easing, understand the math behind them, learn which families suit which UI contexts, and build a visual easing playground to internalize the differences.',
	trackId: 'svelte-core',
	moduleId: 'transitions-and-animations',
	order: 8,
	estimatedMinutes: 25,
	concepts: ['svelte5.transitions.easing', 'svelte5.motion.easing'],
	prerequisites: ['svelte5.transitions.basics', 'svelte5.motion.tween'],

	content: [
		{
			type: 'text',
			content: `# Easing Functions — The 33 Curves of Motion

An easing function maps a linear progress value (0 → 1 over time) to a different output curve. Instead of moving at constant speed, your animation can start slow and accelerate, overshoot and snap back, or bounce like a rubber ball.

Svelte's \`svelte/easing\` module exports 33 easing functions, all callable:

\`\`\`ts
import { cubicOut, elasticOut, backInOut } from 'svelte/easing';

// An easing function takes a t value (0–1) and returns a modified value
cubicOut(0);    // → 0
cubicOut(0.5);  // → 0.875 (curves upward)
cubicOut(1);    // → 1
\`\`\`

## The Naming Convention

All 33 easings follow a systematic naming pattern:

**Base curve** × **Direction** = **Function**

| Base | In | Out | InOut |
|---|---|---|---|
| \`sine\`    | gentle start | gentle end | gentle both ends |
| \`quad\`    | t² | 1-(1-t)² | piecewise t² |
| \`cubic\`   | t³ | 1-(1-t)³ | piecewise t³ |
| \`quart\`   | t⁴ | — | — |
| \`quint\`   | t⁵ | — | — |
| \`expo\`    | 2^(10t-10) | fast then instant stop | — |
| \`circ\`    | circular arc | circular arc | — |
| \`back\`    | slight undershoot | slight overshoot | — |
| \`elastic\` | spring in | spring out | — |
| \`bounce\`  | bouncing in | bouncing out | — |
| \`linear\`  | — (no direction) | — | — |

**In** = slow at start, fast at end  
**Out** = fast at start, slow at end (most common for UI)  
**InOut** = slow at both ends, fast in the middle

## Understanding the Directions

This is the most important thing to internalize:

### \`Out\` (the UI default)
Objects in the real world decelerate — they start moving quickly and slow to a stop. This feels natural and is what you want for almost every UI transition:

\`\`\`ts
// Panel sliding in, dropdown appearing, page transition
transition:fly={{ y: 20, easing: cubicOut }}
\`\`\`

### \`In\`
Objects accelerate. Use this for **exits** — things leaving feel like they are being pulled away:

\`\`\`ts
// Notification dismissing, element being removed
out:fly={{ y: -20, easing: cubicIn, duration: 250 }}
\`\`\`

### \`InOut\`
Symmetric — slow, fast, slow. Good for **loops** and **reversible animations** (sliders, progress bars, tweens that go back and forth):

\`\`\`ts
const progress = new Tween(0, { easing: cubicInOut, duration: 1000 });
\`\`\`

## The Families

### The Power Curves — \`sine\`, \`quad\`, \`cubic\`, \`quart\`, \`quint\`, \`expo\`

These differ only in how *sharp* the curve is — how dramatic the difference between fast and slow:

\`\`\`
sineOut   < quadOut < cubicOut < quartOut < quintOut < expoOut
(gentlest)                                             (sharpest)
\`\`\`

**Practical guide:**
- **\`sineOut\`** — very gentle, almost imperceptible easing. Good for micro-interactions (button hover, icon nudge).
- **\`quadOut\`** — subtle, professional. A safe default when \`cubicOut\` feels too strong.
- **\`cubicOut\`** — the industry standard for UI. Fast enough to feel snappy, smooth enough to feel polished. 90% of your transitions should use this.
- **\`quartOut\` / \`quintOut\`** — dramatic deceleration. Good for hero animations, page headers, large elements.
- **\`expoOut\`** — almost instant start, very gradual stop. Creates an extremely snappy feel. Used in loading spinners, command palettes, and anywhere the animation should feel instantaneous but still show motion.

### The Overshoot Curves — \`backIn\`, \`backOut\`, \`backInOut\`

The element slightly overshoots its destination before settling. Creates a springy, playful feel.

\`\`\`ts
// Drawer sliding in with a slight overshoot
in:fly={{ x: -300, easing: backOut, duration: 500 }}

// Tooltip appearing with a small pop
in:scale={{ start: 0.8, easing: backOut, duration: 300 }}
\`\`\`

Use sparingly — great for modals, drawers, and interactive elements. Overuse makes an app feel chaotic.

### The Spring Curves — \`elasticIn\`, \`elasticOut\`, \`elasticInOut\`

Dramatic oscillation before/after settling. The element bounces multiple times.

\`\`\`ts
// A "you got points!" number flying in
in:fly={{ y: -40, easing: elasticOut, duration: 800 }}
\`\`\`

Use very sparingly for celebration moments and gamification. Never use for routine UI transitions — it will drive users mad.

### The Bounce Curves — \`bounceIn\`, \`bounceOut\`, \`bounceInOut\`

Multiple discrete bounces, like a ball hitting the floor. Even more dramatic than elastic.

\`\`\`ts
// Badge appearing with a bounce
in:scale={{ start: 0, easing: bounceOut, duration: 600 }}
\`\`\`

Use almost never, except for intentionally playful apps (games, children's interfaces, celebrations).

### \`circIn\` / \`circOut\` / \`circInOut\`

Based on a circular arc — fast start with a dramatic, abrupt-seeming stop (\`circOut\`), or very slow start accelerating to very fast (\`circIn\`). Less common but useful for rotating elements or radial UI.

## The Golden Rule of Easing Selection

> **Easing should reflect the physics of the real world, not arbitrary decoration.**

| Situation | Recommended |
|---|---|
| Things appearing | \`cubicOut\` — they decelerate into place |
| Things disappearing | \`cubicIn\` — they accelerate away |
| Interactive drag/spring | \`Spring\` from \`svelte/motion\` |
| Smooth value transitions | \`cubicInOut\` or \`expoOut\` |
| Playful bounce | \`backOut\` (subtle), \`elasticOut\` (dramatic) |
| Progress/loaders | \`linear\` or \`cubicInOut\` |
| Page transitions | \`expoOut\` or \`cubicOut\` |

## Custom Easing Functions

Any function \`(t: number) => number\` is a valid easing function. This lets you define curves like \`cubicBezier\`:

\`\`\`ts
// Approximate a CSS cubic-bezier(0.34, 1.56, 0.64, 1) — "spring"
function springEase(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

// Use it like any built-in
transition:fly={{ y: 30, easing: springEase, duration: 600 }}
\`\`\``
		},
		{
			type: 'checkpoint',
			content: 'cp-easing-choose'
		},
		{
			type: 'checkpoint',
			content: 'cp-easing-playground'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  import {
    linear,
    sineIn, sineOut, sineInOut,
    quadIn, quadOut, quadInOut,
    cubicIn, cubicOut, cubicInOut,
    quartIn, quartOut, quartInOut,
    quintIn, quintOut, quintInOut,
    expoIn, expoOut, expoInOut,
    circIn, circOut, circInOut,
    backIn, backOut, backInOut,
    elasticIn, elasticOut, elasticInOut,
    bounceIn, bounceOut, bounceInOut,
  } from 'svelte/easing';
  import { Tween } from 'svelte/motion';
  import { fly } from 'svelte/transition';

  const easings = {
    linear,
    'sine / Out': sineOut, 'sine / In': sineIn, 'sine / InOut': sineInOut,
    'quad / Out': quadOut, 'quad / In': quadIn, 'quad / InOut': quadInOut,
    'cubic / Out': cubicOut, 'cubic / In': cubicIn, 'cubic / InOut': cubicInOut,
    'quart / Out': quartOut, 'quart / In': quartIn, 'quart / InOut': quartInOut,
    'quint / Out': quintOut, 'quint / In': quintIn, 'quint / InOut': quintInOut,
    'expo / Out': expoOut, 'expo / In': expoIn, 'expo / InOut': expoInOut,
    'circ / Out': circOut, 'circ / In': circIn, 'circ / InOut': circInOut,
    'back / Out': backOut, 'back / In': backIn, 'back / InOut': backInOut,
    'elastic / Out': elasticOut, 'elastic / In': elasticIn, 'elastic / InOut': elasticInOut,
    'bounce / Out': bounceOut, 'bounce / In': bounceIn, 'bounce / InOut': bounceInOut,
  };

  let selectedName = $state('cubic / Out');
  let selectedFn = $derived(easings[selectedName]);
  let key = $state(0);

  // TODO: Create a Tween for x position (0 → 100%)
  // When selectedName changes, reset and re-run the tween
  // Hint: use $effect + tween.set(0, { duration: 0 }) then tween.target = 100
  const tween = new Tween(0, { duration: 800, easing: cubicOut });

  $effect(() => {
    // Re-run tween whenever selection changes
    // TODO: reset tween to 0 immediately, then animate to 100 with the selectedFn
  });

  // Draw the easing curve using 100 sample points
  const curvePoints = $derived.by(() => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const v = selectedFn(t);
      points.push(\`\${i},\${100 - v * 100}\`);
    }
    return points.join(' ');
  });
</script>

<div class="playground">
  <div class="left">
    <h2>Pick an Easing</h2>
    <div class="list">
      {#each Object.keys(easings) as name}
        <button
          class:active={name === selectedName}
          onclick={() => { selectedName = name; key++; }}
        >
          {name}
        </button>
      {/each}
    </div>
  </div>

  <div class="right">
    <!-- Curve visualiser -->
    <svg class="curve-vis" viewBox="0 0 100 100" preserveAspectRatio="none">
      <line x1="0" y1="100" x2="100" y2="0" stroke="#e2e8f0" stroke-width="0.5" />
      <polyline points={curvePoints} fill="none" stroke="#6366f1" stroke-width="2" />
    </svg>

    <!-- Live preview ball -->
    <div class="preview">
      <div class="track">
        <div class="ball" style="left: {tween.current}%"></div>
      </div>
    </div>

    <!-- Flying text demo -->
    {#key key}
      <div class="fly-text" in:fly={{ y: 30, duration: 800, easing: selectedFn, opacity: 0 }}>
        <span>{selectedName}</span>
      </div>
    {/key}
  </div>
</div>

<style>
  .playground { display: grid; grid-template-columns: 220px 1fr; gap: 1.5rem; max-width: 800px; margin: 1rem auto; font-family: system-ui, sans-serif; }
  .left h2 { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin: 0 0 0.75rem; }
  .list { display: flex; flex-direction: column; gap: 2px; max-height: 500px; overflow-y: auto; }
  .list button { padding: 0.3rem 0.6rem; border: none; background: transparent; text-align: left; cursor: pointer; font-size: 0.8rem; border-radius: 4px; color: #64748b; }
  .list button.active { background: #6366f1; color: white; }
  .right { display: flex; flex-direction: column; gap: 1rem; }
  .curve-vis { width: 100%; height: 160px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
  .preview { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }
  .track { position: relative; height: 32px; }
  .ball { position: absolute; width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); top: 0; margin-left: -16px; transition: none; }
  .fly-text { min-height: 60px; display: flex; align-items: center; justify-content: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
  .fly-text span { font-size: 1.25rem; font-weight: 700; color: #6366f1; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  import {
    linear,
    sineIn, sineOut, sineInOut,
    quadIn, quadOut, quadInOut,
    cubicIn, cubicOut, cubicInOut,
    quartIn, quartOut, quartInOut,
    quintIn, quintOut, quintInOut,
    expoIn, expoOut, expoInOut,
    circIn, circOut, circInOut,
    backIn, backOut, backInOut,
    elasticIn, elasticOut, elasticInOut,
    bounceIn, bounceOut, bounceInOut,
  } from 'svelte/easing';
  import { Tween } from 'svelte/motion';
  import { fly } from 'svelte/transition';

  const easings = {
    linear,
    'sine / Out': sineOut, 'sine / In': sineIn, 'sine / InOut': sineInOut,
    'quad / Out': quadOut, 'quad / In': quadIn, 'quad / InOut': quadInOut,
    'cubic / Out': cubicOut, 'cubic / In': cubicIn, 'cubic / InOut': cubicInOut,
    'quart / Out': quartOut, 'quart / In': quartIn, 'quart / InOut': quartInOut,
    'quint / Out': quintOut, 'quint / In': quintIn, 'quint / InOut': quintInOut,
    'expo / Out': expoOut, 'expo / In': expoIn, 'expo / InOut': expoInOut,
    'circ / Out': circOut, 'circ / In': circIn, 'circ / InOut': circInOut,
    'back / Out': backOut, 'back / In': backIn, 'back / InOut': backInOut,
    'elastic / Out': elasticOut, 'elastic / In': elasticIn, 'elastic / InOut': elasticInOut,
    'bounce / Out': bounceOut, 'bounce / In': bounceIn, 'bounce / InOut': bounceInOut,
  };

  let selectedName = $state('cubic / Out');
  let selectedFn = $derived(easings[selectedName]);
  let key = $state(0);

  const tween = new Tween(0, { duration: 800, easing: cubicOut });

  $effect(() => {
    // Depend on selectedFn to re-run when easing changes
    const fn = selectedFn;
    tween.set(0, { duration: 0 }).then(() => {
      tween.set(100, { duration: 800, easing: fn });
    });
  });

  const curvePoints = $derived.by(() => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const v = selectedFn(t);
      points.push(\`\${i},\${100 - v * 100}\`);
    }
    return points.join(' ');
  });
</script>

<div class="playground">
  <div class="left">
    <h2>Pick an Easing</h2>
    <div class="list">
      {#each Object.keys(easings) as name}
        <button
          class:active={name === selectedName}
          onclick={() => { selectedName = name; key++; }}
        >
          {name}
        </button>
      {/each}
    </div>
  </div>

  <div class="right">
    <svg class="curve-vis" viewBox="0 0 100 100" preserveAspectRatio="none">
      <line x1="0" y1="100" x2="100" y2="0" stroke="#e2e8f0" stroke-width="0.5" />
      <polyline points={curvePoints} fill="none" stroke="#6366f1" stroke-width="2" />
    </svg>

    <div class="preview">
      <div class="track">
        <div class="ball" style="left: calc({tween.current}% - 16px)"></div>
      </div>
    </div>

    {#key key}
      <div class="fly-text" in:fly={{ y: 30, duration: 800, easing: selectedFn, opacity: 0 }}>
        <span>{selectedName}</span>
      </div>
    {/key}
  </div>
</div>

<style>
  .playground { display: grid; grid-template-columns: 220px 1fr; gap: 1.5rem; max-width: 800px; margin: 1rem auto; font-family: system-ui, sans-serif; }
  .left h2 { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin: 0 0 0.75rem; }
  .list { display: flex; flex-direction: column; gap: 2px; max-height: 500px; overflow-y: auto; }
  .list button { padding: 0.3rem 0.6rem; border: none; background: transparent; text-align: left; cursor: pointer; font-size: 0.8rem; border-radius: 4px; color: #64748b; }
  .list button.active { background: #6366f1; color: white; }
  .right { display: flex; flex-direction: column; gap: 1rem; }
  .curve-vis { width: 100%; height: 160px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
  .preview { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; }
  .track { position: relative; height: 32px; }
  .ball { position: absolute; width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); top: 0; }
  .fly-text { min-height: 60px; display: flex; align-items: center; justify-content: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
  .fly-text span { font-size: 1.25rem; font-weight: 700; color: #6366f1; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-easing-choose',
			description: 'Correctly match easing functions to UI contexts',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'cubicOut' }
					]
				}
			},
			hints: [
				'For elements entering the screen, use an Out easing — things decelerate into place.',
				'`cubicOut` is the universal default for UI transitions. When in doubt, use it.',
				'`backOut` adds a slight overshoot/spring feel — great for modals and drawers but use sparingly.'
			],
			conceptsTested: ['svelte5.transitions.easing']
		},
		{
			id: 'cp-easing-playground',
			description: 'Wire the Tween to re-animate with the selected easing function',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'new Tween' },
						{ type: 'contains', value: 'selectedFn' },
						{ type: 'contains', value: 'tween.set' }
					]
				}
			},
			hints: [
				'Reset the tween instantly: `tween.set(0, { duration: 0 })` returns a Promise — await it before re-animating.',
				'Then animate: `tween.set(100, { duration: 800, easing: selectedFn })`.',
				'Put this in a `$effect` that depends on `selectedFn` — it re-runs whenever the selection changes.'
			],
			conceptsTested: ['svelte5.motion.tween', 'svelte5.transitions.easing']
		}
	]
};
