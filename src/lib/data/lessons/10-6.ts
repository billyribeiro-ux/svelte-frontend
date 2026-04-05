import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-6',
		title: 'Packages & Dependencies',
		phase: 3,
		module: 10,
		lessonIndex: 6
	},
	description: `Real applications rely on external packages from npm. Understanding how to install, import, and use third-party libraries is essential for building production Svelte apps. The package.json file tracks your dependencies, and bundlers resolve imports automatically.

This lesson covers the mechanics of working with packages in a Svelte project, from installing a library to importing and using it. It also introduces the Svelte Ecosystem of April 2026 — eight community-maintained libraries that cover realtime networking, GPU shaders, documentation, accessible audio, dev inspection, cross-framework routing, and asset pipelines. Knowing what's available saves you from reinventing wheels.`,
	objectives: [
		'Understand the role of package.json and node_modules',
		'Import and use third-party packages in Svelte components',
		'Distinguish between dependencies and devDependencies',
		'Handle common package import patterns and side effects',
		'Know the curated Svelte Ecosystem libraries for April 2026'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // In a real project, you'd install packages with:
  // npm install date-fns
  // npm install -D @types/some-package

  // Then import them:
  // import { format, formatDistanceToNow } from 'date-fns';
  // import confetti from 'canvas-confetti';

  // For this lesson, we demonstrate the patterns without actual imports

  let now: Date = $state(new Date());
  let selectedFormat: string = $state('full');

  // Simulating what a date library would do
  function formatDate(date: Date, style: string): string {
    switch (style) {
      case 'full': return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      case 'short': return date.toLocaleDateString('en-US');
      case 'time': return date.toLocaleTimeString('en-US');
      case 'iso': return date.toISOString();
      default: return date.toString();
    }
  }

  // Simulating a utility library
  function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  let inputValue: number = $state(50);
  let clamped: number = $derived(clamp(inputValue, 0, 100));

  // === Svelte Ecosystem — April 2026 ===
  interface EcosystemLib {
    name: string;
    category: string;
    description: string;
    install: string;
    snippet: string;
  }

  const ecosystem: EcosystemLib[] = [
    {
      name: 'svelte-realtime',
      category: 'realtime',
      description: 'Realtime RPC and reactive subscriptions for SvelteKit, built on svelte-adapter-uws.',
      install: 'pnpm add svelte-realtime',
      snippet: \`import { subscribe, call } from 'svelte-realtime';

// Reactive subscription — auto-updates when server pushes
const posts = subscribe('posts');

// RPC call to a server method
async function addPost(title: string) {
  await call('posts.create', { title });
}\`
    },
    {
      name: 'itty-sockets',
      category: 'realtime',
      description: 'Ultra-tiny (~466 B gzipped) WebSocket client that pairs with an optional public relay. No API keys.',
      install: 'pnpm add itty-sockets',
      snippet: \`import { connect } from 'itty-sockets';

const room = connect('my-channel', {
  uid: crypto.randomUUID()
});

room.on('message', (msg, meta) => {
  console.log(meta.uid, 'said', msg);
});

room.send({ type: 'hello', text: 'world' });\`
    },
    {
      name: 'Motion GPU',
      category: 'graphics',
      description: 'Write WGSL shaders directly in Svelte components for GPU-accelerated effects.',
      install: 'pnpm add motion-gpu',
      snippet: \`<script lang="ts">
  import { Shader } from 'motion-gpu';
</script>

<Shader code={\\\`
  @fragment fn main(@location(0) uv: vec2f) -> @location(0) vec4f {
    return vec4f(uv, 0.5, 1.0);
  }
\\\`} />\`
    },
    {
      name: 'ptero',
      category: 'docs',
      description: 'Docusaurus-style documentation framework for Svelte — MDX-like content, built-in search, SSG output.',
      install: 'pnpm create ptero docs',
      snippet: \`// ptero.config.ts
import { defineConfig } from 'ptero';

export default defineConfig({
  title: 'My Docs',
  sidebar: [
    { label: 'Getting Started', path: '/start' },
    { label: 'API', path: '/api' }
  ]
});\`
    },
    {
      name: 'svelte-audio-ui',
      category: 'a11y',
      description: 'Accessible, composable audio UI components — players, equalizers, waveforms, volume sliders.',
      install: 'pnpm add svelte-audio-ui',
      snippet: \`<script lang="ts">
  import { Player, Waveform, VolumeSlider } from 'svelte-audio-ui';
  let src = $state('/song.mp3');
</script>

<Player {src}>
  <Waveform />
  <VolumeSlider />
</Player>\`
    },
    {
      name: 'svelte-agentation',
      category: 'devtools',
      description: 'Dev-mode inspector with source-aware element inspection and browser annotations.',
      install: 'pnpm add -D svelte-agentation',
      snippet: \`// src/routes/+layout.svelte
<script lang="ts">
  import 'svelte-agentation/init';
</script>

<!-- Click any element in the browser:
     jumps straight to the source file. -->\`
    },
    {
      name: 'cross-router',
      category: 'routing',
      description: 'Framework-agnostic router that wires its core navigation state into any framework\\'s reactivity model.',
      install: 'pnpm add cross-router',
      snippet: \`import { createRouter } from 'cross-router/svelte';

export const router = createRouter({
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
});

// router.current.params is a reactive $state\`
    },
    {
      name: 'svg-to-svelte',
      category: 'assets',
      description: 'Converts SVG strings directly into Svelte components — inline, no build step.',
      install: 'pnpm add svg-to-svelte',
      snippet: \`<script lang="ts">
  import { svg } from 'svg-to-svelte';
  const Icon = svg(\\\`<svg viewBox="0 0 24 24">
    <path d="M12 2L2 22h20z" />
  </svg>\\\`);
</script>

<Icon class="hero-icon" />\`
    }
  ];

  let selectedLib: EcosystemLib = $state(ecosystem[0]);
  let categoryFilter: string = $state('all');

  const categories = ['all', 'realtime', 'graphics', 'docs', 'a11y', 'devtools', 'routing', 'assets'];

  let visibleLibs = $derived(
    categoryFilter === 'all'
      ? ecosystem
      : ecosystem.filter((l) => l.category === categoryFilter)
  );
</script>

<main>
  <h1>Packages & Dependencies</h1>

  <section>
    <h2>Installing Packages</h2>
    <pre>{\`# Install a runtime dependency
npm install date-fns

# Install a dev-only dependency
npm install -D @sveltejs/adapter-auto

# package.json tracks everything:
{
  "dependencies": {
    "date-fns": "^3.6.0"    // needed at runtime
  },
  "devDependencies": {
    "@sveltejs/kit": "^2.0.0"  // needed only for building
  }
}\`}</pre>
  </section>

  <section>
    <h2>Using a Package</h2>
    <pre>{\`<script lang="ts">
  // Named imports (tree-shakeable)
  import { format, addDays } from 'date-fns';

  // Default import
  import confetti from 'canvas-confetti';

  // Type-only import (stripped at build time)
  import type { Duration } from 'date-fns';

  let formatted = format(new Date(), 'PPPP');
</script>\`}</pre>

    <h3>Live Demo (simulated)</h3>
    <select bind:value={selectedFormat}>
      <option value="full">Full Date</option>
      <option value="short">Short Date</option>
      <option value="time">Time Only</option>
      <option value="iso">ISO 8601</option>
    </select>
    <p>Formatted: <strong>{formatDate(now, selectedFormat)}</strong></p>
    <button onclick={() => now = new Date()}>Refresh Time</button>
  </section>

  <section>
    <h2>Common Patterns</h2>
    <pre>{\`// Re-exporting from a barrel file (index.ts)
export { default as Button } from './Button.svelte';
export { default as Input } from './Input.svelte';

// Importing CSS from a package
import 'some-package/styles.css';

// Dynamic import (code splitting)
const module = await import('heavy-library');\`}</pre>
  </section>

  <section>
    <h2>Utility Example: clamp()</h2>
    <label>
      Value: <input type="number" bind:value={inputValue} />
    </label>
    <p>clamp({inputValue}, 0, 100) = <strong>{clamped}</strong></p>
    <p><em>In a real app, you might use a library like "lodash-es" for utility functions.</em></p>
  </section>

  <section class="ecosystem">
    <h2>Svelte Ecosystem — April 2026</h2>
    <p class="eco-intro">
      Eight community libraries worth knowing. They cover the gaps between
      Svelte core and the problems real apps face.
    </p>

    <div class="eco-filter">
      {#each categories as cat (cat)}
        <button
          class:active={categoryFilter === cat}
          onclick={() => categoryFilter = cat}
        >
          {cat}
        </button>
      {/each}
    </div>

    <div class="eco-grid">
      {#each visibleLibs as lib (lib.name)}
        <button
          type="button"
          class="eco-card"
          class:selected={selectedLib.name === lib.name}
          onclick={() => selectedLib = lib}
        >
          <div class="eco-head">
            <strong>{lib.name}</strong>
            <span class="eco-cat">{lib.category}</span>
          </div>
          <p>{lib.description}</p>
        </button>
      {/each}
    </div>

    <div class="eco-detail">
      <h3>{selectedLib.name}</h3>
      <p class="eco-desc">{selectedLib.description}</p>
      <div class="eco-block">
        <div class="eco-label">Install</div>
        <pre class="eco-install">{selectedLib.install}</pre>
      </div>
      <div class="eco-block">
        <div class="eco-label">Usage</div>
        <pre class="eco-snippet">{selectedLib.snippet}</pre>
      </div>
    </div>
  </section>
</main>

<style>
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; }
  select, input[type="number"] { padding: 0.5rem; font-size: 1rem; }
  button { padding: 0.5rem 1rem; cursor: pointer; margin-top: 0.5rem; }
  label { display: flex; align-items: center; gap: 0.5rem; }
  .ecosystem { background: #fefce8; border-color: #facc15; }
  .eco-intro { font-size: 0.9rem; color: #854d0e; margin-bottom: 1rem; }
  .eco-filter { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1rem; }
  .eco-filter button {
    padding: 0.3rem 0.7rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    font-size: 0.75rem;
    text-transform: lowercase;
    color: #4b5563;
    cursor: pointer;
  }
  .eco-filter button.active { background: #facc15; border-color: #ca8a04; color: #713f12; font-weight: 600; }
  .eco-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.6rem;
    margin-bottom: 1rem;
  }
  .eco-card {
    text-align: left;
    padding: 0.75rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-left: 3px solid #facc15;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .eco-card:hover { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
  .eco-card.selected { border-color: #ca8a04; background: #fef3c7; }
  .eco-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; }
  .eco-head strong { color: #713f12; font-size: 0.9rem; }
  .eco-cat {
    font-size: 0.65rem;
    padding: 0.1rem 0.4rem;
    background: #fef3c7;
    color: #854d0e;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .eco-card p { margin: 0; font-size: 0.78rem; color: #4b5563; line-height: 1.4; }
  .eco-detail {
    padding: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-top: 0.5rem;
  }
  .eco-detail h3 { margin: 0 0 0.3rem; color: #713f12; }
  .eco-desc { font-size: 0.85rem; color: #4b5563; margin-bottom: 0.75rem; }
  .eco-block { margin-bottom: 0.6rem; }
  .eco-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }
  .eco-install {
    background: #0c4a6e;
    color: #bae6fd;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.8rem;
    margin: 0;
  }
  .eco-snippet {
    background: #111827;
    color: #e5e7eb;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.75rem;
    overflow-x: auto;
    margin: 0;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
