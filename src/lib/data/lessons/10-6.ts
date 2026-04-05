import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-6',
		title: 'Packages & Dependencies',
		phase: 3,
		module: 10,
		lessonIndex: 6
	},
	description: `Real applications are glued together from **packages** — small, versioned units of code published to a registry (npm) and installed via a package manager (\`npm\`, \`pnpm\`, \`yarn\`, or \`bun\`). Understanding the mechanics of this ecosystem is essential the moment you step outside of a single-file playground.

**\`package.json\`** is the contract of your project. It declares:

- **\`dependencies\`** — packages needed at runtime in the browser or on the server. Examples: \`date-fns\`, \`zod\`, \`svelte\` itself.
- **\`devDependencies\`** — tools used only during development or at build time: \`vite\`, \`typescript\`, \`@sveltejs/kit\`, linters, formatters. Not shipped to production.
- **\`peerDependencies\`** — what the package expects its *host* project to provide (common for plugins and component libraries).
- **\`scripts\`** — named shortcuts run with \`npm run <name>\`.

**Semver** — version numbers have the form \`MAJOR.MINOR.PATCH\`. \`^3.6.0\` means "anything compatible with 3.6.0" (i.e. \`< 4.0.0\`). \`~3.6.0\` is stricter — only patch bumps. An exact pin like \`3.6.0\` accepts only that version.

**\`pnpm\` vs \`npm\` vs \`yarn\`** — for Svelte projects in 2026, **pnpm** is the de-facto standard: it's dramatically faster, uses hard links to share packages across projects (saving disk space), and catches phantom-dependency bugs by default. Commands mirror npm: \`pnpm add foo\`, \`pnpm add -D foo\`, \`pnpm install\`, \`pnpm dlx create-svelte\`.

**Install flags** worth knowing:
- \`-D\` / \`--save-dev\` — adds to \`devDependencies\`.
- \`-E\` / \`--save-exact\` — pins the exact version, no \`^\`.
- \`--save-peer\` — adds to \`peerDependencies\`.
- \`-g\` / \`--global\` — installs system-wide (prefer \`pnpm dlx\` / \`npx\` for one-shot runs).

**Importing** — ES modules let you pull in just what you need. Bundlers like Vite tree-shake unused exports, so \`import { format } from 'date-fns'\` only bills you for \`format\` in the final bundle. Dynamic \`import()\` gives you code splitting: the imported module becomes its own chunk and loads on demand.

Beyond the mechanics, this lesson also tours the **Svelte Ecosystem — April 2026**: eight community-maintained libraries worth knowing, covering realtime networking, GPU shaders, documentation, accessible audio, dev inspection, cross-framework routing, and asset pipelines. Click through the cards to see install commands and usage snippets.`,
	objectives: [
		'Understand package.json, node_modules, and the role of a lockfile',
		'Distinguish between dependencies, devDependencies, and peerDependencies',
		'Read and write semver ranges with ^, ~, and exact pins',
		'Pick between npm, pnpm, and yarn, and know the common install flags',
		'Use named, default, type-only, and dynamic imports effectively',
		'Avoid side-effect imports and understand tree-shaking',
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
<\\/script>

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
<\\/script>

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
<\\/script>

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
<\\/script>

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
    <h2>1. Package managers &amp; install flags</h2>
    <p>
      Svelte projects in 2026 overwhelmingly use <strong>pnpm</strong>.
      It's faster than <code>npm</code>, uses content-addressed
      hard links to share packages across every project on your
      machine, and refuses to resolve "phantom dependencies"
      by default. Commands are near-identical:
    </p>
    <pre>{\`# Create a new SvelteKit app
pnpm create svelte@latest my-app
cd my-app
pnpm install

# Add a runtime dependency
pnpm add date-fns              # or: npm install date-fns

# Add a dev-only dependency
pnpm add -D vitest             # or: npm install -D vitest

# Pin an exact version (no ^)
pnpm add -E zod@3.23.8

# Run a one-shot tool without installing it permanently
pnpm dlx degit user/repo my-clone
\`}</pre>
    <p class="hint">
      <code>-D</code> puts the package in <code>devDependencies</code>.
      <code>-E</code> writes the exact version with no caret.
      <code>dlx</code> is the pnpm equivalent of <code>npx</code>.
    </p>
  </section>

  <section>
    <h2>2. <code>package.json</code> anatomy</h2>
    <pre>{\`{
  "name": "my-app",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-check --tsconfig ./tsconfig.json",
    "test": "vitest"
  },
  "dependencies": {
    "date-fns": "^3.6.0",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "@sveltejs/adapter-auto": "^3.0.0",
    "@sveltejs/kit": "^2.0.0",
    "svelte": "^5.40.0",
    "typescript": "^5.5.0",
    "vite": "^5.0.0"
  }
}\`}</pre>
    <p class="hint">
      <code>dependencies</code> ship to production.
      <code>devDependencies</code> are only installed when you
      run <code>pnpm install</code> in development — CI/CD
      servers install both; production deploys skip dev deps.
    </p>
  </section>

  <section>
    <h2>3. Semver ranges</h2>
    <pre>{\`"^3.6.0"  // >=3.6.0 <4.0.0   (caret: compatible)
"~3.6.0"  //  >=3.6.0 <3.7.0   (tilde: patch only)
"3.6.0"   //  exactly 3.6.0    (pinned)
">=3.6"   //  3.6 or later     (open-ended — avoid)
"*"       //  literally any    (never do this)\`}</pre>
    <p class="hint">
      Default to <code>^</code>. Pin (<code>-E</code>) for
      security-sensitive libraries and for anything where a
      minor version bump has historically broken you.
    </p>
    <p>
      The exact version that actually got installed is recorded
      in your <strong>lockfile</strong>
      (<code>pnpm-lock.yaml</code>, <code>package-lock.json</code>,
      or <code>yarn.lock</code>). Commit it! It's what keeps
      every teammate and every deploy on identical trees.
    </p>
  </section>

  <section>
    <h2>4. Importing flavours</h2>
    <p>
      ES modules let you pull in exactly what you want. Bundlers
      like Vite statically analyse imports and strip unused
      exports — "tree shaking" — so you only ship the code you
      actually used.
    </p>
    <pre>{\`<script lang="ts">
  // Named imports — tree-shakeable.
  // If you only use format(), addDays() never ships.
  import { format, addDays } from 'date-fns';

  // Default import — one primary export per package.
  import confetti from 'canvas-confetti';

  // Namespace import — everything under one name.
  import * as mathHelpers from 'my-math-lib';

  // Type-only import — stripped entirely at build time.
  // No runtime cost, even if the package is dev-only.
  import type { Duration } from 'date-fns';

  // Re-export from a barrel file.
  export { default as Button } from './Button.svelte';

  // Side-effect-only import — runs the module's top level
  // but binds no names. Common for polyfills and CSS.
  import 'normalize.css';

  // Dynamic import — returns a Promise. Becomes a separate
  // chunk in the bundle, loaded on demand.
  async function loadHeavyThing() {
    const mod = await import('./heavy.js');
    return mod.default;
  }
</script>\`}</pre>
    <p class="hint">
      Prefer <strong>named imports</strong> whenever possible —
      they give the bundler the most information for
      tree-shaking. Avoid side-effect imports except for CSS
      and polyfills you genuinely need.
    </p>

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
    <h2>5. Finding trustworthy packages</h2>
    <p>
      Before you add a dependency, spend thirty seconds on its
      npm page:
    </p>
    <ul>
      <li>
        <strong>Weekly downloads</strong> — is anyone using it?
        Under a few thousand is a red flag for a library you'd
        put on a critical path.
      </li>
      <li>
        <strong>Last publish date</strong> — a package that
        hasn't been touched in two years is fine for stable
        utilities, scary for anything touching the network,
        auth, or security.
      </li>
      <li>
        <strong>Bundle size</strong> — check
        <code>bundlephobia.com</code>. A 300 KB library that
        formats dates has alternatives.
      </li>
      <li>
        <strong>Open issues &amp; PRs</strong> — responsive
        maintainers matter more than star counts.
      </li>
      <li>
        <strong>License</strong> — MIT, ISC, and Apache-2.0
        are safe defaults. Avoid GPL in commercial closed
        source unless you know what you're agreeing to.
      </li>
    </ul>
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
