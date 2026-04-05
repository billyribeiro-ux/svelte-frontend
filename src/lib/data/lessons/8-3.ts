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

The as const assertion tells TypeScript to infer the narrowest possible type. Instead of string[], you get readonly ['sm', 'md', 'lg'] — a tuple of exact literal values. This is perfect for configuration arrays whose values you want to reuse as a literal union with typeof.`,
	objectives: [
		'Create union types that accept multiple type possibilities',
		'Use literal types to restrict values to specific strings',
		'Apply as const to get narrow, readonly types for configuration',
		'Narrow union types with typeof and equality checks'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // 1. UNION TYPES — "this OR that"
  // ============================================================
  // string | number means: either a string or a number.

  let id: string | number = $state(42);

  function formatId(value: string | number): string {
    // Narrow with typeof
    if (typeof value === 'number') {
      return 'N:' + value.toFixed(0);
    }
    return 'S:' + value.toUpperCase();
  }

  let formatted: string = $derived(formatId(id));

  function swapId(): void {
    id = typeof id === 'number' ? 'alpha' : 99;
  }

  // ============================================================
  // 2. LITERAL UNION — "exactly these values"
  // ============================================================
  // Restrict to a specific set of string literals.

  type Size = 'sm' | 'md' | 'lg';
  type Variant = 'primary' | 'secondary' | 'danger';

  let buttonSize: Size = $state('md');
  let buttonVariant: Variant = $state('primary');

  // TS error if you try: buttonSize = 'sml'
  //                                   ^ Type '"sml"' is not assignable to 'Size'.

  // ============================================================
  // 3. STATUS UNION — discriminate between states
  // ============================================================

  type Status = 'idle' | 'loading' | 'success' | 'error';
  let status: Status = $state('idle');

  function describe(s: Status): string {
    switch (s) {
      case 'idle':
        return 'Waiting to start';
      case 'loading':
        return 'Working...';
      case 'success':
        return 'All good';
      case 'error':
        return 'Something failed';
    }
  }

  let description: string = $derived(describe(status));

  async function simulate(): Promise<void> {
    status = 'loading';
    await new Promise((r) => setTimeout(r, 600));
    status = Math.random() > 0.5 ? 'success' : 'error';
  }

  // ============================================================
  // 4. as const — preserve narrow literal types
  // ============================================================
  // Without as const, TS widens arrays to string[].
  // With as const, you get a readonly tuple of exact literals.

  const SIZES = ['sm', 'md', 'lg'] as const;
  // type of SIZES is: readonly ['sm', 'md', 'lg']

  // Derive the union type from the tuple:
  type SizeFromTuple = (typeof SIZES)[number];
  // 'sm' | 'md' | 'lg' — no manual duplication!

  const VARIANTS = ['primary', 'secondary', 'danger'] as const;
  type VariantFromTuple = (typeof VARIANTS)[number];

  // ============================================================
  // 5. AS CONST FOR CONFIG OBJECTS
  // ============================================================
  // Without as const, THEME.primary would be string (widened).
  // With as const, it's the literal '#4f46e5'.

  const THEME = {
    primary: '#4f46e5',
    secondary: '#059669',
    danger: '#dc2626',
    spacing: {
      sm: 4,
      md: 8,
      lg: 16
    }
  } as const;

  // THEME.primary's type is the literal '#4f46e5', not string.
  // THEME.spacing.md's type is 4, not number.

  function colorFor(variant: VariantFromTuple): string {
    return THEME[variant];
  }

  function spacingFor(size: SizeFromTuple): number {
    return THEME.spacing[size];
  }

  // ============================================================
  // 6. NARROWING WITH EQUALITY
  // ============================================================

  let input: 'yes' | 'no' | null = $state(null);

  function interpret(v: typeof input): string {
    if (v === null) return 'no answer';
    if (v === 'yes') return 'proceed';
    return 'abort';
  }

  let interpretation: string = $derived(interpret(input));
</script>

<h1>Union Types, Literals &amp; as const</h1>

<section>
  <h2>1. string | number union</h2>
  <p>id: <code>{id}</code> (type: {typeof id})</p>
  <p>formatted: <strong>{formatted}</strong></p>
  <button onclick={swapId}>Swap type</button>
</section>

<section>
  <h2>2. Literal Union: Size & Variant</h2>
  <div class="controls">
    <label>Size
      <select bind:value={buttonSize}>
        {#each SIZES as s (s)}
          <option value={s}>{s}</option>
        {/each}
      </select>
    </label>
    <label>Variant
      <select bind:value={buttonVariant}>
        {#each VARIANTS as v (v)}
          <option value={v}>{v}</option>
        {/each}
      </select>
    </label>
  </div>

  <button
    class="demo-btn"
    style:background={colorFor(buttonVariant)}
    style:padding="{spacingFor(buttonSize)}px {spacingFor(buttonSize) * 2}px"
  >
    Preview Button
  </button>
  <p class="info">
    size <code>{buttonSize}</code> → {spacingFor(buttonSize)}px padding ·
    variant <code>{buttonVariant}</code> → {colorFor(buttonVariant)}
  </p>
</section>

<section>
  <h2>3. Status Union</h2>
  <p>Status: <span class="badge status-{status}">{status}</span></p>
  <p>{description}</p>
  <button onclick={simulate}>Simulate</button>
</section>

<section>
  <h2>4. as const magic</h2>
  <pre class="code">{\`const SIZES = ['sm', 'md', 'lg'] as const;
type Size = (typeof SIZES)[number];
// 'sm' | 'md' | 'lg' — derived from the tuple\`}</pre>
  <p class="hint">
    Add a new size to SIZES and TypeScript automatically updates the union type everywhere.
  </p>
</section>

<section>
  <h2>5. Narrowing with equality</h2>
  <div class="controls">
    <button onclick={() => (input = 'yes')}>yes</button>
    <button onclick={() => (input = 'no')}>no</button>
    <button onclick={() => (input = null)}>null</button>
  </div>
  <p>input: <code>{input === null ? 'null' : input}</code></p>
  <p>interpretation: <strong>{interpretation}</strong></p>
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .controls { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin: 0.5rem 0; }
  label { display: flex; gap: 0.3rem; align-items: center; font-size: 0.9rem; }
  select { padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; }
  button {
    padding: 0.4rem 0.9rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-right: 0.25rem;
  }
  button:hover { filter: brightness(0.9); }
  .demo-btn {
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  code {
    background: #e8e8e8;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.85rem;
  }
  .code {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    white-space: pre-wrap;
  }
  .info { font-size: 0.85rem; color: #555; }
  .hint { font-size: 0.85rem; color: #666; }
  .badge {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
    font-family: monospace;
  }
  .status-idle { background: #e5e7eb; color: #374151; }
  .status-loading { background: #fef3c7; color: #92400e; }
  .status-success { background: #d1fae5; color: #065f46; }
  .status-error { background: #fee2e2; color: #991b1b; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
