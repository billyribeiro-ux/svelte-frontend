import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '16-2',
		title: 'Private Fields, Static & Inheritance',
		phase: 5,
		module: 16,
		lessonIndex: 2
	},
	description: `Building on reactive classes, this lesson explores advanced class features in Svelte 5. Private fields using the # prefix keep internal state encapsulated while exposing only the public API. Static methods and properties belong to the class itself rather than instances, making them ideal for factory methods and shared configuration.

Inheritance with extends and super lets you build hierarchies of reactive classes. A base Component class can provide shared reactive state (like visibility or loading status), and subclasses can extend it with specialised behaviour — all while maintaining Svelte's reactivity.`,
	objectives: [
		'Use private # fields to encapsulate reactive state within classes',
		'Create static factory methods and shared class configuration',
		'Extend reactive classes with inheritance using extends and super',
		'Expose controlled public APIs while keeping internals private'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Base class with reactive state
  class Counter {
    #count: number = $state(0);
    #step: number;
    readonly name: string;

    // Static factory method
    static create(name: string, step: number = 1): Counter {
      return new Counter(name, step);
    }

    // Static shared config
    static MAX_VALUE: number = 100;
    static MIN_VALUE: number = 0;

    constructor(name: string, step: number = 1) {
      this.name = name;
      this.#step = step;
    }

    // Public getters expose private state
    get count(): number { return this.#count; }
    get step(): number { return this.#step; }

    get isAtMax(): boolean { return this.#count >= Counter.MAX_VALUE; }
    get isAtMin(): boolean { return this.#count <= Counter.MIN_VALUE; }

    increment(): void {
      this.#count = Math.min(this.#count + this.#step, Counter.MAX_VALUE);
    }

    decrement(): void {
      this.#count = Math.max(this.#count - this.#step, Counter.MIN_VALUE);
    }

    reset(): void {
      this.#count = 0;
    }
  }

  // Inheritance: extend the base Counter
  class DoubleCounter extends Counter {
    #multiplier: number = $state(2);
    doubled: number = $derived(this.count * this.#multiplier);

    constructor(name: string) {
      super(name, 1);
    }

    get multiplier(): number { return this.#multiplier; }
    set multiplier(val: number) { this.#multiplier = val; }
  }

  // Another subclass with different behaviour
  class HistoryCounter extends Counter {
    history: number[] = $state([0]);

    constructor(name: string) {
      super(name, 1);
    }

    increment(): void {
      super.increment();
      this.history = [...this.history, this.count];
    }

    decrement(): void {
      super.decrement();
      this.history = [...this.history, this.count];
    }

    reset(): void {
      super.reset();
      this.history = [0];
    }
  }

  // Create instances using static factory
  const basic = Counter.create('Basic', 5);
  const double = new DoubleCounter('Double');
  const tracked = new HistoryCounter('Tracked');
</script>

<h1>Private Fields, Static & Inheritance</h1>

<section>
  <h2>Counter (Private #count, Static Factory)</h2>
  <div class="counter-card">
    <h3>{basic.name} (step: {basic.step})</h3>
    <div class="display">{basic.count}</div>
    <div class="range">
      <span>Min: {Counter.MIN_VALUE}</span>
      <span>Max: {Counter.MAX_VALUE}</span>
    </div>
    <div class="buttons">
      <button onclick={() => basic.decrement()} disabled={basic.isAtMin}>-{basic.step}</button>
      <button onclick={() => basic.reset()}>Reset</button>
      <button onclick={() => basic.increment()} disabled={basic.isAtMax}>+{basic.step}</button>
    </div>
  </div>
</section>

<section>
  <h2>DoubleCounter (extends Counter)</h2>
  <div class="counter-card">
    <h3>{double.name}</h3>
    <div class="display">{double.count}</div>
    <p class="derived">
      Doubled (x{double.multiplier}): <strong>{double.doubled}</strong>
    </p>
    <label class="multiplier-control">
      Multiplier:
      <input type="range" min="1" max="10"
        value={double.multiplier}
        oninput={(e) => double.multiplier = Number((e.target as HTMLInputElement).value)}
      />
      {double.multiplier}
    </label>
    <div class="buttons">
      <button onclick={() => double.decrement()}>-1</button>
      <button onclick={() => double.reset()}>Reset</button>
      <button onclick={() => double.increment()}>+1</button>
    </div>
  </div>
</section>

<section>
  <h2>HistoryCounter (extends Counter, tracks changes)</h2>
  <div class="counter-card">
    <h3>{tracked.name}</h3>
    <div class="display">{tracked.count}</div>
    <div class="history">
      {#each tracked.history as val, i}
        <span class="history-dot" class:current={i === tracked.history.length - 1}>
          {val}
        </span>
      {/each}
    </div>
    <div class="buttons">
      <button onclick={() => tracked.decrement()}>-1</button>
      <button onclick={() => tracked.reset()}>Reset</button>
      <button onclick={() => tracked.increment()}>+1</button>
    </div>
  </div>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.5rem; }
  h2 { color: #e17055; font-size: 1.1rem; }
  .counter-card {
    padding: 1.25rem; background: #f8f9fa; border-radius: 8px;
    border: 1px solid #dfe6e9; text-align: center;
  }
  .counter-card h3 { margin-top: 0; color: #2d3436; }
  .display {
    font-size: 3rem; font-weight: 700; color: #e17055;
    margin: 0.5rem 0;
  }
  .range {
    display: flex; justify-content: space-between;
    font-size: 0.75rem; color: #b2bec3; margin-bottom: 0.5rem;
  }
  .buttons { display: flex; justify-content: center; gap: 0.5rem; margin-top: 0.75rem; }
  button {
    padding: 0.5rem 1.25rem; border: none; border-radius: 4px;
    background: #e17055; color: white; cursor: pointer; font-weight: 600;
    font-size: 1rem;
  }
  button:hover { background: #d35d47; }
  button:disabled { background: #b2bec3; cursor: not-allowed; }
  .derived { margin: 0.5rem 0; color: #636e72; }
  .derived strong { color: #e17055; font-size: 1.2rem; }
  .multiplier-control {
    display: flex; align-items: center; gap: 0.5rem;
    justify-content: center; margin: 0.5rem 0; font-size: 0.9rem;
  }
  .history {
    display: flex; gap: 0.25rem; flex-wrap: wrap; justify-content: center;
    margin: 0.5rem 0;
  }
  .history-dot {
    display: inline-block; padding: 0.2rem 0.5rem;
    background: #dfe6e9; border-radius: 10px; font-size: 0.8rem;
  }
  .history-dot.current { background: #e17055; color: white; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
