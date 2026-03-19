import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '20-7',
		title: 'Deploy & Ship',
		phase: 7,
		module: 20,
		lessonIndex: 7
	},
	description: `This is it — the final step. Your capstone project is built, tested, and audited. Now you deploy it to the world. This lesson covers the complete deployment checklist: choosing an adapter, configuring environment variables, building the production bundle, setting up DNS, and pushing to your hosting platform.

You have learned everything from Svelte 5 runes to SvelteKit architecture, from CSS design systems to SEO optimization. Now ship it. Your application goes LIVE.`,
	objectives: [
		'Complete a pre-deployment checklist covering build, tests, and configuration',
		'Configure the appropriate SvelteKit adapter for your hosting platform',
		'Set up environment variables, DNS, and SSL for production',
		'Deploy a SvelteKit application to production and verify it is live'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type ChecklistSection = {
    title: string;
    items: { task: string; done: boolean; critical: boolean }[];
  };

  let checklist = $state<ChecklistSection[]>([
    {
      title: 'Pre-Build Checks',
      items: [
        { task: 'pnpm svelte-check passes with no errors', done: true, critical: true },
        { task: 'pnpm eslint . passes with no errors', done: true, critical: true },
        { task: 'pnpm vitest run — all unit tests pass', done: true, critical: true },
        { task: 'pnpm playwright test — all E2E tests pass', done: true, critical: true },
        { task: 'All TypeScript types are correct', done: true, critical: true }
      ]
    },
    {
      title: 'Build',
      items: [
        { task: 'pnpm build completes without errors', done: true, critical: true },
        { task: 'pnpm preview — test production build locally', done: true, critical: true },
        { task: 'Bundle size is reasonable (check build output)', done: true, critical: false },
        { task: 'No console.log statements in production code', done: false, critical: false }
      ]
    },
    {
      title: 'SEO & Performance',
      items: [
        { task: 'Lighthouse Performance >= 90', done: true, critical: true },
        { task: 'Lighthouse Accessibility >= 95', done: true, critical: true },
        { task: 'Lighthouse SEO = 100', done: true, critical: true },
        { task: 'sitemap.xml is generated and accessible', done: true, critical: true },
        { task: 'robots.txt is configured correctly', done: true, critical: true },
        { task: 'JSON-LD structured data validates', done: true, critical: false },
        { task: 'OG image works when shared on social', done: false, critical: false }
      ]
    },
    {
      title: 'Configuration',
      items: [
        { task: 'Adapter selected and configured in svelte.config.js', done: true, critical: true },
        { task: 'Environment variables set on hosting platform', done: false, critical: true },
        { task: 'ORIGIN env var set (for form actions)', done: false, critical: true },
        { task: 'Database/API credentials configured', done: false, critical: true }
      ]
    },
    {
      title: 'DNS & Domain',
      items: [
        { task: 'Custom domain purchased and verified', done: false, critical: false },
        { task: 'DNS records pointing to hosting provider', done: false, critical: false },
        { task: 'SSL/TLS certificate active (HTTPS)', done: false, critical: true },
        { task: 'www redirect configured', done: false, critical: false }
      ]
    },
    {
      title: 'Post-Deploy',
      items: [
        { task: 'Verify all pages load correctly', done: false, critical: true },
        { task: 'Submit sitemap to Google Search Console', done: false, critical: false },
        { task: 'Test forms and interactive features', done: false, critical: true },
        { task: 'Monitor error logs for first 24 hours', done: false, critical: false },
        { task: 'Set up uptime monitoring', done: false, critical: false }
      ]
    }
  ]);

  let totalItems = $derived(checklist.flatMap(s => s.items).length);
  let doneItems = $derived(checklist.flatMap(s => s.items).filter(i => i.done).length);
  let progress = $derived(Math.round((doneItems / totalItems) * 100));

  function toggleItem(sectionIndex: number, itemIndex: number) {
    checklist[sectionIndex].items[itemIndex].done = !checklist[sectionIndex].items[itemIndex].done;
  }

  // Deploy commands per platform
  type Platform = {
    name: string;
    adapter: string;
    deployCommand: string;
    envSetup: string;
  };

  const platforms: Platform[] = [
    {
      name: 'Vercel',
      adapter: 'adapter-auto',
      deployCommand: \`# Connect GitHub repo to Vercel
# Or deploy manually:
pnpm i -g vercel
vercel --prod\`,
      envSetup: \`# Vercel Dashboard > Settings > Environment Variables
# Or via CLI:
vercel env add DATABASE_URL production
vercel env add SECRET_KEY production\`
    },
    {
      name: 'Cloudflare Pages',
      adapter: 'adapter-cloudflare',
      deployCommand: \`# Connect GitHub repo to Cloudflare Pages
# Build command: pnpm build
# Output directory: .svelte-kit/cloudflare

# Or with Wrangler:
pnpm wrangler pages deploy .svelte-kit/cloudflare\`,
      envSetup: \`# Cloudflare Dashboard > Pages > Settings > Environment variables
# Or wrangler.toml for non-secrets:
[vars]
PUBLIC_SITE_URL = "https://my-app.com"

# Secrets via CLI:
wrangler secret put DATABASE_URL\`
    },
    {
      name: 'Node.js / Docker',
      adapter: 'adapter-node',
      deployCommand: \`# Build
pnpm build

# Run directly
PORT=3000 ORIGIN=https://my-app.com node build/index.js

# Or with Docker
docker build -t my-app .
docker run -p 3000:3000 -e ORIGIN=https://my-app.com my-app\`,
      envSetup: \`# .env file (not committed to git)
PORT=3000
HOST=0.0.0.0
ORIGIN=https://my-app.com
DATABASE_URL=postgres://user:pass@host/db
SECRET_KEY=your-secret\`
    },
    {
      name: 'Static (GitHub Pages)',
      adapter: 'adapter-static',
      deployCommand: \`# Build static site
pnpm build

# Deploy to GitHub Pages
# .github/workflows/deploy.yml
name: Deploy
on:
  push: { branches: [main] }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install && pnpm build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \\\${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build\`,
      envSetup: \`# Static sites only support PUBLIC_ env vars
# Set at build time:
PUBLIC_API_URL=https://api.example.com pnpm build\`
    }
  ];

  let activePlatform = $state(0);
</script>

<main>
  <h1>Deploy & Ship</h1>
  <p class="subtitle">The final step — your application goes LIVE</p>

  <section class="progress-section">
    <div class="progress-header">
      <h2>Deployment Checklist</h2>
      <span class="progress-text">{doneItems}/{totalItems} ({progress}%)</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progress}%"></div>
    </div>
  </section>

  <section class="checklist">
    {#each checklist as section, si}
      <div class="checklist-section">
        <h3>{section.title}</h3>
        {#each section.items as item, ii}
          <label class="check-item" class:critical={item.critical && !item.done}>
            <input type="checkbox" checked={item.done} onchange={() => toggleItem(si, ii)} />
            <span class:done={item.done}>
              {item.task}
              {#if item.critical && !item.done}
                <span class="critical-badge">required</span>
              {/if}
            </span>
          </label>
        {/each}
      </div>
    {/each}
  </section>

  <section class="platforms">
    <h2>Deploy to Platform</h2>
    <div class="platform-tabs">
      {#each platforms as platform, i}
        <button class:active={activePlatform === i} onclick={() => activePlatform = i}>
          {platform.name}
        </button>
      {/each}
    </div>

    <div class="platform-detail">
      <p><strong>Adapter:</strong> <code>{platforms[activePlatform].adapter}</code></p>

      <h4>Deploy Command</h4>
      <pre><code>{platforms[activePlatform].deployCommand}</code></pre>

      <h4>Environment Variables</h4>
      <pre><code>{platforms[activePlatform].envSetup}</code></pre>
    </div>
  </section>

  <section class="ship-it">
    <div class="ship-banner">
      <h2>You did it.</h2>
      <p>From <code>$state</code> to <code>$derived</code>, from <code>&lt;svelte:head&gt;</code> to JSON-LD, from Vitest to Playwright, from <code>@layer</code> to deployment — you have mastered Svelte 5, SvelteKit, SEO, and the full PE7 development workflow.</p>
      <p class="final"><strong>Now push that commit and ship your project to the world.</strong></p>
      <pre class="ship-cmd"><code>git add . && git commit -m "ready to ship" && git push</code></pre>
    </div>
  </section>
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .subtitle { color: #666; margin-bottom: 2rem; }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .progress-text {
    font-weight: 600;
    color: #4a90d9;
  }

  .progress-bar {
    height: 12px;
    background: #e0e0e0;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4a90d9, #16a34a);
    border-radius: 6px;
    transition: width 0.3s ease;
  }

  .checklist-section {
    margin-bottom: 1.5rem;
  }

  .checklist-section h3 {
    margin-bottom: 0.5rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid #e0e0e0;
    font-size: 0.95rem;
  }

  .check-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.3rem 0;
    font-size: 0.88rem;
    cursor: pointer;
  }

  .check-item input { margin-top: 0.15rem; }

  .check-item .done {
    text-decoration: line-through;
    color: #888;
  }

  .check-item.critical {
    background: #fef2f2;
    padding: 0.3rem 0.5rem;
    border-radius: 4px;
    margin: 0.1rem -0.5rem;
  }

  .critical-badge {
    font-size: 0.7rem;
    background: #dc2626;
    color: white;
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    margin-left: 0.5rem;
    text-transform: uppercase;
    font-weight: 600;
  }

  .platform-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .platform-tabs button {
    flex: 1;
    padding: 0.6rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    font-weight: 500;
  }

  .platform-tabs button.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .platform-detail {
    background: #fafafa;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  code {
    background: #f0f0f0;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.85rem;
  }

  pre code { background: none; padding: 0; }

  h4 { margin-top: 1.25rem; margin-bottom: 0.5rem; }

  .ship-banner {
    background: linear-gradient(135deg, #1a5bb5, #4a90d9);
    color: white;
    padding: 2.5rem;
    border-radius: 16px;
    text-align: center;
  }

  .ship-banner h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .ship-banner p {
    font-size: 1.05rem;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto 1rem;
    opacity: 0.95;
  }

  .ship-banner code {
    background: rgba(255,255,255,0.2);
    color: white;
  }

  .final {
    font-size: 1.15rem !important;
    opacity: 1 !important;
  }

  .ship-cmd {
    display: inline-block;
    background: rgba(0,0,0,0.3) !important;
    padding: 0.75rem 1.5rem !important;
    border-radius: 8px;
    margin-top: 0.5rem;
  }

  .ship-cmd code {
    background: none !important;
    font-size: 0.95rem;
  }

  section { margin-bottom: 2.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
