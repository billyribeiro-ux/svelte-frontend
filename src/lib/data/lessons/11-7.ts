import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '11-7',
		title: 'Link Options & Preloading',
		phase: 3,
		module: 11,
		lessonIndex: 7
	},
	description: `SvelteKit enhances anchor tags with special data attributes that control navigation behavior. data-sveltekit-preload-data starts loading a page's data when the user hovers over a link, making navigation feel instant. Other options control scroll behavior, history management, and reload preferences.

These link options let you fine-tune the navigation experience without writing JavaScript — just add attributes to your HTML.`,
	objectives: [
		'Use data-sveltekit-preload-data to preload page data on hover',
		'Control scroll behavior with data-sveltekit-noscroll',
		'Replace history entries with data-sveltekit-replacestate',
		'Understand the full set of link options available in SvelteKit'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // SvelteKit link options are data attributes on <a> tags
  // They control how navigation behaves

  interface LinkOption {
    attribute: string;
    description: string;
    values: string;
    example: string;
  }

  const linkOptions: LinkOption[] = [
    {
      attribute: 'data-sveltekit-preload-data',
      description: 'Preloads page data before click. Makes navigation feel instant.',
      values: '"hover" | "tap" | "off"',
      example: '<a href="/page" data-sveltekit-preload-data="hover">Fast Link</a>'
    },
    {
      attribute: 'data-sveltekit-preload-code',
      description: 'Preloads the page JavaScript module.',
      values: '"hover" | "tap" | "eager" | "viewport" | "off"',
      example: '<a href="/page" data-sveltekit-preload-code="viewport">Link</a>'
    },
    {
      attribute: 'data-sveltekit-noscroll',
      description: 'Prevents scrolling to top after navigation.',
      values: '(no value needed)',
      example: '<a href="/page" data-sveltekit-noscroll>Stay Here</a>'
    },
    {
      attribute: 'data-sveltekit-replacestate',
      description: 'Replaces current history entry instead of pushing.',
      values: '(no value needed)',
      example: '<a href="/page" data-sveltekit-replacestate>Replace</a>'
    },
    {
      attribute: 'data-sveltekit-reload',
      description: 'Forces a full page reload (skips client-side routing).',
      values: '(no value needed)',
      example: '<a href="/page" data-sveltekit-reload>Full Reload</a>'
    },
    {
      attribute: 'data-sveltekit-keepfocus',
      description: 'Keeps focus on the current element after navigation.',
      values: '(no value needed)',
      example: '<a href="/page" data-sveltekit-keepfocus>Keep Focus</a>'
    }
  ];

  let selectedOption: number = $state(0);
</script>

<main>
  <h1>Link Options & Preloading</h1>

  <section>
    <h2>Preloading Data</h2>
    <pre>{\`<!-- On a single link -->
<a href="/blog" data-sveltekit-preload-data="hover">
  Blog
</a>

<!-- On a parent element (applies to all links inside) -->
<nav data-sveltekit-preload-data="hover">
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/blog">Blog</a>
</nav>

<!-- In root +layout.svelte for the entire app -->
<body data-sveltekit-preload-data="hover">
  ...
</body>\`}</pre>
  </section>

  <section>
    <h2>All Link Options</h2>
    <div class="options-list">
      {#each linkOptions as option, i}
        <button
          class="option-btn"
          class:active={selectedOption === i}
          onclick={() => selectedOption = i}
        >
          {option.attribute.replace('data-sveltekit-', '')}
        </button>
      {/each}
    </div>

    {#each linkOptions as option, i}
      {#if selectedOption === i}
        <div class="option-detail">
          <h3><code>{option.attribute}</code></h3>
          <p>{option.description}</p>
          <p><strong>Values:</strong> <code>{option.values}</code></p>
          <pre>{option.example}</pre>
        </div>
      {/if}
    {/each}
  </section>

  <section>
    <h2>Common Patterns</h2>
    <pre>{\`<!-- Tab-style navigation: no scroll, replace state -->
<div class="tabs">
  <a
    href="/settings/profile"
    data-sveltekit-noscroll
    data-sveltekit-replacestate
  >Profile</a>
  <a
    href="/settings/security"
    data-sveltekit-noscroll
    data-sveltekit-replacestate
  >Security</a>
</div>

<!-- External link that bypasses SvelteKit -->
<a href="/api/download" data-sveltekit-reload>
  Download File
</a>\`}</pre>
  </section>
</main>

<style>
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9rem; }
  .options-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  .option-btn { padding: 0.4rem 0.75rem; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: white; font-size: 0.85rem; }
  .option-btn.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  .option-detail { background: #f0f7ff; padding: 1rem; border-radius: 4px; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
