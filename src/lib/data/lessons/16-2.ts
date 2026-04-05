import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '16-2',
		title: 'Private Fields, Static & Inheritance',
		phase: 5,
		module: 16,
		lessonIndex: 2
	},
	description: `Building on reactive classes, this lesson explores advanced class features in Svelte 5. Private fields using the # prefix keep internal state encapsulated while exposing only the public API through getters and methods. Static methods and properties belong to the class itself rather than instances, making them ideal for factory methods, shared configuration, and class-level caches.

Inheritance with extends and super lets you build hierarchies of reactive classes. A base class can provide shared reactive state and subclasses can extend it with specialised behaviour — all while maintaining Svelte's reactivity. However, in practice, composition (a class holding another class as a field) is often cleaner than deep inheritance chains. This lesson shows both patterns so you can pick the right tool.`,
	objectives: [
		'Use private # fields to encapsulate reactive state within classes',
		'Expose controlled public APIs with getters and setters',
		'Create static factory methods, constants, and class-level caches',
		'Extend reactive classes with inheritance using extends and super',
		'Compare inheritance with composition for reactive class design'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // Base class: private reactive state + static factory/config
  // ============================================================
  class Counter {
    // # prefix = truly private (enforced by JS runtime)
    // $state works on private fields just like public ones
    #count: number = $state(0);
    #step: number;
    readonly name: string;

    // Static constants — shared across all instances
    static readonly MAX_VALUE: number = 100;
    static readonly MIN_VALUE: number = 0;

    // Static cache of instances by name (registry pattern)
    static #registry: Map<string, Counter> = new Map();

    // Static factory — returns existing or creates new
    static create(name: string, step: number = 1): Counter {
      const existing = Counter.#registry.get(name);
      if (existing) return existing;
      const c = new Counter(name, step);
      Counter.#registry.set(name, c);
      return c;
    }

    static all(): Counter[] {
      return Array.from(Counter.#registry.values());
    }

    static reset(): void {
      for (const c of Counter.#registry.values()) c.reset();
    }

    constructor(name: string, step: number = 1) {
      this.name = name;
      this.#step = step;
    }

    // Getters expose private state — reads are still reactive
    get count(): number {
      return this.#count;
    }
    get step(): number {
      return this.#step;
    }
    get isAtMax(): boolean {
      return this.#count >= Counter.MAX_VALUE;
    }
    get isAtMin(): boolean {
      return this.#count <= Counter.MIN_VALUE;
    }

    // Controlled setter for step with validation
    set step(val: number) {
      if (val > 0 && val <= 20) this.#step = val;
    }

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

  // ============================================================
  // Inheritance: extend Counter with computed behaviour
  // ============================================================
  class DoubleCounter extends Counter {
    #multiplier: number = $state(2);
    // $derived can reference \`this\` including inherited getters
    doubled: number = $derived(this.count * this.#multiplier);

    constructor(name: string) {
      super(name, 1);
    }

    get multiplier(): number {
      return this.#multiplier;
    }
    set multiplier(val: number) {
      this.#multiplier = Math.max(1, Math.min(10, val));
    }
  }

  // ============================================================
  // Inheritance with method override + super call
  // ============================================================
  class HistoryCounter extends Counter {
    history: number[] = $state([0]);

    constructor(name: string) {
      super(name, 1);
    }

    // Override: call super then record
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

    undo(): void {
      if (this.history.length > 1) {
        this.history = this.history.slice(0, -1);
        // Can't set #count directly from subclass — use public API
        // by reconstructing. Instead we store previous and reapply:
        const prev = this.history[this.history.length - 1];
        const delta = prev - this.count;
        if (delta > 0) {
          for (let i = 0; i < delta; i++) super.increment();
        } else {
          for (let i = 0; i < -delta; i++) super.decrement();
        }
      }
    }
  }

  // ============================================================
  // Composition instead of inheritance
  // Often cleaner than deep extends chains.
  // ============================================================
  class Timer {
    #seconds: number = $state(0);
    #running: boolean = $state(false);
    #intervalId: ReturnType<typeof setInterval> | null = null;

    get seconds(): number {
      return this.#seconds;
    }
    get running(): boolean {
      return this.#running;
    }
    get formatted(): string {
      const m = Math.floor(this.#seconds / 60);
      const s = this.#seconds % 60;
      return \`\${String(m).padStart(2, '0')}:\${String(s).padStart(2, '0')}\`;
    }

    start(): void {
      if (this.#running) return;
      this.#running = true;
      this.#intervalId = setInterval(() => (this.#seconds += 1), 1000);
    }

    stop(): void {
      this.#running = false;
      if (this.#intervalId) {
        clearInterval(this.#intervalId);
        this.#intervalId = null;
      }
    }

    reset(): void {
      this.stop();
      this.#seconds = 0;
    }
  }

  // StopwatchLap uses composition — it has-a Timer instead of is-a
  class StopwatchLap {
    #timer = new Timer();
    laps: number[] = $state([]);

    get timer(): Timer {
      return this.#timer;
    }

    lap(): void {
      if (this.#timer.running) {
        this.laps = [...this.laps, this.#timer.seconds];
      }
    }

    reset(): void {
      this.#timer.reset();
      this.laps = [];
    }
  }

  // ============================================================
  // Instantiate — mix of factory, new, and composition
  // ============================================================
  const basic = Counter.create('Basic', 5);
  const double = new DoubleCounter('Double');
  const tracked = new HistoryCounter('Tracked');
  const stopwatch = new StopwatchLap();

  $effect(() => {
    return () => stopwatch.timer.stop();
  });
</script>

<h1>Private Fields, Static &amp; Inheritance</h1>

<section>
  <h2>Counter — private #count, static factory &amp; registry</h2>
  <div class="counter-card">
    <h3>{basic.name} (step: {basic.step})</h3>
    <div class="display">{basic.count}</div>
    <div class="range">
      <span>Min: {Counter.MIN_VALUE}</span>
      <span>Max: {Counter.MAX_VALUE}</span>
    </div>
    <label class="step-control">
      Step:
      <input
        type="number"
        min="1"
        max="20"
        value={basic.step}
        oninput={(e) => (basic.step = Number((e.target as HTMLInputElement).value))}
      />
    </label>
    <div class="buttons">
      <button onclick={() => basic.decrement()} disabled={basic.isAtMin}>
        -{basic.step}
      </button>
      <button onclick={() => basic.reset()}>Reset</button>
      <button onclick={() => basic.increment()} disabled={basic.isAtMax}>
        +{basic.step}
      </button>
    </div>
  </div>
  <p class="static-info">
    Counter.all() tracks {Counter.all().length} registered instance(s).
    <button class="small" onclick={() => Counter.reset()}>Reset ALL</button>
  </p>
</section>

<section>
  <h2>DoubleCounter extends Counter</h2>
  <div class="counter-card alt">
    <h3>{double.name}</h3>
    <div class="display">{double.count}</div>
    <p class="derived">
      Doubled (x{double.multiplier}): <strong>{double.doubled}</strong>
    </p>
    <label class="multiplier-control">
      Multiplier:
      <input
        type="range"
        min="1"
        max="10"
        value={double.multiplier}
        oninput={(e) => (double.multiplier = Number((e.target as HTMLInputElement).value))}
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
  <h2>HistoryCounter — override increment/decrement with super</h2>
  <div class="counter-card alt2">
    <h3>{tracked.name}</h3>
    <div class="display">{tracked.count}</div>
    <div class="history">
      {#each tracked.history as val, i (i)}
        <span class="history-dot" class:current={i === tracked.history.length - 1}>
          {val}
        </span>
      {/each}
    </div>
    <div class="buttons">
      <button onclick={() => tracked.decrement()}>-1</button>
      <button onclick={() => tracked.reset()}>Reset</button>
      <button onclick={() => tracked.undo()} disabled={tracked.history.length <= 1}>
        Undo
      </button>
      <button onclick={() => tracked.increment()}>+1</button>
    </div>
  </div>
</section>

<section>
  <h2>Composition — StopwatchLap has-a Timer</h2>
  <div class="counter-card alt3">
    <div class="display">{stopwatch.timer.formatted}</div>
    <div class="buttons">
      {#if !stopwatch.timer.running}
        <button onclick={() => stopwatch.timer.start()}>Start</button>
      {:else}
        <button onclick={() => stopwatch.timer.stop()}>Stop</button>
      {/if}
      <button onclick={() => stopwatch.lap()} disabled={!stopwatch.timer.running}>
        Lap
      </button>
      <button onclick={() => stopwatch.reset()}>Reset</button>
    </div>
    {#if stopwatch.laps.length > 0}
      <ol class="laps">
        {#each stopwatch.laps as sec, i (i)}
          <li>Lap {i + 1}: {sec}s</li>
        {/each}
      </ol>
    {/if}
  </div>
  <p class="note">
    Composition avoids deep inheritance chains. StopwatchLap holds a Timer
    in a private field and forwards only the API it wants to expose.
  </p>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.5rem; }
  h2 { color: #e17055; font-size: 1.1rem; }
  .counter-card {
    padding: 1.25rem; background: #f8f9fa; border-radius: 8px;
    border: 1px solid #dfe6e9; text-align: center;
  }
  .counter-card.alt { border-left: 4px solid #0984e3; }
  .counter-card.alt2 { border-left: 4px solid #6c5ce7; }
  .counter-card.alt3 { border-left: 4px solid #00b894; }
  .counter-card h3 { margin-top: 0; color: #2d3436; }
  .display {
    font-size: 3rem; font-weight: 700; color: #e17055;
    margin: 0.5rem 0; font-family: monospace;
  }
  .counter-card.alt .display { color: #0984e3; }
  .counter-card.alt2 .display { color: #6c5ce7; }
  .counter-card.alt3 .display { color: #00b894; }
  .range {
    display: flex; justify-content: space-between;
    font-size: 0.75rem; color: #b2bec3; margin-bottom: 0.5rem;
  }
  .step-control {
    display: flex; align-items: center; gap: 0.5rem;
    justify-content: center; margin: 0.5rem 0; font-size: 0.85rem;
  }
  .step-control input {
    width: 4rem; padding: 0.3rem; border: 1px solid #ddd;
    border-radius: 4px; text-align: center;
  }
  .buttons { display: flex; justify-content: center; gap: 0.5rem; margin-top: 0.75rem; }
  button {
    padding: 0.5rem 1.25rem; border: none; border-radius: 4px;
    background: #e17055; color: white; cursor: pointer; font-weight: 600;
    font-size: 1rem;
  }
  button:hover { opacity: 0.9; }
  button:disabled { background: #b2bec3; cursor: not-allowed; }
  .counter-card.alt button { background: #0984e3; }
  .counter-card.alt2 button { background: #6c5ce7; }
  .counter-card.alt3 button { background: #00b894; }
  .static-info {
    margin-top: 0.5rem; font-size: 0.8rem; color: #636e72;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .small {
    padding: 0.2rem 0.5rem; font-size: 0.75rem; background: #636e72;
  }
  .derived { margin: 0.5rem 0; color: #636e72; }
  .derived strong { color: #0984e3; font-size: 1.2rem; }
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
  .history-dot.current { background: #6c5ce7; color: white; }
  .laps {
    margin-top: 0.75rem; text-align: left; font-size: 0.85rem;
    max-height: 150px; overflow-y: auto;
  }
  .note {
    font-size: 0.8rem; color: #636e72; font-style: italic;
    margin-top: 0.5rem;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
