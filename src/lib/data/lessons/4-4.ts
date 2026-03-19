import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '4-4',
		title: 'Callbacks & Communication',
		phase: 1,
		module: 4,
		lessonIndex: 4
	},
	description: `Components often need to tell their parent that something happened — a button was clicked, a form was submitted, a value changed. In Svelte 5, the pattern is simple: the parent passes a callback function as a prop, and the child calls it when the event occurs.

This lesson demonstrates child-to-parent communication using callback props, including a counter with reset and a rating component.`,
	objectives: [
		'Pass callback functions as props to child components',
		'Communicate from child to parent using callback invocation',
		'Build interactive components that notify parents of state changes'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  import Counter from './Counter.svelte';

  let totalClicks = $state(0);
  let lastAction = $state('None');
  let ratings = $state({ food: 0, service: 0, atmosphere: 0 });

  function handleIncrement(name, newValue) {
    totalClicks += 1;
    lastAction = \`\${name} incremented to \${newValue}\`;
  }

  function handleDecrement(name, newValue) {
    totalClicks += 1;
    lastAction = \`\${name} decremented to \${newValue}\`;
  }

  function handleReset(name) {
    lastAction = \`\${name} was reset\`;
  }

  function handleRate(category, value) {
    ratings[category] = value;
    lastAction = \`Rated \${category}: \${value} stars\`;
  }

  const averageRating = $derived(() => {
    const vals = Object.values(ratings);
    const sum = vals.reduce((a, b) => a + b, 0);
    return vals.length > 0 ? (sum / vals.length).toFixed(1) : '0.0';
  });
</script>

<h1>Callbacks & Communication</h1>

<section>
  <h2>Counters with Callback Props</h2>
  <div class="counters">
    <Counter
      name="Likes"
      onIncrement={handleIncrement}
      onDecrement={handleDecrement}
      onReset={handleReset}
    />
    <Counter
      name="Stars"
      initial={5}
      onIncrement={handleIncrement}
      onDecrement={handleDecrement}
      onReset={handleReset}
    />
    <Counter
      name="Hearts"
      initial={3}
      onIncrement={handleIncrement}
      onDecrement={handleDecrement}
      onReset={handleReset}
    />
  </div>
  <div class="status">
    <p>Total clicks across all counters: <strong>{totalClicks}</strong></p>
    <p>Last action: <strong>{lastAction}</strong></p>
  </div>
</section>

<section>
  <h2>Rating Component (via callbacks)</h2>
  {#each Object.keys(ratings) as category}
    <div class="rating-row">
      <span class="rating-label">{category}:</span>
      <div class="stars">
        {#each [1, 2, 3, 4, 5] as star}
          <button
            class="star"
            class:filled={ratings[category] >= star}
            onclick={() => handleRate(category, star)}
          >
            {ratings[category] >= star ? '★' : '☆'}
          </button>
        {/each}
      </div>
    </div>
  {/each}
  <p>Average: <strong>{averageRating()}</strong> / 5</p>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .counters { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
  .status { background: #f8f8f8; padding: 12px; border-radius: 6px; }
  .rating-row { display: flex; align-items: center; gap: 8px; margin: 4px 0; }
  .rating-label { min-width: 80px; text-transform: capitalize; color: #444; font-size: 14px; }
  .stars { display: flex; gap: 2px; }
  .star {
    background: none; border: none; font-size: 20px; cursor: pointer;
    color: #ddd; padding: 0 2px; transition: color 0.2s;
  }
  .star.filled { color: #ff3e00; }
  .star:hover { color: #ff6b3d; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Counter.svelte',
			content: `<script>
  let {
    name = 'Counter',
    initial = 0,
    onIncrement = () => {},
    onDecrement = () => {},
    onReset = () => {}
  } = $props();

  let count = $state(initial);

  function increment() {
    count += 1;
    onIncrement(name, count);
  }

  function decrement() {
    if (count > 0) {
      count -= 1;
      onDecrement(name, count);
    }
  }

  function reset() {
    count = initial;
    onReset(name);
  }
</script>

<div class="counter">
  <h3>{name}</h3>
  <span class="value">{count}</span>
  <div class="actions">
    <button onclick={decrement} disabled={count <= 0}>-</button>
    <button onclick={increment}>+</button>
    <button class="reset" onclick={reset}>Reset</button>
  </div>
</div>

<style>
  .counter {
    border: 2px solid #eee; border-radius: 8px; padding: 16px;
    text-align: center; min-width: 140px;
  }
  h3 { margin: 0 0 8px 0; color: #333; font-size: 14px; }
  .value { display: block; font-size: 32px; font-weight: bold; color: #ff3e00; margin: 8px 0; }
  .actions { display: flex; gap: 4px; justify-content: center; }
  button {
    padding: 4px 12px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 4px; cursor: pointer; font-size: 16px;
  }
  button:hover:not(:disabled) { background: #ff3e00; color: white; }
  button:disabled { opacity: 0.3; cursor: not-allowed; }
  .reset { font-size: 11px; border-color: #999; color: #999; }
  .reset:hover { background: #999; color: white; border-color: #999; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
