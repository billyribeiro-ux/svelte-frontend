import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-10',
		title: 'Deployment',
		phase: 7,
		module: 19,
		lessonIndex: 10
	},
	description: `SvelteKit apps are deployed using adapters — plugins that transform your built application for a specific hosting platform. adapter-auto detects your platform automatically, while adapter-static generates a fully static site, adapter-node produces a Node.js server, and adapter-cloudflare deploys to Cloudflare Workers edge network.

The deployment workflow is simple: pnpm build compiles your app, pnpm preview tests the production build locally, then you deploy to your chosen platform. Environment variables are configured per platform for secrets and configuration.`,
	objectives: [
		'Compare SvelteKit adapters and choose the right one for your deployment target',
		'Build and preview a production SvelteKit application locally',
		'Configure environment variables for different deployment platforms',
		'Deploy a SvelteKit app to a hosting provider'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Adapter = {
    name: string;
    platform: string;
    description: string;
    pros: string[];
    cons: string[];
    config: string;
    envVars: string;
  };

  const adapters: Adapter[] = [
    {
      name: 'adapter-auto',
      platform: 'Auto-detect',
      description: 'Automatically selects the right adapter based on your deployment platform.',
      pros: ['Zero config for supported platforms', 'Works on Vercel, Netlify, Cloudflare Pages'],
      cons: ['Less control over output', 'May not support all platform features'],
      config: \`// svelte.config.js
import adapter from '@sveltejs/adapter-auto';

export default {
  kit: {
    adapter: adapter()
  }
};\`,
      envVars: \`# Vercel
VERCEL_ENV=production

# Netlify
NETLIFY=true\`
    },
    {
      name: 'adapter-static',
      platform: 'Static Hosting',
      description: 'Generates a fully static site. All pages are prerendered at build time.',
      pros: ['Fastest possible — CDN edge delivery', 'No server needed', 'Cheapest hosting'],
      cons: ['No dynamic SSR', 'No server endpoints', 'All routes must be prerenderable'],
      config: \`// svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: true
    })
  }
};\`,
      envVars: \`# GitHub Pages / Cloudflare Pages
# Just set PUBLIC_ prefixed env vars
PUBLIC_API_URL=https://api.example.com\`
    },
    {
      name: 'adapter-node',
      platform: 'Node.js Server',
      description: 'Produces a standalone Node.js server. Run anywhere Node is available.',
      pros: ['Full SSR support', 'Server endpoints', 'Run on any VPS/container'],
      cons: ['Requires a running server', 'More expensive hosting', 'Must manage Node process'],
      config: \`// svelte.config.js
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: true
    })
  }
};

// Start: node build/index.js\`,
      envVars: \`# Node.js environment
PORT=3000
HOST=0.0.0.0
ORIGIN=https://example.com
BODY_SIZE_LIMIT=512K

# .env file or platform env vars
DATABASE_URL=postgres://...
SECRET_KEY=your-secret-here\`
    },
    {
      name: 'adapter-cloudflare',
      platform: 'Cloudflare Workers',
      description: 'Deploys to Cloudflare Workers edge network for global low-latency SSR.',
      pros: ['Global edge network', 'Near-zero cold starts', 'Workers KV and D1 database'],
      cons: ['Workers runtime limitations', 'No Node.js APIs (no fs, path)', 'Execution time limits'],
      config: \`// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter({
      routes: {
        include: ['/*'],
        exclude: ['<all>']
      }
    })
  }
};

// wrangler.toml
// name = "my-app"
// compatibility_date = "2026-03-19"\`,
      envVars: \`# Cloudflare Workers
# Set via wrangler or dashboard
wrangler secret put DATABASE_URL
wrangler secret put API_KEY

# wrangler.toml for non-secret vars
[vars]
PUBLIC_SITE_NAME = "My App"\`
    }
  ];

  let activeAdapter = $state(0);

  type DeployStep = { step: string; command: string; description: string };

  const deployWorkflow: DeployStep[] = [
    { step: 'Install', command: 'pnpm install', description: 'Install all dependencies' },
    { step: 'Type Check', command: 'pnpm svelte-check', description: 'Verify TypeScript types' },
    { step: 'Lint', command: 'pnpm eslint .', description: 'Check code quality' },
    { step: 'Test', command: 'pnpm vitest run', description: 'Run unit tests' },
    { step: 'Build', command: 'pnpm build', description: 'Compile production bundle' },
    { step: 'Preview', command: 'pnpm preview', description: 'Test production build locally' },
    { step: 'Deploy', command: 'git push / wrangler deploy', description: 'Ship to production' }
  ];

  const envVarsCode = \`// SvelteKit env var patterns

// Public (available in browser + server)
// Must be prefixed with PUBLIC_
import { PUBLIC_API_URL } from '$env/static/public';

// Private (server-only, never sent to browser)
import { DATABASE_URL } from '$env/static/private';

// Dynamic env vars (read at runtime, not build time)
import { env } from '$env/dynamic/private';
const dbUrl = env.DATABASE_URL;

// In +page.server.ts / +server.ts only
import { SECRET_KEY } from '$env/static/private';

export async function load() {
  // SECRET_KEY is safe here — server only
  const data = await fetch(PUBLIC_API_URL, {
    headers: { Authorization: SECRET_KEY }
  });
  return { items: await data.json() };
}\`;
</script>

<main>
  <h1>Deployment</h1>
  <p class="subtitle">Adapters, build pipeline, and going live</p>

  <section class="workflow">
    <h2>Deploy Workflow</h2>
    <div class="steps">
      {#each deployWorkflow as step, i}
        <div class="workflow-step">
          <span class="step-num">{i + 1}</span>
          <div>
            <strong>{step.step}</strong>
            <code>{step.command}</code>
            <span class="step-desc">{step.description}</span>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section class="adapters">
    <h2>Adapters</h2>
    <div class="adapter-tabs">
      {#each adapters as adapter, i}
        <button class:active={activeAdapter === i} onclick={() => activeAdapter = i}>
          {adapter.platform}
        </button>
      {/each}
    </div>

    <div class="adapter-detail">
      <h3>{adapters[activeAdapter].name}</h3>
      <p>{adapters[activeAdapter].description}</p>

      <div class="columns">
        <div>
          <h4>Pros</h4>
          <ul class="pros">
            {#each adapters[activeAdapter].pros as pro}
              <li>{pro}</li>
            {/each}
          </ul>
        </div>
        <div>
          <h4>Cons</h4>
          <ul class="cons">
            {#each adapters[activeAdapter].cons as con}
              <li>{con}</li>
            {/each}
          </ul>
        </div>
      </div>

      <h4>Configuration</h4>
      <pre><code>{adapters[activeAdapter].config}</code></pre>

      <h4>Environment Variables</h4>
      <pre><code>{adapters[activeAdapter].envVars}</code></pre>
    </div>
  </section>

  <section>
    <h2>SvelteKit Env Vars</h2>
    <pre><code>{envVarsCode}</code></pre>
  </section>
</main>

<style>
  main {
    max-width: 850px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .subtitle { color: #666; margin-bottom: 2rem; }

  .steps {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .workflow-step {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 3px solid #4a90d9;
  }

  .step-num {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #4a90d9;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .workflow-step div {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .workflow-step code {
    background: #e8e8e8;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }

  .step-desc {
    color: #888;
    font-size: 0.85rem;
  }

  .adapter-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .adapter-tabs button {
    flex: 1;
    padding: 0.6rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.85rem;
  }

  .adapter-tabs button.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .adapter-detail {
    background: #fafafa;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
  }

  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .columns ul { padding-left: 1.2rem; }
  .columns li { margin-bottom: 0.3rem; font-size: 0.9rem; }
  .pros li::marker { content: '\u2713  '; color: #16a34a; }
  .cons li::marker { content: '\u2717  '; color: #dc2626; }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  h4 { margin-top: 1.25rem; margin-bottom: 0.5rem; }

  section { margin-bottom: 2.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
