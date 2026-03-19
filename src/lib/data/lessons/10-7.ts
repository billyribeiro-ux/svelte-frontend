import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-7',
		title: 'Compound Components',
		phase: 3,
		module: 10,
		lessonIndex: 7
	},
	description: `Compound components are a pattern where multiple related components work together through shared context. The classic example is a Tabs component: a parent Tabs component manages which tab is active, while individual Tab and TabPanel children register themselves and respond to selection — all without prop drilling.

This pattern leverages setContext/getContext to share state implicitly, giving you clean APIs where related components "just work" together.`,
	objectives: [
		'Build a compound component pattern using context for shared state',
		'Create Tabs/TabPanel components that communicate through context',
		'Manage registration and selection of child components',
		'Design clean component APIs that compose naturally'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Compound Component Pattern: Tabs
  // In a real app, Tabs, Tab, and TabPanel would be separate .svelte files
  // sharing context. Here we build the pattern in a single file.

  interface Tab {
    id: string;
    label: string;
  }

  let tabs: Tab[] = $state([
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' }
  ]);

  let activeTab: string = $state('overview');

  function selectTab(id: string) {
    activeTab = id;
  }

  // Second example: Accordion compound component
  let openPanel: string | null = $state(null);

  function togglePanel(id: string) {
    openPanel = openPanel === id ? null : id;
  }

  interface FaqItem {
    id: string;
    question: string;
    answer: string;
  }

  const faqs: FaqItem[] = [
    { id: 'what', question: 'What are compound components?', answer: 'A pattern where related components share state through context, providing a clean API that "just works" when composed together.' },
    { id: 'why', question: 'Why use this pattern?', answer: 'It avoids prop drilling, creates intuitive APIs, and keeps internal state management hidden from consumers.' },
    { id: 'when', question: 'When should I use this?', answer: 'When you have a group of components that always work together: Tabs/TabPanel, Accordion/Panel, Select/Option, Menu/MenuItem.' }
  ];
</script>

<main>
  <h1>Compound Components</h1>

  <!-- Pattern explanation -->
  <section>
    <h2>The Pattern</h2>
    <pre>{\`<!-- Clean API for consumers -->
<Tabs>
  <Tab id="one">First</Tab>
  <Tab id="two">Second</Tab>

  <TabPanel id="one">Content 1</TabPanel>
  <TabPanel id="two">Content 2</TabPanel>
</Tabs>

<!-- Tabs.svelte — provides context -->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();

  let active = $state('');
  setContext('tabs', {
    get active() { return active; },
    select(id: string) { active = id; }
  });
</script>
{@render children()}

<!-- Tab.svelte — reads context -->
<script lang="ts">
  import { getContext } from 'svelte';
  let { id, children } = $props();
  const tabs = getContext('tabs');
</script>
<button
  class:active={tabs.active === id}
  onclick={() => tabs.select(id)}
>{@render children()}</button>\`}</pre>
  </section>

  <!-- Live Tabs demo -->
  <section>
    <h2>Tabs Demo</h2>
    <div class="tabs">
      <div class="tab-bar" role="tablist">
        {#each tabs as tab}
          <button
            class="tab"
            class:active={activeTab === tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onclick={() => selectTab(tab.id)}
          >
            {tab.label}
          </button>
        {/each}
      </div>
      <div class="tab-content" role="tabpanel">
        {#if activeTab === 'overview'}
          <h3>Overview</h3>
          <p>Compound components work together through shared context. The parent manages state, children respond to it.</p>
        {:else if activeTab === 'features'}
          <h3>Features</h3>
          <ul>
            <li>No prop drilling</li>
            <li>Clean consumer API</li>
            <li>Encapsulated state management</li>
            <li>Flexible composition</li>
          </ul>
        {:else if activeTab === 'pricing'}
          <h3>Pricing</h3>
          <p>Free and open source — it's just a pattern!</p>
        {/if}
      </div>
    </div>
  </section>

  <!-- Accordion compound component demo -->
  <section>
    <h2>Accordion Demo</h2>
    <div class="accordion">
      {#each faqs as faq}
        <div class="accordion-item">
          <button
            class="accordion-header"
            class:open={openPanel === faq.id}
            onclick={() => togglePanel(faq.id)}
          >
            {faq.question}
            <span>{openPanel === faq.id ? '−' : '+'}</span>
          </button>
          {#if openPanel === faq.id}
            <div class="accordion-body">
              <p>{faq.answer}</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </section>
</main>

<style>
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  .tab-bar { display: flex; border-bottom: 2px solid #ddd; }
  .tab {
    padding: 0.75rem 1.25rem; border: none; background: none; cursor: pointer;
    font-size: 1rem; border-bottom: 2px solid transparent; margin-bottom: -2px;
  }
  .tab.active { border-bottom-color: #4a90d9; color: #4a90d9; font-weight: bold; }
  .tab-content { padding: 1rem; }
  .accordion-item { border: 1px solid #ddd; border-radius: 4px; margin-bottom: 0.5rem; overflow: hidden; }
  .accordion-header {
    width: 100%; padding: 0.75rem 1rem; border: none; background: #f9f9f9;
    cursor: pointer; font-size: 1rem; text-align: left; display: flex;
    justify-content: space-between; align-items: center;
  }
  .accordion-header.open { background: #e3f2fd; }
  .accordion-body { padding: 0.75rem 1rem; border-top: 1px solid #ddd; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
