import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-10',
		title: 'Deployment',
		phase: 7,
		module: 19,
		lessonIndex: 10
	},
	description: `SvelteKit apps are deployed using adapters — plugins that transform your built application for a specific hosting platform. adapter-auto detects your platform; adapter-static generates a fully prerendered site; adapter-node produces a long-running Node.js server; adapter-vercel, adapter-cloudflare, adapter-netlify target their respective serverless and edge platforms. Your choice depends on whether you need SSR, long-running processes, edge locations, or just a static bundle on a CDN.

The deployment workflow is simple: pnpm build compiles your app, pnpm preview runs the production build locally, then you push to your hosting platform. Environment variables are configured per platform, split between \`$env/static/private\` (built-in) and \`$env/dynamic/private\` (runtime).`,
	objectives: [
		'Compare adapter-auto, -static, -node, -vercel, -cloudflare, -netlify',
		'Choose the right adapter based on SSR, edge, and runtime requirements',
		'Configure environment variables and distinguish static vs dynamic access',
		'Run a production build locally with pnpm build && pnpm preview',
		'Deploy a SvelteKit app to Vercel, Cloudflare Pages, or a Node server'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Tab = 'adapters' | 'wizard' | 'env' | 'build' | 'platforms';
  let activeTab = $state<Tab>('adapters');

  type Adapter = {
    id: string;
    name: string;
    package: string;
    ssr: boolean;
    edge: boolean;
    static: boolean;
    best: string;
    tradeoffs: string;
  };

  const adapters: Adapter[] = [
    {
      id: 'auto',
      name: 'adapter-auto',
      package: '@sveltejs/adapter-auto',
      ssr: true,
      edge: false,
      static: false,
      best: 'Prototyping and hosted platforms (Vercel, Netlify, Cloudflare, Azure)',
      tradeoffs: 'Detects platform at build time. Fine for getting started; switch to a specific adapter for production.'
    },
    {
      id: 'static',
      name: 'adapter-static',
      package: '@sveltejs/adapter-static',
      ssr: false,
      edge: false,
      static: true,
      best: 'Marketing sites, docs, blogs, anything fully prerenderable',
      tradeoffs: 'No server — every page must be prerendered. No server load functions at runtime.'
    },
    {
      id: 'node',
      name: 'adapter-node',
      package: '@sveltejs/adapter-node',
      ssr: true,
      edge: false,
      static: false,
      best: 'Self-hosted on VPS, Docker, Fly.io, Railway',
      tradeoffs: 'Long-running process. You manage scaling, logs, and restarts.'
    },
    {
      id: 'vercel',
      name: 'adapter-vercel',
      package: '@sveltejs/adapter-vercel',
      ssr: true,
      edge: true,
      static: true,
      best: 'Vercel — per-route edge vs serverless runtime',
      tradeoffs: 'Configure runtime per +page.server.ts. Cold starts on serverless routes.'
    },
    {
      id: 'cloudflare',
      name: 'adapter-cloudflare',
      package: '@sveltejs/adapter-cloudflare',
      ssr: true,
      edge: true,
      static: true,
      best: 'Cloudflare Pages + Workers — global edge, cheap',
      tradeoffs: 'Workers runtime: no Node APIs. Platform bindings (KV, D1, R2) via event.platform.'
    },
    {
      id: 'netlify',
      name: 'adapter-netlify',
      package: '@sveltejs/adapter-netlify',
      ssr: true,
      edge: true,
      static: true,
      best: 'Netlify — functions + edge functions',
      tradeoffs: 'Similar model to Vercel; edge functions are Deno-based.'
    }
  ];

  let selectedAdapter = $state(adapters[0]);

  // Wizard: pick-right-adapter flow
  type Q = { q: string; yes: string; no: string };
  const questions: Q[] = [
    { q: 'Does every page work without a server at request time?', yes: 'static', no: 'q2' },
    { q: 'Do you need Node APIs or long-running connections?', yes: 'node', no: 'q3' },
    { q: 'Is global edge latency critical?', yes: 'cloudflare', no: 'vercel' }
  ];

  let qIndex = $state(0);
  let recommendation = $state<string | null>(null);
  let path = $state<string[]>([]);

  function answer(yes: boolean) {
    const current = questions[qIndex];
    const next = yes ? current.yes : current.no;
    path = [...path, \`\${current.q} → \${yes ? 'Yes' : 'No'}\`];

    if (next.startsWith('q')) {
      qIndex = parseInt(next.slice(1)) - 1;
    } else {
      recommendation = next;
    }
  }

  function resetWizard() {
    qIndex = 0;
    recommendation = null;
    path = [];
  }

  const envCode = \`// src/lib/server/db.ts — static private env (build-time)
import { DATABASE_URL } from '$env/static/private';
// ^^ DATABASE_URL must be set at build time
// Tree-shaken into the bundle as a literal — no runtime access

// src/lib/server/stripe.ts — dynamic private env (runtime)
import { env } from '$env/dynamic/private';
export const stripe = new Stripe(env.STRIPE_KEY);
// ^^ read from process.env at runtime
// Required for values that change per deployment without rebuilds

// src/lib/flags.ts — static public env (shipped to client)
import { PUBLIC_GA_ID } from '$env/static/public';
// ^^ must start with PUBLIC_ — anything else is a build error

// .env (local dev only — gitignored)
DATABASE_URL=postgres://localhost/app
STRIPE_KEY=sk_test_xxx
PUBLIC_GA_ID=G-XXXXXX\`;

  const buildCode = \`# Standard production flow
$ pnpm build                  # compile to .svelte-kit/output
$ pnpm preview                # serve the build on localhost:4173
$ open http://localhost:4173  # smoke-test everything

# Inspect what was built
$ ls -lh build/               # (adapter-node example)

# Analyze bundle size
$ pnpm add -D rollup-plugin-visualizer
# add to vite.config.ts plugins
# then open stats.html after build\`;

  const platforms = {
    vercel: \`# Vercel (zero-config)
$ pnpm add -D @sveltejs/adapter-vercel
# svelte.config.js
import adapter from '@sveltejs/adapter-vercel';
export default { kit: { adapter: adapter({ runtime: 'nodejs20.x' }) } };

# Deploy
$ pnpm dlx vercel
# or connect the git repo in dashboard\`,
    cloudflare: \`# Cloudflare Pages
$ pnpm add -D @sveltejs/adapter-cloudflare
# svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';
export default { kit: { adapter: adapter() } };

# Deploy via Wrangler
$ pnpm dlx wrangler pages deploy .svelte-kit/cloudflare
# or connect the git repo in dashboard\`,
    node: \`# Node / Docker
$ pnpm add -D @sveltejs/adapter-node
# svelte.config.js
import adapter from '@sveltejs/adapter-node';
export default { kit: { adapter: adapter() } };

$ pnpm build
$ node build
# serves on PORT (default 3000)

# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
ENV PORT=3000
CMD ["node", "build"]\`
  };

  let platformTab = $state<'vercel' | 'cloudflare' | 'node'>('vercel');
</script>

<main>
  <h1>Deployment</h1>
  <p class="subtitle">Adapters, environments, and shipping your SvelteKit app</p>

  <nav class="tabs" aria-label="Sections">
    <button class:active={activeTab === 'adapters'} onclick={() => (activeTab = 'adapters')}>Adapters</button>
    <button class:active={activeTab === 'wizard'} onclick={() => (activeTab = 'wizard')}>Picker Wizard</button>
    <button class:active={activeTab === 'env'} onclick={() => (activeTab = 'env')}>Env Vars</button>
    <button class:active={activeTab === 'build'} onclick={() => (activeTab = 'build')}>Build</button>
    <button class:active={activeTab === 'platforms'} onclick={() => (activeTab = 'platforms')}>Platforms</button>
  </nav>

  {#if activeTab === 'adapters'}
    <section>
      <h2>Adapter Comparison</h2>
      <div class="adapter-grid">
        {#each adapters as a (a.id)}
          <button
            class="adapter-card"
            class:selected={selectedAdapter.id === a.id}
            onclick={() => (selectedAdapter = a)}
          >
            <div class="adapter-name">{a.name}</div>
            <div class="adapter-flags">
              {#if a.ssr}<span class="flag">SSR</span>{/if}
              {#if a.edge}<span class="flag edge">Edge</span>{/if}
              {#if a.static}<span class="flag static">Static</span>{/if}
            </div>
          </button>
        {/each}
      </div>

      <div class="adapter-detail">
        <h3>{selectedAdapter.name}</h3>
        <code class="pkg">{selectedAdapter.package}</code>
        <p><strong>Best for:</strong> {selectedAdapter.best}</p>
        <p><strong>Trade-offs:</strong> {selectedAdapter.tradeoffs}</p>
      </div>
    </section>
  {:else if activeTab === 'wizard'}
    <section>
      <h2>Pick the Right Adapter</h2>
      {#if !recommendation}
        <div class="wizard-card">
          <p class="wizard-q">{questions[qIndex].q}</p>
          <div class="wizard-actions">
            <button class="wizard-btn yes" onclick={() => answer(true)}>Yes</button>
            <button class="wizard-btn no" onclick={() => answer(false)}>No</button>
          </div>
        </div>
      {:else}
        {@const rec = adapters.find((a) => a.id === recommendation)}
        {#if rec}
          <div class="recommendation">
            <div class="rec-label">Recommended</div>
            <h3>{rec.name}</h3>
            <code class="pkg">{rec.package}</code>
            <p>{rec.best}</p>
            <button class="wizard-btn" onclick={resetWizard}>Start over</button>
          </div>
        {/if}
      {/if}

      {#if path.length > 0}
        <div class="path-log">
          <strong>Your answers:</strong>
          <ul>
            {#each path as p (p)}<li>{p}</li>{/each}
          </ul>
        </div>
      {/if}
    </section>
  {:else if activeTab === 'env'}
    <section>
      <h2>Environment Variables</h2>
      <p>SvelteKit provides four env modules. Pick the one matching your needs.</p>
      <table class="env-table">
        <thead><tr><th>Module</th><th>Visibility</th><th>Timing</th><th>Naming</th></tr></thead>
        <tbody>
          <tr><td><code>$env/static/private</code></td><td>server</td><td>build</td><td>any</td></tr>
          <tr><td><code>$env/dynamic/private</code></td><td>server</td><td>runtime</td><td>any</td></tr>
          <tr><td><code>$env/static/public</code></td><td>server + client</td><td>build</td><td>PUBLIC_*</td></tr>
          <tr><td><code>$env/dynamic/public</code></td><td>server + client</td><td>runtime</td><td>PUBLIC_*</td></tr>
        </tbody>
      </table>
      <pre><code>{envCode}</code></pre>
    </section>
  {:else if activeTab === 'build'}
    <section>
      <h2>Production Build</h2>
      <pre><code>{buildCode}</code></pre>
    </section>
  {:else}
    <section>
      <h2>Platform-Specific Deploys</h2>
      <div class="plat-tabs">
        {#each ['vercel', 'cloudflare', 'node'] as const as p (p)}
          <button class:active={platformTab === p} onclick={() => (platformTab = p)}>{p}</button>
        {/each}
      </div>
      <pre><code>{platforms[platformTab]}</code></pre>
    </section>
  {/if}
</main>

<style>
  main { max-width: 920px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  .subtitle { color: #666; margin-bottom: 1.5rem; }

  .tabs { display: flex; gap: 0.35rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e0e0e0; flex-wrap: wrap; }
  .tabs button { padding: 0.55rem 1rem; border: none; background: transparent; border-radius: 6px 6px 0 0; font-weight: 500; cursor: pointer; }
  .tabs button.active { background: #eef4fb; color: #1e40af; }

  section { margin-bottom: 2rem; }
  h2 { margin-top: 0; }

  .adapter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  .adapter-card {
    padding: 0.9rem;
    background: #f8f9fa;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    text-align: left;
    cursor: pointer;
  }
  .adapter-card.selected { border-color: #4a90d9; background: #eef4fb; }
  .adapter-name { font-weight: 700; margin-bottom: 0.35rem; }
  .adapter-flags { display: flex; gap: 0.3rem; flex-wrap: wrap; }
  .flag {
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
    background: #dbeafe;
    color: #1e40af;
  }
  .flag.edge { background: #fef3c7; color: #92400e; }
  .flag.static { background: #dcfce7; color: #166534; }

  .adapter-detail {
    background: #f8f9fa;
    padding: 1rem 1.25rem;
    border-radius: 10px;
    border-left: 4px solid #4a90d9;
  }
  .adapter-detail h3 { margin: 0 0 0.25rem; }
  .adapter-detail p { margin: 0.35rem 0; font-size: 0.9rem; }
  .pkg {
    display: inline-block;
    background: #111;
    color: #9ae6b4;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.78rem;
    margin-bottom: 0.5rem;
  }

  .wizard-card {
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 12px;
    text-align: center;
  }
  .wizard-q { font-size: 1.1rem; font-weight: 600; margin-bottom: 1.25rem; }
  .wizard-actions { display: flex; gap: 0.75rem; justify-content: center; }
  .wizard-btn {
    padding: 0.6rem 1.5rem;
    border: 2px solid #e0e0e0;
    background: white;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
  .wizard-btn.yes { border-color: #16a34a; color: #16a34a; }
  .wizard-btn.no { border-color: #dc2626; color: #dc2626; }

  .recommendation {
    padding: 1.5rem;
    background: #dcfce7;
    border-radius: 12px;
    border-left: 4px solid #16a34a;
  }
  .rec-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #166534; font-weight: 700; }
  .recommendation h3 { margin: 0.25rem 0 0.5rem; }

  .path-log { margin-top: 1rem; font-size: 0.85rem; color: #555; }
  .path-log ul { padding-left: 1.25rem; }

  .env-table { width: 100%; border-collapse: collapse; font-size: 0.86rem; margin-bottom: 1rem; }
  .env-table th, .env-table td { padding: 0.55rem; text-align: left; border-bottom: 1px solid #e0e0e0; }
  .env-table th { background: #f0f0f0; }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.76rem;
    line-height: 1.45;
    max-height: 560px;
  }
  pre code { background: none; padding: 0; }
  code { background: #f0f0f0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.82rem; }

  .plat-tabs { display: flex; gap: 0.35rem; margin-bottom: 0.75rem; }
  .plat-tabs button {
    padding: 0.35rem 0.8rem;
    border: 1px solid #ccc;
    background: white;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
    text-transform: capitalize;
  }
  .plat-tabs button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
