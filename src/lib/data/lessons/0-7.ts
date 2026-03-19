import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-7',
		title: 'let vs const',
		phase: 1,
		module: 0,
		lessonIndex: 7
	},
	description: `In JavaScript, you declare variables with let or const. The key difference: let allows reassignment while const does not. In Svelte 5, $state() creates reactive variables that must use let (because their values change), while fixed values like labels or configuration should use const.

This lesson clarifies when to use each keyword and the difference between reassignment and mutation — a concept that trips up many beginners.`,
	objectives: [
		'Know when to use let vs const for variable declarations',
		'Understand that $state requires let because reactive values change',
		'Distinguish between mutation (changing contents) and reassignment (changing the binding)'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // const — fixed values that never get reassigned
  const APP_TITLE = 'My Svelte App';
  const MAX_COUNT = 10;
  const COLORS = ['#ff3e00', '#4ec9b0', '#569cd6'];

  // let + $state — reactive values that change over time
  let count = $state(0);
  let message = $state('Click the button!');
  let colorIndex = $state(0);

  // $derived uses const because you never reassign it — Svelte recalculates it
  const currentColor = $derived(COLORS[colorIndex % COLORS.length]);
  const isAtMax = $derived(count >= MAX_COUNT);

  function increment() {
    if (count < MAX_COUNT) {
      count += 1;
      message = \`Count is now \${count}\`;
    } else {
      message = \`Maximum of \${MAX_COUNT} reached!\`;
    }
  }

  function reset() {
    count = 0;
    message = 'Counter reset!';
  }

  function cycleColor() {
    colorIndex += 1;
  }

  // Mutation vs reassignment demo
  // const arrays can be MUTATED (contents changed) but not REASSIGNED
  const tags = ['svelte', 'javascript'];
  // tags = ['new'] would ERROR — can't reassign const
  // tags.push('new') works — mutating contents is fine
</script>

<h1>{APP_TITLE}</h1>

<section>
  <h2>const: Fixed Values</h2>
  <p>APP_TITLE = "{APP_TITLE}" — never changes</p>
  <p>MAX_COUNT = {MAX_COUNT} — a fixed limit</p>
  <p>COLORS has {COLORS.length} items — the array reference is fixed</p>
</section>

<section>
  <h2>let + $state: Reactive Values</h2>
  <p style="color: {currentColor}; font-size: 24px; font-weight: bold;">{count}</p>
  <p>{message}</p>
  <div class="buttons">
    <button onclick={increment} disabled={isAtMax}>
      {isAtMax ? 'Max reached' : 'Increment'}
    </button>
    <button onclick={reset}>Reset</button>
    <button onclick={cycleColor}>Cycle Color</button>
  </div>
</section>

<section>
  <h2>The Rule</h2>
  <ul>
    <li><code>const</code> — value is fixed: labels, config, derived values</li>
    <li><code>let</code> — value changes: $state, loop counters, reassigned vars</li>
    <li>Never use <code>var</code> — it's the old way with confusing scoping</li>
  </ul>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  ul { color: #444; font-size: 14px; padding-left: 20px; }
  li { margin: 4px 0; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
  .buttons { display: flex; gap: 8px; margin: 8px 0; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover:not(:disabled) { background: #ff3e00; color: white; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
