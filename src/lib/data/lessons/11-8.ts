import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '11-8',
		title: 'Config, Assets, Images & Icons',
		phase: 3,
		module: 11,
		lessonIndex: 8
	},
	description: `SvelteKit bundles several built-in modules for app configuration, environment detection, and asset resolution. $app/paths gives you base and assets paths plus the modern resolve()/asset() helpers (kit@2.26+). $app/environment exposes browser, dev, and version. Static assets live in static/ and are served as-is, while assets imported from src/ are processed, hashed, and fingerprinted by Vite. Image optimization is handled by @sveltejs/enhanced-img.

As of svelte@5.54, svelte.config.js supports function forms for compiler options (css, runes, customElement) so you can vary behaviour per file from a single source of truth — see lesson 17-1 for the full pattern.

For inline SVG icons and illustrations, the svg-to-svelte community library converts raw SVG strings directly into Svelte components with no build step — ideal when you have a pile of SVG markup and don't want a separate .svelte file for each one.`,
	objectives: [
		'Use $app/paths — base, assets, resolve(), and asset() — for correct URL resolution',
		'Detect runtime environment with $app/environment (browser, dev, version, building)',
		'Reference static assets and understand the static/ vs src/ distinction',
		'Optimize images with @sveltejs/enhanced-img (responsive srcset, AVIF/WebP, LQIP)',
		'Choose an icon strategy: per-component .svelte, sprite sheet, or svg-to-svelte',
		'Configure app paths and compiler options with function-form options in svelte.config.js (svelte@5.54)'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // In SvelteKit, you'd import these modules:
  //   import { base, assets, resolve, asset } from '$app/paths';
  //   import { browser, dev, version, building } from '$app/environment';

  // Simulated values for this playground
  const base: string = '';
  const assets: string = '';
  const browser: boolean = true;
  const dev: boolean = true;
  const building: boolean = false;
  const version: string = '2026.04.04-abc123';

  type Topic = 'paths' | 'environment' | 'static' | 'images' | 'icons' | 'config';
  let selectedTopic: Topic = $state('paths');

  const topics: Topic[] = ['paths', 'environment', 'static', 'images', 'icons', 'config'];
</script>

<main>
  <h1>Config, Assets, Images & Icons</h1>

  <nav>
    {#each topics as topic (topic)}
      <button
        class:active={selectedTopic === topic}
        onclick={() => (selectedTopic = topic)}
      >
        {topic}
      </button>
    {/each}
  </nav>

  {#if selectedTopic === 'paths'}
    <section>
      <h2>$app/paths</h2>
      <p>
        The <code>$app/paths</code> module gives you correct URLs no matter where
        your app is deployed: root domain, subdirectory, or with assets on a
        separate CDN.
      </p>
      <pre>{\`import { base, assets, resolve, asset } from '$app/paths';

// base:   prefix for in-app links, e.g. '/my-app'
// assets: prefix for static files, e.g. 'https://cdn.example.com'
// resolve(routeId, params):  typed, build-time URL for a route (kit@2.26+)
// asset(path):               typed URL for a file in static/ (kit@2.26+)\`}</pre>

      <h3>The old way: manual string concatenation</h3>
      <pre>{\`<a href="{base}/blog/{post.slug}">Read post</a>
<img src="{assets}/images/hero.jpg" alt="Hero" />\`}</pre>

      <h3>The new way: resolve() and asset() (kit@2.26+)</h3>
      <pre>{\`<script lang="ts">
  import { resolve, asset } from '$app/paths';
</script>

<!-- Typed: the route ID is checked against your actual routes,
     and required params are enforced at compile time -->
<a href={resolve('/blog/[slug]', { slug: post.slug })}>Read post</a>

<!-- Typed: the path is checked against files in static/ -->
<img src={asset('/images/hero.jpg')} alt="Hero" />\`}</pre>

      <h3>Configuration</h3>
      <pre>{\`// svelte.config.js
const config = {
  kit: {
    paths: {
      base: '/my-app',                     // deployed at example.com/my-app
      assets: 'https://cdn.example.com',   // CDN for static/ files
      relative: true                       // relative URLs where possible
    }
  }
};\`}</pre>
      <div class="demo-box">
        <p><strong>base:</strong> <code>"{base}"</code> (empty = root)</p>
        <p><strong>assets:</strong> <code>"{assets}"</code> (empty = same origin)</p>
      </div>
      <p class="callout">
        <strong>Why use resolve()/asset()?</strong> TypeScript catches typos in
        route IDs and missing params at build time. Rename a route folder and
        every caller becomes a compile error — no more broken links.
      </p>
    </section>

  {:else if selectedTopic === 'environment'}
    <section>
      <h2>$app/environment</h2>
      <pre>{\`import { browser, dev, building, version } from '$app/environment';

// browser:  true in the browser, false during SSR and prerendering
// dev:      true in development (npm run dev), false in production builds
// building: true during \\\`vite build\\\` prerender phase, false at runtime
// version:  config.kit.version.name — your deployed version string\`}</pre>
      <pre>{\`// Guard browser-only APIs
if (browser) {
  window.addEventListener('resize', onResize);
  const saved = localStorage.getItem('theme');
}

// Strip debug code in production
if (dev) {
  console.log('debug', state);
}

// Skip expensive runtime work during prerender
if (!building) {
  subscribeToAnalytics();
}\`}</pre>
      <div class="demo-box">
        <p><strong>browser:</strong> <code>{browser}</code></p>
        <p><strong>dev:</strong> <code>{dev}</code></p>
        <p><strong>building:</strong> <code>{building}</code></p>
        <p><strong>version:</strong> <code>"{version}"</code></p>
      </div>
      <p class="callout">
        Code inside <code>if (browser)</code> is still shipped to the client —
        it just doesn't run during SSR. For code that should never reach the
        browser, put it in a <code>.server.ts</code> file or under
        <code>$lib/server/</code>.
      </p>
    </section>

  {:else if selectedTopic === 'static'}
    <section>
      <h2>static/ vs src/ — Two Asset Pipelines</h2>
      <pre>{\`project/
├── static/                    ← served as-is, NO processing
│   ├── favicon.ico            → /favicon.ico
│   ├── robots.txt             → /robots.txt
│   ├── manifest.webmanifest   → /manifest.webmanifest
│   └── images/
│       └── hero.jpg           → /images/hero.jpg
│
└── src/
    └── lib/
        └── assets/            ← processed by Vite
            ├── logo.svg       → imported, hashed, inlined if small
            ├── hero.webp      → imported, fingerprinted filename
            └── icons/
                └── star.svg   → import as URL or as component\`}</pre>

      <h3>When to use static/</h3>
      <ul>
        <li>Files referenced by URL from outside your JS (favicon, robots.txt, sitemap)</li>
        <li>Files you want at a stable, well-known URL</li>
        <li>Large binary assets you don't want Vite to re-process on every build</li>
      </ul>

      <h3>When to use src/lib/assets/</h3>
      <ul>
        <li>Assets tied to a specific component (co-locate with the component)</li>
        <li>Files you want fingerprinted for long-term caching</li>
        <li>Small SVGs Vite should inline as data URLs</li>
        <li>Anything you want TypeScript to verify exists</li>
      </ul>

      <pre>{\`<!-- Static: reference by URL -->
<img src="/images/hero.jpg" alt="Hero" />
<link rel="icon" href="/favicon.ico" />

<!-- Better: use asset() for type-checked static paths -->
<script lang="ts">
  import { asset } from '$app/paths';
</script>
<img src={asset('/images/hero.jpg')} alt="Hero" />

<!-- Processed: import it -->
<script lang="ts">
  import logo from '$lib/assets/logo.svg';
  import hero from '$lib/assets/hero.webp';
</script>
<img src={logo} alt="Logo" />
<img src={hero} alt="Hero" />\`}</pre>
    </section>

  {:else if selectedTopic === 'images'}
    <section>
      <h2>Image Optimization with @sveltejs/enhanced-img</h2>
      <p>
        The official <code>@sveltejs/enhanced-img</code> Vite plugin turns a
        single import into a full responsive image: multiple sizes, modern
        formats (AVIF/WebP with fallbacks), intrinsic dimensions to prevent
        layout shift, and lazy loading by default.
      </p>
      <pre>{\`// vite.config.ts
import { enhancedImages } from '@sveltejs/enhanced-img';

export default {
  plugins: [enhancedImages(), sveltekit()]
};\`}</pre>
      <pre>{\`<!-- Use it like a regular <img> with ?enhanced -->
<script lang="ts">
  import hero from '$lib/assets/hero.jpg?enhanced';
</script>

<enhanced:img src={hero} alt="Hero" sizes="(min-width: 768px) 50vw, 100vw" />

<!-- The plugin generates:
     - <picture> with AVIF + WebP + original fallback
     - srcset with multiple widths
     - width/height attrs from the source file
     - loading="lazy" and decoding="async"
-->\`}</pre>

      <h3>Manual sizes with the import query</h3>
      <pre>{\`<script lang="ts">
  // Explicit widths — generates exactly these
  import hero from '$lib/assets/hero.jpg?enhanced&w=400;800;1200';
</script>

<enhanced:img src={hero} alt="Hero" />\`}</pre>

      <h3>When NOT to use enhanced-img</h3>
      <ul>
        <li>Remote images from a CMS — use a dedicated image CDN instead</li>
        <li>Vector graphics — ship the SVG directly</li>
        <li>Decorative backgrounds — plain CSS is simpler</li>
      </ul>
    </section>

  {:else if selectedTopic === 'icons'}
    <section>
      <h2>Icon Strategies</h2>

      <h3>1. One .svelte component per icon</h3>
      <pre>{\`<!-- src/lib/icons/HomeIcon.svelte -->
<script lang="ts">
  interface Props { size?: number; class?: string; }
  let { size = 24, class: className = '' }: Props = $props();
</script>

<svg {...{ width: size, height: size }} viewBox="0 0 24 24" class={className}>
  <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" />
</svg>\`}</pre>
      <p>
        Full control, great for 5–30 icons. Gets tedious beyond that and bloats
        your file tree.
      </p>

      <h3>2. Sprite sheet with &lt;use&gt;</h3>
      <pre>{\`<!-- static/icons.svg -->
<svg xmlns="http://www.w3.org/2000/svg">
  <symbol id="home" viewBox="0 0 24 24"><path d="..." /></symbol>
  <symbol id="search" viewBox="0 0 24 24"><path d="..." /></symbol>
</svg>

<!-- Any component -->
<svg width="24" height="24"><use href="/icons.svg#home" /></svg>\`}</pre>
      <p>
        Single network request, browser-cached, trivial to add icons to. Less
        ergonomic for styling individual paths.
      </p>

      <h3>3. svg-to-svelte for raw SVG strings</h3>
      <p>
        The <code>svg-to-svelte</code> community library converts raw SVG
        strings into Svelte components at runtime — no build step, no separate
        file per icon. Ideal when you've got a pile of SVG markup from a design
        tool or a third-party icon pack and don't want dozens of
        <code>.svelte</code> files.
      </p>
      <pre>{\`<\${''}script lang="ts">
  import { svgToSvelte } from 'svg-to-svelte';

  const homeSvg = \\\`<svg viewBox="0 0 24 24"><path d="M12 2L2 12..." /></svg>\\\`;
  const HomeIcon = svgToSvelte(homeSvg);
</\${''}script>

<HomeIcon class="w-6 h-6 text-blue-500" />\`}</pre>

      <h3>4. Icon libraries via unplugin-icons</h3>
      <pre>{\`// vite.config.ts
import Icons from 'unplugin-icons/vite';

export default {
  plugins: [
    Icons({ compiler: 'svelte' }),
    sveltekit()
  ]
};\`}</pre>
      <pre>{\`<script lang="ts">
  import Home from '~icons/lucide/home';
  import Search from '~icons/mdi/magnify';
</script>

<Home />
<Search />\`}</pre>
      <p>
        Imports icons on demand from 200+ icon sets (Lucide, Heroicons, Material,
        Tabler...). Only the icons you use end up in your bundle.
      </p>
    </section>

  {:else if selectedTopic === 'config'}
    <section>
      <h2>svelte.config.js Deep Dive</h2>
      <pre>{\`// svelte.config.js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    alias: {
      '$components': 'src/lib/components',
      '$utils': 'src/lib/utils'
    },
    paths: {
      base: process.env.BASE_PATH ?? '',
      relative: true
    },
    version: {
      name: process.env.GIT_SHA ?? 'dev',
      pollInterval: 60_000
    },
    csp: {
      directives: { 'script-src': ['self'] }
    },
    prerender: {
      entries: ['*', '/sitemap.xml']
    }
  },

  compilerOptions: {
    runes: true
  }
};

export default config;\`}</pre>

      <h3>Function-form compiler options (svelte@5.54+)</h3>
      <p>
        As of Svelte 5.54, <code>css</code>, <code>runes</code>, and
        <code>customElement</code> in <code>compilerOptions</code> can be
        <em>functions</em> that receive the filename and return a value. That
        lets you vary behaviour per file from a single source of truth.
      </p>
      <pre>{\`// svelte.config.js — per-file compiler options
const config = {
  compilerOptions: {
    // Enable runes everywhere EXCEPT legacy components in src/legacy/
    runes: (filename) => !filename.includes('/src/legacy/'),

    // Use injected CSS everywhere, but external files in the design system
    css: (filename) =>
      filename.includes('/src/lib/ds/') ? 'external' : 'injected',

    // Compile certain components as custom elements
    customElement: (filename) => filename.endsWith('.ce.svelte')
  }
};\`}</pre>
      <p class="callout">
        See lesson 17-1 for the full mental model around function-form compiler
        options. The key insight: one config, many behaviours, no duplication.
      </p>
    </section>
  {/if}
</main>

<style>
  main { max-width: 720px; margin: 0 auto; font-family: sans-serif; padding: 1rem; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.78rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
  nav { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  nav button { padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: white; }
  nav button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  .demo-box { background: #f0f7ff; padding: 1rem; border-radius: 4px; margin-top: 0.5rem; }
  h3 { margin-top: 1.25rem; font-size: 0.95rem; }
  ul { font-size: 0.9rem; }
  .callout { background: #fff7ed; border-left: 3px solid #f59e0b; padding: 0.6rem 0.8rem; border-radius: 4px; font-size: 0.85rem; color: #78350f; }
  .callout code { background: #fde68a; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
