import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '11-8',
		title: 'Config, Assets, Images & Icons',
		phase: 3,
		module: 11,
		lessonIndex: 8
	},
	description: `SvelteKit provides built-in modules for accessing app configuration and environment info. $app/paths gives you base and assets paths for correct URL resolution. $app/environment exposes browser, dev, and version values. Static assets in the static/ folder are served as-is, while assets in src/ are processed by the bundler.

This lesson covers how to reference assets correctly, detect the runtime environment, and configure your app's paths.`,
	objectives: [
		'Use $app/paths for base and assets path resolution',
		'Detect runtime environment with $app/environment (browser, dev, version)',
		'Reference static assets and understand the static/ vs src/ distinction',
		'Configure app paths in svelte.config.js'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // In SvelteKit, you'd import these modules:
  // import { base, assets } from '$app/paths';
  // import { browser, dev, version } from '$app/environment';

  // Simulating for this lesson
  const base: string = '';
  const assets: string = '';
  const browser: boolean = true;
  const dev: boolean = true;
  const version: string = '1.0.0';

  let selectedTopic: string = $state('paths');
</script>

<main>
  <h1>Config, Assets, Images & Icons</h1>

  <nav>
    {#each ['paths', 'environment', 'static', 'images'] as topic}
      <button
        class:active={selectedTopic === topic}
        onclick={() => selectedTopic = topic}
      >
        {topic}
      </button>
    {/each}
  </nav>

  {#if selectedTopic === 'paths'}
    <section>
      <h2>$app/paths</h2>
      <pre>{\`import { base, assets } from '$app/paths';

// base: the base path of your app (for deployment in subdirectories)
// assets: path to static assets (can be a CDN URL)

// Use in templates:
<a href="{base}/about">About</a>
<img src="{assets}/logo.png" alt="Logo" />

// Configure in svelte.config.js:
const config = {
  kit: {
    paths: {
      base: '/my-app',       // deployed at example.com/my-app
      assets: 'https://cdn.example.com'
    }
  }
};\`}</pre>
      <div class="demo-box">
        <p><strong>base:</strong> <code>"{base}" (empty = root)</code></p>
        <p><strong>assets:</strong> <code>"{assets}" (empty = same origin)</code></p>
      </div>
    </section>

  {:else if selectedTopic === 'environment'}
    <section>
      <h2>$app/environment</h2>
      <pre>{\`import { browser, dev, version } from '$app/environment';

// browser: true in the browser, false during SSR
// dev: true in development, false in production
// version: from config.kit.version.name

if (browser) {
  // Only runs client-side
  window.addEventListener('resize', handler);
}

if (dev) {
  console.log('Debug info...');
}\`}</pre>
      <div class="demo-box">
        <p><strong>browser:</strong> <code>{browser}</code></p>
        <p><strong>dev:</strong> <code>{dev}</code></p>
        <p><strong>version:</strong> <code>"{version}"</code></p>
      </div>
    </section>

  {:else if selectedTopic === 'static'}
    <section>
      <h2>Static Assets</h2>
      <pre>{\`project/
├── static/              ← served as-is, no processing
│   ├── favicon.png      → /favicon.png
│   ├── robots.txt       → /robots.txt
│   └── images/
│       └── hero.jpg     → /images/hero.jpg
└── src/
    └── lib/
        └── assets/      ← processed by bundler
            └── logo.svg → imported, hashed, optimized

<!-- Reference static files directly -->
<img src="/images/hero.jpg" alt="Hero" />
<link rel="icon" href="/favicon.png" />

<!-- Import processed assets -->
<script>
  import logo from '$lib/assets/logo.svg';
</script>
<img src={logo} alt="Logo" />\`}</pre>
    </section>

  {:else if selectedTopic === 'images'}
    <section>
      <h2>Images & Icons</h2>
      <pre>{\`<!-- Static images -->
<img src="/images/photo.jpg" alt="Photo" />

<!-- Imported images (bundled + hashed) -->
<script lang="ts">
  import heroImg from '$lib/assets/hero.webp';
  import Icon from '$lib/components/Icon.svelte';
</script>
<img src={heroImg} alt="Hero" />

<!-- Enhanced images with @sveltejs/enhanced-img -->
<script>
  import { enhance } from '@sveltejs/enhanced-img';
</script>

<!-- SVG icons as components -->
<Icon name="home" size={24} />

<!-- Or inline SVG -->
<svg viewBox="0 0 24 24" width="24" height="24">
  <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>
</svg>\`}</pre>
    </section>
  {/if}
</main>

<style>
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; }
  nav { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  nav button { padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: white; }
  nav button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  .demo-box { background: #f0f7ff; padding: 1rem; border-radius: 4px; margin-top: 0.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
