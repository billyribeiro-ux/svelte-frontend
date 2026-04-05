import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '8-4',
		title: 'Type Guards & Discriminated Unions',
		phase: 2,
		module: 8,
		lessonIndex: 4
	},
	description: `When a value can be multiple types, you need to narrow it down before using type-specific features. Type guards are runtime checks that TypeScript understands — typeof, in, instanceof, and custom guard functions (value is Type).

Discriminated unions are the most powerful pattern: objects share a common field (like status or type) whose value tells TypeScript exactly which shape the object is. Check that field, and TypeScript narrows the type automatically — so inside the success branch, you can safely access .data, and inside the error branch, you can safely access .message.

This pattern is everywhere in real apps: API responses, form states, event handlers, and shape hierarchies. Combined with exhaustive switch statements using never, it makes invalid states literally unrepresentable.`,
	objectives: [
		'Use typeof, in, and instanceof as type guards',
		'Write custom type guards using the value is Type predicate',
		'Create discriminated unions with a shared tag field',
		'Render type-safe UI based on discriminated union variants',
		'Handle all variants exhaustively with never'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // 1. typeof GUARD — for primitives
  // ============================================================

  function describe(value: string | number | boolean): string {
    if (typeof value === 'string') {
      return 'string of length ' + value.length;
    }
    if (typeof value === 'number') {
      return 'number ' + value.toFixed(2);
    }
    return 'boolean ' + value;
  }

  // ============================================================
  // 2. in GUARD — does the object have this key?
  // ============================================================

  interface Dog {
    name: string;
    bark(): string;
  }
  interface Fish {
    name: string;
    swim(): string;
  }

  function speak(pet: Dog | Fish): string {
    if ('bark' in pet) {
      // TS knows pet is Dog here
      return pet.bark();
    }
    // TS knows pet is Fish here
    return pet.swim();
  }

  const rex: Dog = { name: 'Rex', bark: () => 'Woof!' };
  const nemo: Fish = { name: 'Nemo', swim: () => 'Blub blub' };

  // ============================================================
  // 3. instanceof GUARD — for classes
  // ============================================================

  class ValidationError extends Error {
    field: string;
    constructor(message: string, field: string) {
      super(message);
      this.name = 'ValidationError';
      this.field = field;
    }
  }

  function handle(err: Error | ValidationError): string {
    if (err instanceof ValidationError) {
      return \`[field: \${err.field}] \${err.message}\`;
    }
    return 'generic: ' + err.message;
  }

  // ============================================================
  // 4. CUSTOM TYPE GUARD — "value is Type" predicate
  // ============================================================

  function isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  function loudify(value: unknown): string {
    if (isString(value)) {
      // Inside this block TS knows value is string
      return value.toUpperCase();
    }
    return '(not a string)';
  }

  // ============================================================
  // 5. DISCRIMINATED UNION — the crown jewel
  // ============================================================
  // A common tag field ('status' here) discriminates variants.

  type ApiResponse<T> =
    | { status: 'loading' }
    | { status: 'success'; data: T }
    | { status: 'error'; message: string; code: number };

  interface User {
    id: number;
    name: string;
  }

  let response = $state<ApiResponse<User>>({ status: 'loading' });

  async function fetchUser(outcome: 'success' | 'error'): Promise<void> {
    response = { status: 'loading' };
    await new Promise((r) => setTimeout(r, 400));
    if (outcome === 'success') {
      response = { status: 'success', data: { id: 1, name: 'Alice' } };
    } else {
      response = { status: 'error', message: 'Not found', code: 404 };
    }
  }

  // ============================================================
  // 6. EXHAUSTIVE SWITCH with never
  // ============================================================

  type Shape =
    | { kind: 'circle'; radius: number }
    | { kind: 'square'; side: number }
    | { kind: 'rectangle'; width: number; height: number };

  function area(shape: Shape): number {
    switch (shape.kind) {
      case 'circle':
        return Math.PI * shape.radius ** 2;
      case 'square':
        return shape.side ** 2;
      case 'rectangle':
        return shape.width * shape.height;
      default: {
        // If a new Shape variant is added and not handled,
        // this line becomes a compile error (type narrowed to never).
        const _exhaustive: never = shape;
        return _exhaustive;
      }
    }
  }

  let shapes = $state<Shape[]>([
    { kind: 'circle', radius: 5 },
    { kind: 'square', side: 4 },
    { kind: 'rectangle', width: 3, height: 6 }
  ]);

  // ============================================================
  // Demo bindings
  // ============================================================

  let primitiveInput: string | number | boolean = $state(42);

  function cyclePrimitive(): void {
    if (typeof primitiveInput === 'number') primitiveInput = 'hello world';
    else if (typeof primitiveInput === 'string') primitiveInput = true;
    else primitiveInput = 3.14;
  }

  let speakResult: string = $state('');

  function speakDog(): void {
    speakResult = speak(rex);
  }
  function speakFish(): void {
    speakResult = speak(nemo);
  }

  let errorResult: string = $state('');

  function throwValidation(): void {
    try {
      throw new ValidationError('Email invalid', 'email');
    } catch (e) {
      if (e instanceof Error) errorResult = handle(e);
    }
  }
  function throwGeneric(): void {
    try {
      throw new Error('Something else');
    } catch (e) {
      if (e instanceof Error) errorResult = handle(e);
    }
  }
</script>

<h1>Type Guards &amp; Discriminated Unions</h1>

<section>
  <h2>1. typeof guard</h2>
  <p>value: <code>{String(primitiveInput)}</code></p>
  <p>describe(): <strong>{describe(primitiveInput)}</strong></p>
  <button onclick={cyclePrimitive}>Cycle type</button>
</section>

<section>
  <h2>2. 'in' guard (Dog | Fish)</h2>
  <button onclick={speakDog}>Speak Dog</button>
  <button onclick={speakFish}>Speak Fish</button>
  {#if speakResult}
    <p class="result">{speakResult}</p>
  {/if}
</section>

<section>
  <h2>3. instanceof guard (Error subclass)</h2>
  <button onclick={throwValidation}>Throw ValidationError</button>
  <button onclick={throwGeneric}>Throw Error</button>
  {#if errorResult}
    <p class="result">{errorResult}</p>
  {/if}
</section>

<section>
  <h2>4. Custom type guard</h2>
  <p>loudify(42) → <code>{loudify(42)}</code></p>
  <p>loudify('hello') → <code>{loudify('hello')}</code></p>
  <pre class="code">{\`function isString(v: unknown): v is string {
  return typeof v === 'string';
}\`}</pre>
</section>

<section>
  <h2>5. Discriminated Union: ApiResponse</h2>
  <div class="controls">
    <button onclick={() => fetchUser('success')}>Fetch success</button>
    <button onclick={() => fetchUser('error')}>Fetch error</button>
  </div>

  {#if response.status === 'loading'}
    <p class="status loading">Loading...</p>
  {:else if response.status === 'success'}
    <div class="status ok">
      <strong>User loaded:</strong>
      <p>#{response.data.id} — {response.data.name}</p>
    </div>
  {:else if response.status === 'error'}
    <div class="status err">
      <strong>Error {response.code}:</strong> {response.message}
    </div>
  {/if}

  <p class="hint">
    Inside each branch, TS narrows the type. Only <code>success</code> has <code>.data</code>; only <code>error</code> has <code>.message</code>.
  </p>
</section>

<section>
  <h2>6. Exhaustive switch with never</h2>
  <ul class="shapes">
    {#each shapes as shape, i (i)}
      <li>
        <strong>{shape.kind}</strong>
        {#if shape.kind === 'circle'}
          — radius {shape.radius}
        {:else if shape.kind === 'square'}
          — side {shape.side}
        {:else if shape.kind === 'rectangle'}
          — {shape.width}×{shape.height}
        {/if}
        → area {area(shape).toFixed(2)}
      </li>
    {/each}
  </ul>
  <p class="hint">
    If you add a <code>triangle</code> variant to Shape without handling it in <code>area()</code>,
    TypeScript will fail the build at the <code>never</code> assignment.
  </p>
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .controls { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.5rem 0; }
  button {
    padding: 0.4rem 0.9rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin: 0.25rem 0.25rem 0.25rem 0;
  }
  button:hover { background: #4338ca; }
  .result, .status {
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }
  .result { background: white; border: 1px solid #e0e0e0; }
  .loading { background: #fef3c7; color: #92400e; }
  .ok { background: #d1fae5; color: #065f46; }
  .err { background: #fee2e2; color: #991b1b; }
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
  .hint { font-size: 0.85rem; color: #666; margin-top: 0.5rem; }
  .shapes { list-style: none; padding: 0; margin: 0.5rem 0; }
  .shapes li {
    padding: 0.4rem 0.6rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
