import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-2',
		title: 'Passing Snippets to Components',
		phase: 3,
		module: 10,
		lessonIndex: 2
	},
	description: `Snippets become really powerful once you start passing them across component boundaries. Any markup you place between a component's open and close tags is collected into an **implicit \`children\` snippet** — which the component can render wherever it likes:

\`\`\`svelte
<Card title="Hello">
  <p>This becomes {children}</p>
</Card>
\`\`\`

You can also pass **named snippets** with \`{#snippet name()}\` blocks inside the component call — they become props with exactly that name. The component declares them in its \`$props()\` destructure, typed as \`Snippet\` (or \`Snippet<[T1, T2]>\` when they take parameters). Optional snippets are made optional by adding \`?\` in the type, then guarded with \`{#if snippet}\` at the call site.

The truly powerful pattern is **parameterised snippets as props**: a \`List\` component owns the iteration logic, while the consumer provides a snippet that says how to render each item. The generic type parameter (declared with \`<script lang="ts" generics="T">\`) flows from the list's \`items\` all the way into the snippet, giving you full type safety with zero prop drilling.

Beyond \`Snippet\`, Svelte ships two more typing utilities every component author needs: \`Component<Props>\` types a *component itself* (so you can pass components as props and render them dynamically), and \`ComponentProps<typeof X>\` extracts a component's props type (perfect for wrapper components and factory functions). Together with \`Snippet\`, these three cover the whole composition type surface.

Finally, a word of discipline on \`$bindable\`: it is for genuinely two-way values — the \`value\` of an input-like component, the \`open\` state of a disclosure. It is **not** a general communication channel. If the child merely *notifies* (use a callback prop), *renders* parent content (use a snippet), or *derives* from a prop (use \`$derived\`), don't make it bindable — every \`$bindable\` is an invitation for data to flow upward that future readers must chase.

This lesson builds a \`Card\` component with optional \`footer\`, a generic \`List<T>\` component that accepts an \`item\` snippet, and demonstrates three different patterns of passing content from the parent.`,
	objectives: [
		'Pass markup as the implicit children snippet',
		'Accept children and other snippet props with the Snippet type',
		'Define optional snippet props and guard them with {#if}',
		'Type parameterised snippets with Snippet<[T]>',
		'Use <script lang="ts" generics="T"> to make a generic component',
		'Type component-as-prop patterns with Component<Props> and extract props with ComponentProps<typeof X>',
		'Apply $bindable discipline: bind only genuinely two-way values, prefer callbacks/snippets otherwise',
		'Understand how :else inside an {#each} block interacts with optional snippets'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import Card from './Card.svelte';
  import List from './List.svelte';

  let count = $state(0);

  const fruits = [
    { id: 1, name: 'Apple', color: '#ef4444' },
    { id: 2, name: 'Banana', color: '#eab308' },
    { id: 3, name: 'Cherry', color: '#be123c' },
    { id: 4, name: 'Date', color: '#92400e' }
  ];

  let showFooter = $state(true);

  // Keep the big code-sample strings out of the template
  // literal danger zone by building them with char codes.
  const lt = String.fromCharCode(60);
  const gt = String.fromCharCode(62);

  const cardReceiver =
    lt + 'script lang="ts"' + gt + '\\n' +
    '  import type { Snippet } from "svelte";\\n' +
    '\\n' +
    '  let { title, children, footer }: {\\n' +
    '    title: string;\\n' +
    '    children: Snippet;        // required\\n' +
    '    footer?: Snippet;         // optional\\n' +
    '  } = $props();\\n' +
    lt + '/script' + gt + '\\n' +
    '\\n' +
    lt + 'div class="card"' + gt + '\\n' +
    '  ' + lt + 'h2' + gt + '{title}' + lt + '/h2' + gt + '\\n' +
    '  {@render children()}\\n' +
    '  {#if footer}\\n' +
    '    ' + lt + 'footer' + gt + '{@render footer()}' + lt + '/footer' + gt + '\\n' +
    '  {/if}\\n' +
    lt + '/div' + gt;

  const parameterised =
    'let { items, item }: {\\n' +
    '  items: Fruit[];\\n' +
    '  item: Snippet<[Fruit]>;\\n' +
    '} = $props();\\n' +
    '\\n' +
    '{#each items as f}\\n' +
    '  {@render item(f)}\\n' +
    '{/each}';
</script>

<main>
  <h1>Passing Snippets to Components</h1>
  <p class="lede">
    Anything you put between a component's tags becomes the
    implicit <code>children</code> snippet. Named snippets
    become props with any name you pick. Components render
    them with <code>{'{@render}'}</code>.
  </p>

  <section>
    <h2>1. Implicit <code>children</code></h2>
    <Card title="Hello from children">
      <p>
        This paragraph is the <code>children</code> snippet.
        Svelte collects everything between
        <code>&lt;Card&gt;</code> and <code>&lt;/Card&gt;</code>
        and passes it as a prop called <code>children</code>.
      </p>
      <button onclick={() => count++}>Clicked {count} time{count === 1 ? '' : 's'}</button>
    </Card>
  </section>

  <section>
    <h2>2. Named snippets via <code>{'{#snippet}'}</code></h2>
    <Card title="Card with a footer">
      <p>The body of the card.</p>
      {#snippet footer()}
        <div class="footer-content">
          <em>Last updated just now</em>
          <button>Save</button>
        </div>
      {/snippet}
    </Card>

    <label class="toggle">
      <input type="checkbox" bind:checked={showFooter} />
      Pass the footer snippet
    </label>
    <Card title="Optional footer">
      <p>This card receives a footer only when the checkbox is ticked.</p>
      {#if showFooter}
        {#snippet footer()}
          <span>The footer exists!</span>
        {/snippet}
      {/if}
    </Card>
  </section>

  <section>
    <h2>3. Parameterised snippets as props</h2>
    <p>
      The <code>List</code> component accepts an
      <code>item</code> snippet. <code>List</code> owns the
      iteration; you tell it how to render each entry.
    </p>
    <List items={fruits}>
      {#snippet item(fruit)}
        <div class="fruit-row" style="border-left-color: {fruit.color}">
          <span class="dot" style="background: {fruit.color}"></span>
          <strong>{fruit.name}</strong>
        </div>
      {/snippet}
    </List>
  </section>

  <section class="notes">
    <h2>Receiving snippets in a component</h2>
    <pre>{cardReceiver}</pre>

    <h3>Parameterised snippets</h3>
    <p>
      A snippet that takes arguments has the type
      <code>Snippet&lt;[T1, T2, ...]&gt;</code>. The tuple
      lists the parameters in order.
    </p>
    <pre>{parameterised}</pre>

    <h3>Fallback content</h3>
    <p>
      If a snippet prop is optional, guard it with
      <code>{'{#if snippet}'}</code> before rendering, or
      provide a default <code>{'{#snippet}'}</code> in the
      component itself.
    </p>
  </section>

  <section class="notes">
    <h2>The full typing toolkit: Component & ComponentProps</h2>
    <p>
      <code>Snippet</code> types <em>markup</em> passed as a prop.
      <code>Component&lt;Props&gt;</code> types a <em>component</em> passed as a prop —
      in Svelte 5 you render it directly with a capitalised local name.
      <code>ComponentProps&lt;typeof X&gt;</code> extracts a component's props type:
    </p>
    <pre>{\`<script lang="ts">
  import type { Component, ComponentProps } from 'svelte';
  import Card from './Card.svelte';

  // 1. Component as a prop — e.g. a pluggable icon
  let { Icon, label }: {
    Icon: Component<{ size?: number }>;
    label: string;
  } = $props();

  // 2. ComponentProps — extract a component's props type.
  //    Perfect for wrappers and factories; never duplicate
  //    a props interface by hand.
  type CardProps = ComponentProps<typeof Card>;

  function makeCardConfig(overrides: Partial<CardProps>): CardProps {
    return { title: 'Untitled', ...overrides } as CardProps;
  }
</\${''}script>

<!-- capitalised, so Svelte treats it as a component -->
<Icon size={16} />
<span>{label}</span>\`}</pre>

    <h3>$bindable discipline — when NOT to bind</h3>
    <p>
      A child can opt a prop into two-way flow with
      <code>value = $bindable()</code>. Use it sparingly:
    </p>
    <pre>{\`// ✅ Genuinely two-way: input-like value, open/expanded state
let { value = $bindable('') }: { value?: string } = $props();

// ❌ Child only NOTIFIES the parent → use a callback prop
let { onselect }: { onselect: (id: string) => void } = $props();

// ❌ Child only RENDERS parent content → use a snippet
let { row }: { row: Snippet<[Item]> } = $props();

// ❌ Value is DERIVED from a prop → use $derived, never
//    write a prop back to "sync" it
const label = $derived(item.name.toUpperCase());\`}</pre>
    <p>
      Rules of thumb: a prop should be <code>$bindable</code> only if the component is
      a <em>control</em> whose primary output is that value. Mutating a bound prop is
      invisible at the call site — <code>bind:value</code> at least announces it.
      If you find yourself binding three props on one component, you probably want
      context (next lesson) or a state class instead.
    </p>
  </section>
</main>

<style>
  main { max-width: 780px; margin: 0 auto; padding: 1.25rem; font-family: system-ui, sans-serif; }
  h1 { margin-top: 0; }
  .lede { color: #555; }
  section {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
  }
  h2 { margin: 0 0 0.75rem; font-size: 1rem; }
  h3 { font-size: 0.9rem; margin: 0.8rem 0 0.3rem; }
  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.75rem;
    overflow-x: auto;
    white-space: pre;
  }
  .footer-content {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%;
  }
  .toggle {
    display: inline-flex; align-items: center; gap: 0.4rem;
    margin: 0.5rem 0;
    font-size: 0.85rem;
  }
  button {
    padding: 0.4rem 0.8rem;
    border: 1px solid #6690ff;
    background: #6690ff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .fruit-row {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-left: 3px solid;
    border-radius: 4px;
    background: #fafafa;
    margin-bottom: 0.3rem;
  }
  .dot { width: 10px; height: 10px; border-radius: 50%; }
  code {
    background: #f3f4f6;
    padding: 0 0.3rem;
    border-radius: 3px;
    font-size: 0.85em;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Card.svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  // Children is the implicit snippet — whatever sits between
  // the component's open/close tags. Naming it \`children\`
  // (or letting the type default to it) is the convention.
  let {
    title,
    children,
    footer
  }: {
    title: string;
    children: Snippet;      // required — compile error if missing
    footer?: Snippet;       // optional
  } = $props();
</script>

<div class="card">
  <header>
    <h2>{title}</h2>
  </header>
  <div class="body">
    {@render children()}
  </div>
  {#if footer}
    <footer>
      {@render footer()}
    </footer>
  {/if}
</div>

<style>
  .card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
    overflow: hidden;
    margin: 0.5rem 0;
  }
  header {
    padding: 0.6rem 1rem;
    background: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
  }
  h2 { margin: 0; font-size: 1rem; }
  .body { padding: 0.8rem 1rem; }
  footer {
    padding: 0.5rem 1rem;
    background: #fafafa;
    border-top: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'List.svelte',
			content: `<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  // A generic List component: it knows how to iterate, but
  // the CONSUMER tells it how to render each row via a
  // parameterised snippet.
  //
  // The generic parameter T is declared on the <script> tag
  // via \`generics="T"\` — a Svelte 5 feature that propagates
  // types from the consumer down into the snippet.
  let {
    items,
    item,
    empty
  }: {
    items: T[];
    item: Snippet<[T]>;       // takes a single item
    empty?: Snippet;          // optional — shown when items is empty
  } = $props();
</script>

<ul class="list">
  {#each items as entry (entry)}
    <li>
      {@render item(entry)}
    </li>
  {:else}
    {#if empty}
      {@render empty()}
    {:else}
      <li class="empty">No items</li>
    {/if}
  {/each}
</ul>

<style>
  .list { list-style: none; padding: 0; margin: 0.5rem 0; }
  li { margin: 0; }
  li.empty { color: #9ca3af; font-style: italic; text-align: center; padding: 1rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
