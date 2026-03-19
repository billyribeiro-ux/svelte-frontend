import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '8-4',
		title: 'Type Guards & Discriminated Unions',
		phase: 2,
		module: 8,
		lessonIndex: 4
	},
	description: `When a value can be multiple types, you need to narrow it down before using type-specific features. Type guards are runtime checks that TypeScript understands — typeof, in, instanceof, and custom guard functions.

Discriminated unions are the most powerful pattern: objects share a common field (like status or type) whose value tells TypeScript exactly which shape the object is. Check that field, and TypeScript narrows the type automatically.

This pattern is everywhere in real apps: API responses ({status: 'success', data} | {status: 'error', message}), form states, and event handlers.`,
	objectives: [
		'Use typeof, in, and instanceof as type guards',
		'Create discriminated unions with a shared tag field',
		'Render type-safe UI based on discriminated union variants',
		'Handle all variants exhaustively'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // === Discriminated Union: API Response ===
  type ApiResponse =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: { users: string[]; total: number } }
    | { status: 'error'; message: string; code: number };

  let response: ApiResponse = $state({ status: 'idle' });

  async function fetchUsers(): Promise<void> {
    response = { status: 'loading' };

    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Randomly succeed or fail
    if (Math.random() > 0.3) {
      response = {
        status: 'success',
        data: {
          users: ['Alice', 'Bob', 'Carol', 'Dave'],
          total: 4
        }
      };
    } else {
      response = {
        status: 'error',
        message: 'Failed to fetch users',
        code: 500
      };
    }
  }

  function resetResponse(): void {
    response = { status: 'idle' };
  }

  // === typeof guard ===
  type FlexValue = string | number | boolean;

  function describeValue(val: FlexValue): string {
    if (typeof val === 'string') {
      return \`String of length \${val.length}: "\${val}"\`;
    } else if (typeof val === 'number') {
      return \`Number: \${val.toFixed(2)}\`;
    } else {
      return \`Boolean: \${val ? 'true' : 'false'}\`;
    }
  }

  let testValues: FlexValue[] = ['hello', 42, true, 'world', 3.14, false];

  // === Discriminated union: Shape ===
  type Shape =
    | { kind: 'circle'; radius: number }
    | { kind: 'rectangle'; width: number; height: number }
    | { kind: 'triangle'; base: number; height: number };

  function area(shape: Shape): number {
    switch (shape.kind) {
      case 'circle':
        return Math.PI * shape.radius ** 2;
      case 'rectangle':
        return shape.width * shape.height;
      case 'triangle':
        return 0.5 * shape.base * shape.height;
    }
  }

  let shapes: Shape[] = $state([
    { kind: 'circle', radius: 5 },
    { kind: 'rectangle', width: 10, height: 6 },
    { kind: 'triangle', base: 8, height: 4 }
  ]);

  // === 'in' guard ===
  interface Cat { meow(): string; whiskers: number; }
  interface Dog { bark(): string; tricks: string[]; }

  function describeAnimal(animal: Cat | Dog): string {
    if ('meow' in animal) {
      return \`Cat with \${animal.whiskers} whiskers\`;
    } else {
      return \`Dog who knows \${animal.tricks.length} tricks\`;
    }
  }
</script>

<h1>Type Guards & Discriminated Unions</h1>

<section>
  <h2>Discriminated Union: API Response</h2>
  <pre class="code">type ApiResponse =
  | {'{'}status: 'idle'{'}'}
  | {'{'}status: 'loading'{'}'}
  | {'{'}status: 'success'; data: ...{'}'}
  | {'{'}status: 'error'; message: string{'}'}</pre>

  <div class="api-demo">
    <button onclick={fetchUsers} disabled={response.status === 'loading'}>
      Fetch Users
    </button>
    <button class="secondary" onclick={resetResponse}>Reset</button>

    <div class="response-display">
      {#if response.status === 'idle'}
        <div class="state idle">
          <span class="tag">idle</span>
          Ready to fetch
        </div>
      {:else if response.status === 'loading'}
        <div class="state loading">
          <span class="tag">loading</span>
          Fetching users...
        </div>
      {:else if response.status === 'success'}
        <div class="state success">
          <span class="tag">success</span>
          <p>Found {response.data.total} users:</p>
          <ul>
            {#each response.data.users as user}
              <li>{user}</li>
            {/each}
          </ul>
        </div>
      {:else if response.status === 'error'}
        <div class="state error">
          <span class="tag">error ({response.code})</span>
          {response.message}
        </div>
      {/if}
    </div>
  </div>
</section>

<section>
  <h2>typeof Guard</h2>
  <table>
    <thead><tr><th>Value</th><th>typeof</th><th>Description</th></tr></thead>
    <tbody>
      {#each testValues as val}
        <tr>
          <td><code>{JSON.stringify(val)}</code></td>
          <td><span class="type-badge">{typeof val}</span></td>
          <td>{describeValue(val)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<section>
  <h2>Discriminated Union: Shapes</h2>
  <div class="shapes">
    {#each shapes as shape}
      <div class="shape-card">
        <span class="shape-kind">{shape.kind}</span>
        {#if shape.kind === 'circle'}
          <p>Radius: {shape.radius}</p>
        {:else if shape.kind === 'rectangle'}
          <p>Width: {shape.width}, Height: {shape.height}</p>
        {:else if shape.kind === 'triangle'}
          <p>Base: {shape.base}, Height: {shape.height}</p>
        {/if}
        <p class="area">Area: <strong>{area(shape).toFixed(2)}</strong></p>
      </div>
    {/each}
  </div>

  <pre class="code">switch (shape.kind) {'{'}    // TypeScript narrows the type
  case 'circle':       // shape is {'{'}kind: 'circle'; radius: number{'}'}
  case 'rectangle':    // shape is {'{'}kind: 'rectangle'; width: number; ...{'}'}
  case 'triangle':     // shape is {'{'}kind: 'triangle'; base: number; ...{'}'}
{'}'}</pre>
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
  button {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .secondary { background: #6b7280; }
  .api-demo { margin: 0.75rem 0; }
  .response-display { margin-top: 1rem; }
  .state {
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid;
  }
  .idle { background: #f3f4f6; border-color: #d1d5db; }
  .loading { background: #dbeafe; border-color: #93c5fd; }
  .success { background: #d1fae5; border-color: #6ee7b7; }
  .error { background: #fee2e2; border-color: #fca5a5; }
  .tag {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 3px;
    font-size: 0.8rem;
    font-weight: bold;
    background: rgba(0,0,0,0.1);
    margin-bottom: 0.5rem;
  }
  ul { margin: 0.5rem 0; padding-left: 1.2rem; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #eee; }
  th { background: #f0f0f0; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
  .type-badge {
    background: #4f46e5;
    color: white;
    padding: 0.15rem 0.4rem;
    border-radius: 3px;
    font-size: 0.8rem;
  }
  .shapes { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
  .shape-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 0.75rem;
  }
  .shape-kind {
    background: #818cf8;
    color: white;
    padding: 0.15rem 0.5rem;
    border-radius: 3px;
    font-size: 0.8rem;
    font-weight: bold;
  }
  .area { color: #4f46e5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
