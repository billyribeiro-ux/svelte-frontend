import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '20-7',
		title: 'Deploy & Ship',
		phase: 7,
		module: 20,
		lessonIndex: 7
	},
	description: `This is it. Your capstone is built, tested, audited, and ready. The last lesson is the ship. You pick your adapter, set environment variables, run the production build, point DNS at your deployment, add monitoring, and push to main. Everything you learned — runes, SvelteKit, CSS architecture, testing, SEO — comes together as a live URL people can visit.

Work through the final checklist. When it is green, you ship.`,
	objectives: [
		'Complete a pre-deployment checklist: build, env, adapter, DNS, monitoring',
		'Pick and configure the right adapter for your hosting platform',
		'Set environment variables on the hosting dashboard',
		'Configure a custom domain with DNS records',
		'Set up monitoring and error reporting for production'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Tab = 'checklist' | 'adapter' | 'env' | 'dns' | 'monitoring' | 'launch';
  let activeTab = $state<Tab>('checklist');

  // Launch checklist
  type Phase = {
    name: string;
    items: { label: string; done: boolean }[];
  };

  let phases = $state<Phase[]>([
    {
      name: '1. Build',
      items: [
        { label: 'pnpm install --frozen-lockfile', done: false },
        { label: 'pnpm check passes', done: false },
        { label: 'pnpm lint passes', done: false },
        { label: 'pnpm test:unit passes', done: false },
        { label: 'pnpm exec playwright test passes', done: false },
        { label: 'pnpm build succeeds', done: false },
        { label: 'pnpm preview smoke tested', done: false }
      ]
    },
    {
      name: '2. Adapter',
      items: [
        { label: 'Correct adapter installed for platform', done: false },
        { label: 'svelte.config.js updated', done: false },
        { label: 'Platform-specific config (runtime, regions) set', done: false }
      ]
    },
    {
      name: '3. Environment',
      items: [
        { label: 'Production env vars set on hosting dashboard', done: false },
        { label: 'PUBLIC_ vars verified', done: false },
        { label: 'Secrets rotated / fresh API keys', done: false }
      ]
    },
    {
      name: '4. Domain & DNS',
      items: [
        { label: 'Custom domain added in hosting dashboard', done: false },
        { label: 'DNS records updated (A / CNAME)', done: false },
        { label: 'SSL certificate issued', done: false },
        { label: 'WWW → apex redirect (or vice versa)', done: false }
      ]
    },
    {
      name: '5. Monitoring',
      items: [
        { label: 'Error reporting (Sentry / LogSnag) wired', done: false },
        { label: 'Uptime check configured', done: false },
        { label: 'Analytics (Plausible / Fathom / GA) added', done: false },
        { label: 'Log drain / alerts set up', done: false }
      ]
    },
    {
      name: '6. Launch',
      items: [
        { label: 'Final production build deployed', done: false },
        { label: 'Smoke tested live URL', done: false },
        { label: 'Sitemap submitted to Google Search Console', done: false },
        { label: 'Announce!', done: false }
      ]
    }
  ]);

  let totalItems = $derived(phases.reduce((sum, p) => sum + p.items.length, 0));
  let doneItems = $derived(phases.reduce((sum, p) => sum + p.items.filter((i) => i.done).length, 0));
  let percent = $derived(Math.round((doneItems / totalItems) * 100));
  let launched = $derived(doneItems === totalItems);

  function toggleItem(phaseIdx: number, itemIdx: number) {
    const next = [...phases];
    next[phaseIdx] = {
      ...next[phaseIdx],
      items: next[phaseIdx].items.map((it, i) =>
        i === itemIdx ? { ...it, done: !it.done } : it
      )
    };
    phases = next;
  }

  const adapterCode = \`// svelte.config.js — production adapter
import adapter from '@sveltejs/adapter-vercel';  // or cloudflare, node, static
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      runtime: 'nodejs20.x',
      regions: ['iad1'],
      memory: 1024
    }),
    alias: {
      $components: 'src/lib/components',
      $state: 'src/lib/state'
    },
    prerender: {
      crawl: true,
      handleHttpError: 'warn'
    }
  }
};\`;

  const envCode = \`# Production env vars (set in hosting dashboard)

DATABASE_URL=postgres://prod-db.../app
STRIPE_SECRET_KEY=sk_live_xxx
RESEND_API_KEY=re_live_xxx
AUTH_SECRET=<long random string>
PUBLIC_APP_URL=https://acme.dev
PUBLIC_GA_ID=G-XXXXXX

# Local dev (.env — gitignored)
DATABASE_URL=postgres://localhost/app
STRIPE_SECRET_KEY=sk_test_xxx
PUBLIC_APP_URL=http://localhost:5173\`;

  const dnsCode = \`# DNS records for acme.dev

# Apex (A record or ALIAS)
Type    Name    Value
A       @       76.76.21.21        # (Vercel example)
ALIAS   @       acme.dev.cdn.net   # (Cloudflare example)

# WWW subdomain
CNAME   www     cname.vercel-dns.com.

# Redirect www → apex
# (configure in hosting dashboard)

# Verify
$ dig acme.dev
$ curl -I https://acme.dev
HTTP/2 200
strict-transport-security: max-age=63072000\`;

  const monitoringCode = \`// src/hooks.client.ts — Sentry setup
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: 'https://...@sentry.io/...',
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  integrations: [Sentry.replayIntegration()]
});

export const handleError = Sentry.handleErrorWithSentry();

// src/hooks.server.ts — server-side
import * as Sentry from '@sentry/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';

Sentry.init({ dsn: 'https://...@sentry.io/...', environment: 'production' });

export const handle = sequence(Sentry.sentryHandle());
export const handleError = Sentry.handleErrorWithSentry();\`;

  const launchSpeech = \`Module 0 — Welcome.
Module 1 — Runes.
Module 2 — Derived & Effect.
Module 3 — Snippets & Events.
Modules 4-7 — Components, context, stores, bindings.
Modules 8-11 — SvelteKit fundamentals, routing, layouts, data loading.
Modules 12-14 — Forms, API routes, error handling.
Modules 15-17 — Advanced rendering, ISR, hooks.
Module 18 — SEO.
Module 19 — Production tooling.
Module 20 — Capstone.

You built it. You tested it. You shipped it.

Now go make something people love.\`;
</script>

<main>
  <h1>Deploy & Ship</h1>
  <p class="subtitle">The final mile — take your capstone live</p>

  <nav class="tabs" aria-label="Sections">
    <button class:active={activeTab === 'checklist'} onclick={() => (activeTab = 'checklist')}>Checklist</button>
    <button class:active={activeTab === 'adapter'} onclick={() => (activeTab = 'adapter')}>Adapter</button>
    <button class:active={activeTab === 'env'} onclick={() => (activeTab = 'env')}>Env Vars</button>
    <button class:active={activeTab === 'dns'} onclick={() => (activeTab = 'dns')}>DNS</button>
    <button class:active={activeTab === 'monitoring'} onclick={() => (activeTab = 'monitoring')}>Monitoring</button>
    <button class:active={activeTab === 'launch'} onclick={() => (activeTab = 'launch')}>Launch</button>
  </nav>

  {#if activeTab === 'checklist'}
    <section>
      <h2>Ship Checklist</h2>
      <div class="progress">
        <div class="progress-bar"><div class="progress-fill" class:ready={launched} style="width: {percent}%"></div></div>
        <span class="progress-num">{doneItems} / {totalItems}</span>
      </div>

      {#each phases as phase, pi (phase.name)}
        <div class="phase">
          <h3>{phase.name}</h3>
          {#each phase.items as item, ii (item.label)}
            <button class="item" class:done={item.done} onclick={() => toggleItem(pi, ii)}>
              <span class="cbox">{item.done ? '✓' : ''}</span>
              <span>{item.label}</span>
            </button>
          {/each}
        </div>
      {/each}
    </section>
  {:else if activeTab === 'adapter'}
    <section>
      <h2>Adapter Configuration</h2>
      <pre><code>{adapterCode}</code></pre>
    </section>
  {:else if activeTab === 'env'}
    <section>
      <h2>Environment Variables</h2>
      <pre><code>{envCode}</code></pre>
    </section>
  {:else if activeTab === 'dns'}
    <section>
      <h2>Domain & DNS</h2>
      <pre><code>{dnsCode}</code></pre>
    </section>
  {:else if activeTab === 'monitoring'}
    <section>
      <h2>Monitoring & Error Reporting</h2>
      <pre><code>{monitoringCode}</code></pre>
    </section>
  {:else}
    <section>
      <h2>You Are Ready</h2>
      {#if launched}
        <div class="celebrate">
          <h3>SHIPPED</h3>
          <p>Every phase complete. Your capstone is live.</p>
          <pre class="speech"><code>{launchSpeech}</code></pre>
        </div>
      {:else}
        <div class="pending">
          <p>Progress: <strong>{percent}%</strong></p>
          <p>Head back to the Checklist tab and finish the remaining items. You are {totalItems - doneItems} steps away from launch.</p>
        </div>
      {/if}
    </section>
  {/if}
</main>

<style>
  main { max-width: 900px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  .subtitle { color: #666; margin-bottom: 1.5rem; }

  .tabs { display: flex; gap: 0.35rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e0e0e0; flex-wrap: wrap; }
  .tabs button { padding: 0.55rem 1rem; border: none; background: transparent; border-radius: 6px 6px 0 0; font-weight: 500; cursor: pointer; font-size: 0.86rem; }
  .tabs button.active { background: #eef4fb; color: #1e40af; }

  section { margin-bottom: 2rem; }
  h2 { margin-top: 0; }

  .progress { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
  .progress-bar { flex: 1; background: #e5e7eb; border-radius: 999px; height: 10px; overflow: hidden; }
  .progress-fill { background: #4a90d9; height: 100%; transition: width 200ms; }
  .progress-fill.ready { background: #16a34a; }
  .progress-num { font-weight: 700; font-family: monospace; font-size: 0.85rem; }

  .phase { margin-bottom: 1.25rem; }
  .phase h3 {
    margin: 0 0 0.5rem;
    font-size: 0.95rem;
    color: #1e40af;
    font-weight: 700;
  }
  .item {
    display: flex;
    gap: 0.6rem;
    align-items: center;
    padding: 0.5rem 0.8rem;
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    width: 100%;
    font-size: 0.88rem;
    margin-bottom: 0.3rem;
  }
  .item.done { background: #dcfce7; border-color: #16a34a; }
  .cbox {
    width: 20px; height: 20px;
    border: 2px solid #888;
    border-radius: 4px;
    display: grid;
    place-items: center;
    font-weight: bold;
    color: #16a34a;
    flex-shrink: 0;
  }
  .item.done .cbox { border-color: #16a34a; }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
    line-height: 1.5;
    max-height: 520px;
  }
  pre code { background: none; padding: 0; }
  code { background: #f0f0f0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.82rem; }

  .celebrate {
    padding: 2rem;
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    border-radius: 16px;
    text-align: center;
  }
  .celebrate h3 {
    margin: 0 0 0.5rem;
    font-size: 2.25rem;
    letter-spacing: 0.1em;
    color: #166534;
  }
  .celebrate p { margin: 0 0 1rem; color: #166534; font-weight: 600; }
  .speech {
    text-align: left;
    font-size: 0.78rem;
    background: #0a0a0a;
    color: #86efac;
  }

  .pending {
    padding: 1.5rem;
    background: #fef3c7;
    border-radius: 10px;
    border-left: 4px solid #f59e0b;
    text-align: center;
  }
  .pending p { margin: 0.3rem 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
