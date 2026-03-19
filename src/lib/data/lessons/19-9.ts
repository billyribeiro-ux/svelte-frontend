import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-9',
		title: 'Building Component Libraries: svelte-package',
		phase: 7,
		module: 19,
		lessonIndex: 9
	},
	description: `@sveltejs/package transforms your $lib directory into a publishable npm package. It compiles .svelte files, generates TypeScript declarations, and creates a clean package ready for npm publish. The exports field in package.json controls what consumers can import, and svelte field tells bundlers where to find the source.

Building a component library lets you share UI components across projects, within your team, or with the open-source community. This lesson covers the full workflow from setup to publishing.`,
	objectives: [
		'Configure @sveltejs/package for library compilation',
		'Set up package.json exports field for clean import paths',
		'Generate TypeScript declarations for library consumers',
		'Publish a Svelte component library to npm'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let activeStep = $state(0);

  type Step = {
    title: string;
    description: string;
    code: string;
  };

  const steps: Step[] = [
    {
      title: '1. Project Setup',
      description: 'Create a SvelteKit library project using the official template.',
      code: \`# Create a library project
pnpm create svelte@latest my-ui-lib
# Select "Library project" option

# Or add to existing project:
pnpm add -D @sveltejs/package\`
    },
    {
      title: '2. Package Configuration',
      description: 'Configure package.json with proper exports, svelte field, and metadata.',
      code: \`// package.json
{
  "name": "@myorg/ui-lib",
  "version": "1.0.0",
  "license": "MIT",
  "svelte": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./dist/index.js"
    },
    "./Button.svelte": {
      "types": "./dist/Button.svelte.d.ts",
      "svelte": "./dist/Button.svelte"
    },
    "./styles": "./dist/styles.css"
  },
  "files": ["dist", "!dist/**/*.test.*"],
  "scripts": {
    "dev": "vite dev",
    "build": "vite build && pnpm package",
    "package": "svelte-package -o dist",
    "prepublishOnly": "pnpm package"
  },
  "peerDependencies": {
    "svelte": "^5.0.0"
  },
  "devDependencies": {
    "@sveltejs/package": "^2.3.0",
    "svelte": "^5.0.0"
  }
}\`
    },
    {
      title: '3. Library Source Code',
      description: 'Components go in src/lib/ with a barrel export in index.ts.',
      code: \`// src/lib/index.ts — barrel export
export { default as Button } from './Button.svelte';
export { default as Card } from './Card.svelte';
export { default as Input } from './Input.svelte';

// Re-export types
export type { ButtonVariant, CardProps } from './types.js';

// src/lib/Button.svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'primary' | 'secondary' | 'ghost';

  let {
    variant = 'primary',
    disabled = false,
    onclick,
    children
  }: {
    variant?: Variant;
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    children: Snippet;
  } = $props();
<\\/script>

<button data-variant={variant} {disabled} {onclick}>
  {@render children()}
</button>\`
    },
    {
      title: '4. Build & Publish',
      description: 'Run svelte-package to compile, then publish to npm.',
      code: \`# Build the package
pnpm package
# Creates dist/ with compiled .svelte, .js, .d.ts files

# Preview what will be published
pnpm pack --dry-run

# Publish to npm
pnpm publish --access public

# Or publish as scoped package
pnpm publish --access public --registry https://registry.npmjs.org

# Consumer usage:
pnpm add @myorg/ui-lib

// In their component:
import { Button, Card } from '@myorg/ui-lib';
// or cherry-pick:
import Button from '@myorg/ui-lib/Button.svelte';\`
    }
  ];

  const bestPractices = [
    { practice: 'Peer Dependencies', detail: 'List svelte as peerDependency, not dependency — avoids duplicate Svelte runtimes' },
    { practice: 'Tree Shaking', detail: 'Use individual exports so consumers only bundle what they use' },
    { practice: 'TypeScript', detail: 'Always generate .d.ts files — consumers get autocomplete and type safety' },
    { practice: 'CSS Strategy', detail: 'Scoped styles are included automatically; global styles need explicit export' },
    { practice: 'Documentation', detail: 'Include a README with examples, a demo site (Storybook or custom), and JSDoc' },
    { practice: 'Versioning', detail: 'Follow semver — breaking changes = major, new features = minor, fixes = patch' },
    { practice: 'Testing', detail: 'Test components with Vitest + @testing-library/svelte before publishing' }
  ];

  // What svelte-package produces
  const outputStructure = \`dist/
  index.js          # Barrel export (compiled)
  index.d.ts        # TypeScript declarations
  Button.svelte     # Compiled component
  Button.svelte.d.ts # Component type declarations
  Card.svelte
  Card.svelte.d.ts
  Input.svelte
  Input.svelte.d.ts
  types.js          # Exported types
  types.d.ts\`;
</script>

<main>
  <h1>Building Component Libraries</h1>
  <p class="subtitle">@sveltejs/package — from $lib to npm</p>

  <section class="steps">
    <div class="step-nav">
      {#each steps as step, i}
        <button
          class="step-btn"
          class:active={activeStep === i}
          onclick={() => activeStep = i}
        >
          <span class="step-num">{i + 1}</span>
          {step.title.replace(/^\d+\.\s/, '')}
        </button>
      {/each}
    </div>

    <div class="step-content">
      <h2>{steps[activeStep].title}</h2>
      <p>{steps[activeStep].description}</p>
      <pre><code>{steps[activeStep].code}</code></pre>
    </div>
  </section>

  <section>
    <h2>Output Structure</h2>
    <pre class="tree"><code>{outputStructure}</code></pre>
  </section>

  <section>
    <h2>Best Practices</h2>
    <div class="practices">
      {#each bestPractices as bp}
        <div class="practice-card">
          <h4>{bp.practice}</h4>
          <p>{bp.detail}</p>
        </div>
      {/each}
    </div>
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

  .step-nav {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .step-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .step-btn.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .step-num {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #4a90d9;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .step-content {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
  }

  .step-content p {
    color: #555;
    margin-bottom: 1rem;
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

  pre.tree {
    font-size: 0.85rem;
    line-height: 1.6;
  }

  .practices {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .practice-card {
    padding: 1rem;
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }

  .practice-card h4 {
    margin: 0 0 0.3rem;
    color: #1a5bb5;
    font-size: 0.9rem;
  }

  .practice-card p {
    margin: 0;
    font-size: 0.85rem;
    color: #555;
  }

  section { margin-bottom: 2.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
