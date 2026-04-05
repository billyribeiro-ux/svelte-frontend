import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '4-4',
		title: 'Callbacks & Communication',
		phase: 1,
		module: 4,
		lessonIndex: 4
	},
	description: `Components don't exist in isolation. A counter component needs to tell its parent when the count changed. A rating widget needs to report the new score. A form field needs to notify a form container that its value updated. This kind of child-to-parent communication is one of the most common patterns in any component-based app — and in Svelte 5, the solution is wonderfully simple: **callback props**.

The pattern has three steps. First, the parent defines a function: \`function handleIncrement(name, value) { ... }\`. Second, the parent passes that function to the child as a prop: \`<Counter onIncrement={handleIncrement} />\`. Third, the child calls the function at the right moment: \`onIncrement(name, count)\`. That's it. No events, no dispatchers, no special API. The child invoking a function it received happens to run that function in the parent's scope, updating the parent's state. This is closures doing exactly what closures do.

(A historical note: Svelte 4 used \`createEventDispatcher\` and \`<Component on:event={...}>\`. That pattern still exists for backward compatibility but is considered legacy. Svelte 5's idiomatic approach is plain function props with an \`on\`-prefixed name by convention — \`onIncrement\`, \`onSubmit\`, \`onChange\`. The new pattern is simpler, type-checks cleanly in TypeScript, and aligns with React-ish habits without any of the syntactic baggage.)

There are two common *flavors* of this pattern. In the first, the child owns its own state and just notifies the parent when it changes — our Counter works this way, with its own internal \`count\` that it reports via callbacks. In the second, called **lifted state**, the parent owns the value entirely and passes it down as a prop; the child is purely presentational and the callback is how it asks the parent to update — our Rating component works this way. Lifted state is what you want when multiple components need to share the same value, or when the parent wants full control.

One Svelte 5 gotcha worth mentioning: inside a child, don't initialize \`$state\` directly from a prop without thinking — if the parent updates the prop later, the state won't re-read it. If you want a one-time snapshot, use \`untrack(() => prop)\`. If you want to follow the parent, use \`$derived\` or just read the prop directly.

Pitfalls: creating new function references inline on every render (usually fine, but can break memoization optimizations in large apps), forgetting default values on callback props (the child crashes if a parent doesn't pass one), and trying to mutate a prop directly instead of calling back to ask the parent to change it.`,
	objectives: [
		'Pass callback functions from parent to child as props',
		'Invoke callbacks in the child to notify the parent of state changes',
		'Use the onEventName naming convention for callback props',
		'Provide default callback values so children work without required props',
		'Distinguish child-owned state (Counter) from lifted state (Rating)',
		'Capture initial prop values with untrack for one-time snapshots'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === CALLBACKS & PARENT-CHILD COMMUNICATION ===
  // A component often needs to tell its parent that something happened:
  //   "user clicked me", "value changed", "form submitted".
  //
  // The Svelte 5 pattern is wonderfully simple:
  //   1. Parent passes a function as a prop.
  //   2. Child calls that function when the event occurs.
  //   3. The function runs in the parent's scope, updating parent state.
  //
  // This is called a "callback prop" and it replaces the older
  // createEventDispatcher pattern from Svelte 4.

  import Counter from './Counter.svelte';
  import Rating from './Rating.svelte';

  let totalClicks = $state(0);
  let lastAction  = $state('None yet');
  let logEntries  = $state([]);

  function log(msg) {
    logEntries = [\\\`\\\${new Date().toLocaleTimeString()} — \\\${msg}\\\`, ...logEntries].slice(0, 10);
  }

  // Callback handlers for Counter children
  function handleIncrement(name, newValue) {
    totalClicks += 1;
    lastAction = \\\`\\\${name} → \\\${newValue}\\\`;
    log(\\\`\\\${name} incremented to \\\${newValue}\\\`);
  }
  function handleDecrement(name, newValue) {
    totalClicks += 1;
    lastAction = \\\`\\\${name} → \\\${newValue}\\\`;
    log(\\\`\\\${name} decremented to \\\${newValue}\\\`);
  }
  function handleReset(name) {
    lastAction = \\\`\\\${name} reset\\\`;
    log(\\\`\\\${name} reset to 0\\\`);
  }

  // Callback handlers for Rating children — classic "lift state up"
  // scenario: the rating value lives in the parent, not the child.
  let ratings = $state({ food: 0, service: 0, atmosphere: 0 });
  function handleRate(category, value) {
    ratings[category] = value;
    log(\\\`Rated \\\${category}: \\\${value}/5\\\`);
  }

  const averageRating = $derived.by(() => {
    const vals = Object.values(ratings);
    const sum = vals.reduce((a, b) => a + b, 0);
    return vals.length > 0 ? (sum / vals.length).toFixed(1) : '0.0';
  });
</script>

<h1>Callbacks & Communication</h1>

<section>
  <h2>1. Counter Children with Callback Props</h2>
  <p class="hint">Each counter owns its own count. Callbacks notify the parent on every change.</p>
  <div class="counters">
    <Counter name="Likes"   initial={0} onIncrement={handleIncrement} onDecrement={handleDecrement} onReset={handleReset} />
    <Counter name="Stars"   initial={5} onIncrement={handleIncrement} onDecrement={handleDecrement} onReset={handleReset} />
    <Counter name="Hearts"  initial={3} onIncrement={handleIncrement} onDecrement={handleDecrement} onReset={handleReset} />
  </div>
  <div class="status">
    <p>Total clicks across all counters: <strong>{totalClicks}</strong></p>
    <p>Last action: <strong>{lastAction}</strong></p>
  </div>
</section>

<section>
  <h2>2. Rating Children — Lifted State</h2>
  <p class="hint">Here the parent owns the value and passes it DOWN. The child calls onRate UP when clicked.</p>
  {#each Object.keys(ratings) as category (category)}
    <Rating
      {category}
      value={ratings[category]}
      onRate={(v) => handleRate(category, v)}
    />
  {/each}
  <p>Average: <strong>{averageRating} / 5</strong></p>
</section>

<section>
  <h2>3. Event Log</h2>
  <div class="event-log">
    {#each logEntries as entry, i (i)}
      <div class="log-entry">{entry}</div>
    {:else}
      <div class="log-entry empty">Interact with the counters or ratings above...</div>
    {/each}
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; font-family: sans-serif; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  .hint { color: #999; font-size: 12px; font-style: italic; }
  strong { color: #222; }
  .counters { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
  .status { background: #f8f8f8; padding: 12px; border-radius: 6px; }
  .event-log { background: #1e1e1e; border-radius: 6px; padding: 8px; max-height: 160px; overflow-y: auto; font-family: monospace; }
  .log-entry { color: #d4d4d4; font-size: 12px; padding: 2px 8px; }
  .log-entry.empty { color: #666; font-style: italic; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Counter.svelte',
			content: `<script>
  // === Counter.svelte ===
  // A self-contained counter that owns its own state but notifies its
  // parent of every change via callback props.
  import { untrack } from 'svelte';

  let {
    name = 'Counter',
    initial = 0,
    min = 0,
    max = 99,
    onIncrement = () => {},
    onDecrement = () => {},
    onReset = () => {}
  } = $props();

  // Capture the prop's initial value once (without creating a reactive
  // dependency) so reset() can always return to where we started.
  const startValue = untrack(() => initial);
  let count = $state(startValue);

  function increment() {
    if (count >= max) return;
    count += 1;
    onIncrement(name, count);
  }
  function decrement() {
    if (count <= min) return;
    count -= 1;
    onDecrement(name, count);
  }
  function reset() {
    count = startValue;
    onReset(name);
  }
</script>

<div class="counter">
  <h3>{name}</h3>
  <span class="value">{count}</span>
  <div class="actions">
    <button onclick={decrement} disabled={count <= min} aria-label="Decrement">−</button>
    <button onclick={increment} disabled={count >= max} aria-label="Increment">+</button>
  </div>
  <button class="reset" onclick={reset}>Reset</button>
</div>

<style>
  .counter {
    border: 2px solid #eee; border-radius: 8px; padding: 14px;
    text-align: center; min-width: 130px; font-family: sans-serif;
  }
  h3 { margin: 0 0 6px 0; color: #333; font-size: 13px; text-transform: uppercase; }
  .value { display: block; font-size: 34px; font-weight: bold; color: #ff3e00; margin: 4px 0; font-family: monospace; }
  .actions { display: flex; gap: 4px; justify-content: center; margin-bottom: 6px; }
  button {
    padding: 4px 12px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 4px; cursor: pointer; font-size: 16px;
    font-family: inherit;
  }
  button:hover:not(:disabled) { background: #ff3e00; color: white; }
  button:disabled { opacity: 0.3; cursor: not-allowed; }
  .reset { font-size: 11px; border-color: #999; color: #999; padding: 2px 10px; }
  .reset:hover { background: #999; color: white; border-color: #999; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Rating.svelte',
			content: `<script>
  // === Rating.svelte ===
  // This is the "lifted state" flavor of callback props: the parent
  // owns the value and passes it DOWN; the child reports clicks UP
  // via the onRate callback. The child has no local state at all.

  let {
    category,
    value = 0,
    max = 5,
    onRate = () => {}
  } = $props();

  // Derived from the prop so it stays in sync if \\\`max\\\` ever changes.
  const stars = $derived(Array.from({ length: max }, (_, i) => i + 1));
</script>

<div class="row">
  <span class="label">{category}:</span>
  <div class="stars">
    {#each stars as star (star)}
      <button
        type="button"
        class="star"
        class:filled={value >= star}
        onclick={() => onRate(star)}
        aria-label="Rate {star} out of {max}"
      >
        {value >= star ? '★' : '☆'}
      </button>
    {/each}
  </div>
</div>

<style>
  .row { display: flex; align-items: center; gap: 8px; margin: 4px 0; font-family: sans-serif; }
  .label { min-width: 90px; text-transform: capitalize; color: #444; font-size: 14px; }
  .stars { display: flex; gap: 2px; }
  .star {
    background: none; border: none; font-size: 22px; cursor: pointer;
    color: #ddd; padding: 0 2px; transition: color 0.2s; line-height: 1;
  }
  .star.filled { color: #ff3e00; }
  .star:hover { color: #ff6b3d; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
