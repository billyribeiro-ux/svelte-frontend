import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-7',
		title: 'Compound Components',
		phase: 3,
		module: 10,
		lessonIndex: 7
	},
	description: `Compound components are a pattern where multiple related components work together through shared context. The classic example is a Tabs component: a parent \`Tabs\` manages which tab is active, while individual \`Tab\`, \`TabList\`, and \`TabPanel\` children register themselves and respond to selection — all without prop drilling.

This pattern leverages \`setContext\` / \`getContext\` to share state implicitly, giving you clean APIs where related components "just work" together. The consumer writes something that looks almost like JSX or plain HTML, but every piece is coordinated behind the scenes.

In this lesson we build **two fully worked compound patterns** in a single file: a **Tabs** system (\`Tabs\` + \`TabList\` + \`Tab\` + \`TabPanel\`) and an **Accordion** system (\`Accordion\` + \`AccordionItem\` + \`AccordionTrigger\` + \`AccordionContent\`). Both use typed context, \`$state\` for shared reactive state, and Svelte 5 snippets for content projection. You will see how the parent exposes a tiny API (a getter for the current selection and a mutator to change it), and how the children pull that API out of context to read and update shared state.`,
	objectives: [
		'Build a compound component pattern using context for shared state',
		'Create Tabs/TabList/Tab/TabPanel components that communicate through context',
		'Create Accordion/AccordionItem/AccordionTrigger/AccordionContent components',
		'Type context payloads with TypeScript interfaces and symbol keys',
		'Use $state inside context to share reactive values across components',
		'Project content with Svelte 5 snippets via {@render children()}'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ================================================================
  // Compound Components — two fully worked patterns in one file
  // ----------------------------------------------------------------
  // In a real project each of these sub-components would live in
  // its own .svelte file (Tabs.svelte, Tab.svelte, TabPanel.svelte,
  // Accordion.svelte, AccordionItem.svelte, etc.) and you would
  // import them. We keep them inline here so you can see the whole
  // pattern at a glance.
  //
  // The key idea:
  //   1. The ROOT component creates shared \$state and puts a small
  //      API object into setContext() under a private Symbol key.
  //   2. CHILD components call getContext() with the same key and
  //      read / mutate that shared API.
  //   3. Consumers get a JSX-ish authoring experience:
  //        <Tabs>
  //          <TabList>
  //            <Tab id="a">A</Tab>
  //            <Tab id="b">B</Tab>
  //          </TabList>
  //          <TabPanel id="a">...</TabPanel>
  //          <TabPanel id="b">...</TabPanel>
  //        </Tabs>
  // ================================================================
  import { setContext, getContext } from 'svelte';

  // ================================================================
  // PATTERN 1 — Tabs
  // ================================================================
  // Private symbol key — using a Symbol prevents key collisions
  // with other contexts anywhere else in the app.
  const TABS_KEY = Symbol('tabs');

  interface TabsContext {
    readonly active: string;
    select(id: string): void;
    register(id: string): void;
  }

  let tabsActive = $state('');
  let registered: string[] = $state([]);

  const tabsCtx: TabsContext = {
    get active() { return tabsActive; },
    select(id: string) { tabsActive = id; },
    register(id: string) {
      if (!registered.includes(id)) {
        registered.push(id);
        if (tabsActive === '') tabsActive = id; // first tab wins
      }
    }
  };
  setContext<TabsContext>(TABS_KEY, tabsCtx);

  // Helper that child components would use in their own files.
  // We do not call it here because we have direct closure access
  // to tabsCtx, but this shows the real-world pattern.
  function useTabs(): TabsContext {
    const ctx = getContext<TabsContext>(TABS_KEY);
    if (!ctx) throw new Error('Tab* must be used inside <Tabs>');
    return ctx;
  }

  // ================================================================
  // PATTERN 2 — Accordion
  // ================================================================
  const ACCORDION_KEY = Symbol('accordion');

  interface AccordionContext {
    isOpen(id: string): boolean;
    toggle(id: string): void;
    readonly allowMultiple: boolean;
  }

  let openIds: string[] = $state([]);
  const allowMultiple = false;

  const accordionCtx: AccordionContext = {
    isOpen(id: string) { return openIds.includes(id); },
    toggle(id: string) {
      if (openIds.includes(id)) {
        openIds = openIds.filter((x) => x !== id);
      } else if (allowMultiple) {
        openIds = [...openIds, id];
      } else {
        openIds = [id];
      }
    },
    get allowMultiple() { return allowMultiple; }
  };
  setContext<AccordionContext>(ACCORDION_KEY, accordionCtx);

  function useAccordion(): AccordionContext {
    const ctx = getContext<AccordionContext>(ACCORDION_KEY);
    if (!ctx) throw new Error('Accordion* must be used inside <Accordion>');
    return ctx;
  }

  // ----------------------------------------------------------------
  // Demo data
  // ----------------------------------------------------------------
  interface TabDef { id: string; label: string; body: string; }
  const tabDefs: TabDef[] = [
    { id: 'overview', label: 'Overview', body: 'Compound components share state via context. The parent manages state and children react to it.' },
    { id: 'features', label: 'Features', body: 'No prop drilling. Clean consumer API. Encapsulated state. Flexible composition.' },
    { id: 'pricing',  label: 'Pricing',  body: 'Free and open source — it is just a pattern.' }
  ];

  // Register the tab ids so the Tabs context knows about them.
  for (const t of tabDefs) tabsCtx.register(t.id);

  interface FaqItem { id: string; question: string; answer: string; }
  const faqs: FaqItem[] = [
    { id: 'what', question: 'What are compound components?', answer: 'A pattern where related components share state through context, giving you a clean API that "just works" when composed.' },
    { id: 'why',  question: 'Why use this pattern?',          answer: 'It avoids prop drilling, makes APIs intuitive, and keeps internal state hidden from consumers.' },
    { id: 'when', question: 'When should I reach for it?',    answer: 'Whenever a group of components always works together: Tabs/TabPanel, Accordion/Panel, Select/Option, Menu/MenuItem.' }
  ];

  // Reference useTabs / useAccordion so TS does not warn about unused.
  void useTabs;
  void useAccordion;

  // ----------------------------------------------------------------
  // Source snippets shown in the <details> sections below.
  // We build them with string concatenation so the literal
  // "</scr" + "ipt>" does not get parsed as the end of THIS script.
  // ----------------------------------------------------------------
  const tabsSource =
\`<!-- Tabs.svelte — root, provides context -->
<script lang="ts">
  import { setContext, type Snippet } from 'svelte';
  const TABS_KEY = Symbol('tabs');
  interface TabsContext {
    readonly active: string;
    select(id: string): void;
  }
  let { children, initial = '' }: { children: Snippet; initial?: string } = $props();
  let active = $state(initial);
  setContext<TabsContext>(TABS_KEY, {
    get active() { return active; },
    select(id) { active = id; }
  });
</\` + \`script>
{@render children()}

<!-- Tab.svelte — reads context, renders a button -->
<\` + \`script lang="ts">
  import { getContext } from 'svelte';
  let { id, children } = $props();
  const tabs = getContext(TABS_KEY);
</\` + \`script>
<button
  class:active={tabs.active === id}
  onclick={() => tabs.select(id)}
>{@render children()}</button>

<!-- TabPanel.svelte — only renders if active -->
<\` + \`script lang="ts">
  import { getContext } from 'svelte';
  let { id, children } = $props();
  const tabs = getContext(TABS_KEY);
</\` + \`script>
{#if tabs.active === id}
  <div role="tabpanel">{@render children()}</div>
{/if}\`;

  const accordionSource =
\`<!-- Accordion.svelte — root -->
<script lang="ts">
  import { setContext, type Snippet } from 'svelte';
  const KEY = Symbol('accordion');
  interface Ctx {
    isOpen(id: string): boolean;
    toggle(id: string): void;
  }
  let { children, allowMultiple = false }:
    { children: Snippet; allowMultiple?: boolean } = $props();
  let open: string[] = $state([]);
  setContext<Ctx>(KEY, {
    isOpen: (id) => open.includes(id),
    toggle(id) {
      if (open.includes(id))  open = open.filter((x) => x !== id);
      else if (allowMultiple) open = [...open, id];
      else                    open = [id];
    }
  });
</\` + \`script>
{@render children()}

<!-- AccordionTrigger.svelte -->
<\` + \`script lang="ts">
  import { getContext } from 'svelte';
  let { id, children } = $props();
  const ctx = getContext(KEY);
</\` + \`script>
<button
  onclick={() => ctx.toggle(id)}
  aria-expanded={ctx.isOpen(id)}
>{@render children()}</button>

<!-- AccordionContent.svelte -->
<\` + \`script lang="ts">
  import { getContext } from 'svelte';
  let { id, children } = $props();
  const ctx = getContext(KEY);
</\` + \`script>
{#if ctx.isOpen(id)}
  <div>{@render children()}</div>
{/if}\`;
</script>

<main>
  <h1>Compound Components</h1>
  <p class="lede">
    Two fully worked patterns: <strong>Tabs</strong> and
    <strong>Accordion</strong>. Each root component puts a
    tiny API into <code>setContext</code>; each child pulls
    it back out with <code>getContext</code>. The result: a
    JSX-style authoring experience with encapsulated state.
  </p>

  <!-- ============================================================ -->
  <!-- Pattern 1 — Tabs                                              -->
  <!-- ============================================================ -->
  <section>
    <h2>1. Tabs</h2>
    <p class="muted">
      Consumers write <code>&lt;Tabs&gt;</code>,
      <code>&lt;TabList&gt;</code>, <code>&lt;Tab&gt;</code>,
      and <code>&lt;TabPanel&gt;</code> — they never see the
      shared state directly.
    </p>

    <div class="tabs">
      <div class="tab-bar" role="tablist">
        {#each tabDefs as t (t.id)}
          <button
            type="button"
            class="tab"
            class:active={tabsCtx.active === t.id}
            role="tab"
            aria-selected={tabsCtx.active === t.id}
            onclick={() => tabsCtx.select(t.id)}
          >
            {t.label}
          </button>
        {/each}
      </div>

      {#each tabDefs as t (t.id)}
        {#if tabsCtx.active === t.id}
          <div class="tab-content" role="tabpanel">
            <h3>{t.label}</h3>
            <p>{t.body}</p>
          </div>
        {/if}
      {/each}
    </div>

    <details class="source">
      <summary>Show the component source</summary>
      <pre>{tabsSource}</pre>
    </details>
  </section>

  <!-- ============================================================ -->
  <!-- Pattern 2 — Accordion                                         -->
  <!-- ============================================================ -->
  <section>
    <h2>2. Accordion</h2>
    <p class="muted">
      Same idea, different shape: the root exposes
      <code>isOpen(id)</code> and <code>toggle(id)</code>
      to its children.
    </p>

    <div class="accordion">
      {#each faqs as faq (faq.id)}
        <div class="accordion-item">
          <button
            type="button"
            class="accordion-trigger"
            class:open={accordionCtx.isOpen(faq.id)}
            aria-expanded={accordionCtx.isOpen(faq.id)}
            onclick={() => accordionCtx.toggle(faq.id)}
          >
            <span>{faq.question}</span>
            <span class="chev">{accordionCtx.isOpen(faq.id) ? '−' : '+'}</span>
          </button>
          {#if accordionCtx.isOpen(faq.id)}
            <div class="accordion-content">
              <p>{faq.answer}</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <details class="source">
      <summary>Show the component source</summary>
      <pre>{accordionSource}</pre>
    </details>
  </section>

  <!-- ============================================================ -->
  <!-- Why this is nice                                              -->
  <!-- ============================================================ -->
  <section class="why">
    <h2>Why compound components?</h2>
    <ul>
      <li><strong>No prop drilling.</strong> The root does not have to pass <code>active</code> or <code>onSelect</code> through every intermediate wrapper.</li>
      <li><strong>Clean consumer API.</strong> Users compose by nesting tags, which reads like plain HTML.</li>
      <li><strong>Encapsulation.</strong> The internal state (<code>$state</code> in the root) is a private implementation detail.</li>
      <li><strong>Flexibility.</strong> Consumers control the order, wrapping, and styling of the sub-components however they like.</li>
      <li><strong>Type safety.</strong> The context value is typed via an interface, so every child gets autocomplete and TS errors on misuse.</li>
    </ul>
  </section>
</main>

<style>
  main { max-width: 640px; margin: 0 auto; font-family: sans-serif; }
  h1 { color: #ff3e00; margin-bottom: 4px; }
  .lede { color: #555; margin-top: 0; font-size: 14px; line-height: 1.55; }
  section {
    margin: 18px 0;
    padding: 14px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
  }
  h2 { margin: 0 0 8px; color: #333; font-size: 16px; }
  .muted { color: #777; font-size: 13px; margin: 6px 0 10px; }
  code {
    background: #f3f3f3;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 12.5px;
  }

  .tab-bar {
    display: flex;
    gap: 4px;
    border-bottom: 2px solid #ddd;
  }
  .tab {
    padding: 8px 14px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    color: #666;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    font-family: sans-serif;
  }
  .tab:hover { color: #ff3e00; }
  .tab.active {
    border-bottom-color: #ff3e00;
    color: #ff3e00;
    font-weight: 700;
  }
  .tab-content {
    padding: 12px 4px;
  }
  .tab-content h3 {
    margin: 0 0 4px;
    color: #333;
    font-size: 14px;
  }
  .tab-content p {
    margin: 0;
    color: #555;
    font-size: 13px;
    line-height: 1.5;
  }

  .accordion-item {
    border: 1px solid #ddd;
    border-radius: 6px;
    margin: 6px 0;
    overflow: hidden;
  }
  .accordion-trigger {
    width: 100%;
    padding: 10px 14px;
    border: none;
    background: #f9f9f9;
    cursor: pointer;
    font-size: 14px;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: sans-serif;
    color: #333;
  }
  .accordion-trigger:hover { background: #f0f0f0; }
  .accordion-trigger.open {
    background: #fff7f2;
    color: #ff3e00;
    font-weight: 600;
  }
  .chev { font-size: 18px; color: #ff3e00; }
  .accordion-content {
    padding: 10px 14px;
    border-top: 1px solid #eee;
    background: white;
  }
  .accordion-content p {
    margin: 0;
    color: #555;
    font-size: 13px;
    line-height: 1.5;
  }

  .source {
    margin-top: 10px;
    font-size: 12px;
  }
  .source summary {
    cursor: pointer;
    color: #569cd6;
    font-weight: 600;
    user-select: none;
  }
  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 12px;
    border-radius: 6px;
    font-size: 11.5px;
    overflow-x: auto;
    margin-top: 8px;
    font-family: 'Fira Code', monospace;
    line-height: 1.5;
  }

  .why ul { padding-left: 20px; margin: 4px 0; }
  .why li { margin: 4px 0; color: #444; font-size: 13px; line-height: 1.5; }
  .why strong { color: #ff3e00; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
