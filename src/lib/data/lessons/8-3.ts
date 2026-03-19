import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '8-3',
		title: 'Union Types, Literals & as const',
		phase: 2,
		module: 8,
		lessonIndex: 3
	},
	description: `Union types let a value be one of several types: string | number means "either a string or a number." Literal types narrow this further: 'sm' | 'md' | 'lg' means "exactly one of these three strings."

Literal unions are incredibly useful for component APIs. Instead of accepting any string for a button size, you restrict it to specific valid values. TypeScript then catches typos like 'sml' at compile time.

The as const assertion tells TypeScript to infer the narrowest possible type. Instead of string[], you get readonly ['sm', 'md', 'lg'] — a tuple of exact literal values. This is perfect for configuration objects that shouldn't change.`,
	objectives: [
		'Create union types that accept multiple type possibilities',
		'Use literal types to restrict values to specific strings or numbers',
		'Apply as const to get narrow, readonly types for configuration',
		'Narrow union types with conditional checks'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Literal union types for button variants
  type ButtonSize = 'sm' | 'md' | 'lg';
  type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

  let selectedSize: ButtonSize = $state('md');
  let selectedVariant: ButtonVariant = $state('primary');
  let buttonText: string = $state('Click me');

  // as const for configuration
  const SIZES = {
    sm: { padding: '0.25rem 0.5rem', fontSize: '0.8rem' },
    md: { padding: '0.5rem 1rem', fontSize: '1rem' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '1.2rem' }
  } as const;

  const VARIANTS = {
    primary: { bg: '#4f46e5', color: '#fff' },
    secondary: { bg: '#e5e7eb', color: '#333' },
    danger: { bg: '#dc2626', color: '#fff' },
    ghost: { bg: 'transparent', color: '#4f46e5' }
  } as const;

  // Union types for different data shapes
  type StringOrNumber = string | number;
  let mixedValue: StringOrNumber = $state('hello');
  let isString = $derived(typeof mixedValue === 'string');

  function toggleMixed(): void {
    if (typeof mixedValue === 'string') {
      mixedValue = 42;
    } else {
      mixedValue = 'hello';
    }
  }

  // Practical union: status type
  type Status = 'idle' | 'loading' | 'success' | 'error';
  let status: Status = $state('idle');

  function cycleStatus(): void {
    const order: Status[] = ['idle', 'loading', 'success', 'error'];
    const currentIndex = order.indexOf(status);
    status = order[(currentIndex + 1) % order.length];
  }

  // Computed styles from config
  let sizeStyles = $derived(SIZES[selectedSize]);
  let variantStyles = $derived(VARIANTS[selectedVariant]);

  const allSizes: ButtonSize[] = ['sm', 'md', 'lg'];
  const allVariants: ButtonVariant[] = ['primary', 'secondary', 'danger', 'ghost'];
</script>

<h1>Union Types, Literals & as const</h1>

<section>
  <h2>Literal Union: Button Builder</h2>
  <pre class="code">type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';</pre>

  <div class="controls">
    <div class="control-group">
      <strong>Size:</strong>
      {#each allSizes as size}
        <button
          class:active={selectedSize === size}
          onclick={() => selectedSize = size}
        >{size}</button>
      {/each}
    </div>
    <div class="control-group">
      <strong>Variant:</strong>
      {#each allVariants as variant}
        <button
          class:active={selectedVariant === variant}
          onclick={() => selectedVariant = variant}
        >{variant}</button>
      {/each}
    </div>
    <div class="control-group">
      <strong>Text:</strong>
      <input bind:value={buttonText} />
    </div>
  </div>

  <div class="preview">
    <button
      class="styled-btn"
      style="
        padding: {sizeStyles.padding};
        font-size: {sizeStyles.fontSize};
        background: {variantStyles.bg};
        color: {variantStyles.color};
      "
    >
      {buttonText}
    </button>
  </div>
</section>

<section>
  <h2>as const Configuration</h2>
  <pre class="code">const SIZES = {'{'}
  sm: {'{'}  padding: '0.25rem 0.5rem', fontSize: '0.8rem' {'}'},
  md: {'{'}  padding: '0.5rem 1rem',    fontSize: '1rem'   {'}'},
  lg: {'{'}  padding: '0.75rem 1.5rem', fontSize: '1.2rem' {'}'}
{'}'} as const;

// Without as const: type is Record&lt;string, {'{'}padding: string, ...{'}'}&gt;
// With as const:    type preserves exact literal values (readonly)</pre>

  <p>Current size config: <code>{JSON.stringify(sizeStyles)}</code></p>
</section>

<section>
  <h2>Union Type: string | number</h2>
  <button onclick={toggleMixed}>Toggle type</button>
  <div class="type-display">
    <span class="badge">{typeof mixedValue}</span>
    <span class="value">{mixedValue}</span>
  </div>
  <pre class="code">// TypeScript narrows the type with typeof:
if (typeof mixedValue === 'string') {'{'}
  // TypeScript knows it's a string here
  mixedValue.toUpperCase(); // OK!
{'}'} else {'{'}
  // TypeScript knows it's a number here
  mixedValue.toFixed(2); // OK!
{'}'}</pre>
</section>

<section>
  <h2>Status Union Pattern</h2>
  <button onclick={cycleStatus}>Next status</button>
  <div class="status-display">
    <span class="status-badge {status}">{status}</span>
    <span class="status-message">
      {#if status === 'idle'}
        Ready to go
      {:else if status === 'loading'}
        Loading...
      {:else if status === 'success'}
        Operation completed!
      {:else if status === 'error'}
        Something went wrong
      {/if}
    </span>
  </div>
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .code {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    overflow-x: auto;
    white-space: pre;
    margin: 0.5rem 0;
  }
  .controls { display: flex; flex-direction: column; gap: 0.75rem; margin: 1rem 0; }
  .control-group { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
  button {
    padding: 0.4rem 0.8rem;
    background: #e5e7eb;
    color: #333;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    cursor: pointer;
  }
  button.active { background: #4f46e5; color: white; border-color: #4f46e5; }
  input { padding: 0.3rem 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
  .preview {
    display: flex;
    justify-content: center;
    padding: 2rem;
    background: #f0f0f0;
    border-radius: 8px;
  }
  .styled-btn {
    border: 2px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  }
  .type-display {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 0.75rem 0;
  }
  .badge {
    background: #4f46e5;
    color: white;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.85rem;
  }
  .value { font-size: 1.3rem; font-weight: bold; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
  .status-display { display: flex; align-items: center; gap: 1rem; margin: 0.75rem 0; }
  .status-badge {
    padding: 0.3rem 0.8rem;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.9rem;
  }
  .idle { background: #e5e7eb; color: #374151; }
  .loading { background: #dbeafe; color: #1d4ed8; }
  .success { background: #d1fae5; color: #065f46; }
  .error { background: #fee2e2; color: #991b1b; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
