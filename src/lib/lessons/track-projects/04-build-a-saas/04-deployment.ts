import type { Lesson } from '$types/lesson';

export const deployment: Lesson = {
	id: 'projects.build-a-saas.deployment',
	slug: 'deployment',
	title: 'Deployment and Production',
	description:
		'Prepare a Svelte 5 SaaS application for production with environment configuration, build optimization, error boundaries, and deployment strategies.',
	trackId: 'projects',
	moduleId: 'build-a-saas',
	order: 4,
	estimatedMinutes: 25,
	concepts: ['svelte5.components.composition', 'svelte5.runes.state', 'svelte5.runes.effect'],
	prerequisites: ['projects.build-a-saas.user-settings'],

	content: [
		{
			type: 'text',
			content: `# Deployment and Production Readiness

You have built a SaaS application with authentication, API integration, and user settings. The final step is preparing it for production. Deploying is not just running a build command — it involves environment configuration, error handling, performance optimization, feature flags, and health monitoring. In this lesson you will build the production infrastructure that separates a demo from a shippable product.

## Environment Configuration

Production applications need different configuration for different environments: development uses localhost API endpoints and verbose logging; staging uses test servers; production uses real servers with minimal logging. We model this with a typed configuration store:

\`\`\`ts
interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    darkMode: boolean;
    betaDashboard: boolean;
    exportData: boolean;
  };
  version: string;
}

function createConfigStore() {
  let config = $state<AppConfig>({
    apiUrl: import.meta.env?.VITE_API_URL ?? 'http://localhost:3000',
    environment: (import.meta.env?.MODE ?? 'development') as AppConfig['environment'],
    features: {
      darkMode: true,
      betaDashboard: false,
      exportData: true,
    },
    version: '1.0.0',
  });

  return {
    get config() { return config; },
    get isDev() { return config.environment === 'development'; },
    get isProd() { return config.environment === 'production'; },
    isFeatureEnabled(feature: keyof AppConfig['features']) {
      return config.features[feature];
    },
  };
}
\`\`\`

The \`import.meta.env\` syntax accesses Vite environment variables. In production, these are baked in at build time — the code ships with the production values, not runtime lookups.

## Feature Flags

Feature flags let you deploy code without exposing it to all users. This is essential for SaaS: you can ship a beta feature to internal testers while production users see the stable version.

The pattern is simple — a \`$derived\` conditional:

\`\`\`svelte
{#if configStore.isFeatureEnabled('betaDashboard')}
  <BetaDashboard />
{:else}
  <Dashboard />
{/if}
\`\`\`

In a production system, feature flags would come from a backend service (LaunchDarkly, Unleash, or your own). For this lesson we configure them in the client — the reactive architecture is the same.

## Error Boundaries

In production, errors must not crash the entire application. An error boundary catches component-level errors and displays a fallback UI instead of a white screen.

Svelte 5 does not have built-in error boundaries like React, but we can build one using a try-catch pattern with \`$effect\` and the \`onerror\` window event:

\`\`\`ts
function createErrorBoundary() {
  let error = $state<Error | null>(null);
  let errorInfo = $state('');

  return {
    get error() { return error; },
    get errorInfo() { return errorInfo; },
    get hasError() { return error !== null; },

    captureError(err: Error, info: string = '') {
      error = err;
      errorInfo = info;
      // In production, send to error tracking service
      console.error('[ErrorBoundary]', err, info);
    },

    reset() {
      error = null;
      errorInfo = '';
    },
  };
}
\`\`\`

Wrap the application with an error boundary component:

\`\`\`svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { errorBoundary } from './error-boundary';

  let { children }: { children: Snippet } = $props();

  $effect(() => {
    function handleError(event: ErrorEvent) {
      errorBoundary.captureError(
        event.error ?? new Error(event.message),
        event.filename ? \`at \${event.filename}:\${event.lineno}\` : ''
      );
    }

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  });
</script>

{#if errorBoundary.hasError}
  <div class="error-screen">
    <h1>Something went wrong</h1>
    <p>{errorBoundary.error?.message}</p>
    <button onclick={() => errorBoundary.reset()}>Try Again</button>
  </div>
{:else}
  {@render children()}
{/if}
\`\`\`

## Health Dashboard

A health dashboard shows the application's current status: configuration, active features, error count, memory usage, and uptime. This is invaluable for debugging production issues:

\`\`\`ts
let healthData = $derived({
  environment: configStore.config.environment,
  version: configStore.config.version,
  apiUrl: configStore.config.apiUrl,
  features: Object.entries(configStore.config.features)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name),
  uptime: Math.floor(performance.now() / 1000),
  errors: errorCount,
});
\`\`\`

Display this in a developer-only panel, gated by the environment:

\`\`\`svelte
{#if configStore.isDev}
  <HealthPanel data={healthData} />
{/if}
\`\`\`

This panel only renders in development. In production, the conditional is false and the entire component tree is skipped — zero overhead.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.components.composition'
		},
		{
			type: 'text',
			content: `## Your Task: Build the Production Infrastructure

Open the starter code. You will find \`config.ts\`, \`ErrorBoundary.svelte\`, \`HealthPanel.svelte\`, and \`App.svelte\`.

1. Complete \`config.ts\` with environment configuration and feature flag methods.
2. Build \`ErrorBoundary.svelte\` that catches errors and displays a fallback UI.
3. Create \`HealthPanel.svelte\` with a \`$derived\` health status display.
4. Wire everything together in \`App.svelte\` with the error boundary wrapping the application.`
		},
		{
			type: 'checkpoint',
			content: 'cp-deploy-config'
		},
		{
			type: 'text',
			content: `## Build Optimization Checklist

Before deploying, run through this optimization checklist. While you cannot implement all of these in our sandbox, understanding them is essential for production readiness:

1. **Tree shaking** — Vite automatically removes unused exports. Ensure your imports are specific (not \`import *\`).
2. **Code splitting** — Dynamic imports (\`import()\`) let you lazy-load heavy components. The initial bundle stays small.
3. **Asset optimization** — Images should be compressed, CSS should be minified, JavaScript should be bundled and gzipped.
4. **Caching headers** — Hashed filenames (\`app-abc123.js\`) enable aggressive caching. Vite handles this automatically.
5. **CSP headers** — Content Security Policy prevents XSS attacks. Configure them on your hosting platform.

## Deployment Strategies

Different platforms suit different needs:

| Platform | Best for | Key feature |
|---|---|---|
| Vercel | SvelteKit apps | Automatic previews, edge functions |
| Netlify | Static sites | Form handling, split testing |
| Cloudflare Pages | Global distribution | Workers integration, zero cold starts |
| Docker | Self-hosted | Full control, custom infrastructure |
| Fly.io | Server-rendered apps | Multi-region deployment |

For a SvelteKit SaaS, Vercel is the most common choice because it handles SSR, API routes, and edge functions out of the box. For a purely client-rendered Svelte app, Netlify or Cloudflare Pages provide simpler, faster deployments.

## Monitoring and Observability

Once deployed, you need visibility into how the application performs in production:

- **Error tracking** (Sentry, BugSnag) — Catches runtime errors, groups them, and alerts you.
- **Analytics** (PostHog, Plausible) — Tracks user behavior to inform product decisions.
- **Performance monitoring** (Web Vitals) — Measures Core Web Vitals (LCP, FID, CLS) to ensure fast experiences.

In our health panel, we track errors locally. In production, you would send them to a service. The architecture is the same — the error boundary captures errors and dispatches them to a handler.

This lesson and module conclude the Build Projects track. You have built four complete applications — a blog, a dashboard, a task manager, and a SaaS app — using Svelte 5 runes. Each project reinforced core concepts while introducing real-world patterns: reactive stores, derived pipelines, form handling, drag-and-drop, persistence, authentication, API integration, and production deployment. These patterns form the foundation for any application you build next.`
		},
		{
			type: 'checkpoint',
			content: 'cp-deploy-error'
		},
		{
			type: 'checkpoint',
			content: 'cp-deploy-health'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import ErrorBoundary from './ErrorBoundary.svelte';
  import HealthPanel from './HealthPanel.svelte';
  import { configStore } from './config';

  // Simulated app content
  let clickCount = $state(0);
</script>

<ErrorBoundary>
  {#snippet children()}
    <div class="app">
      <header>
        <h1>SaaS App v{configStore.config.version}</h1>
        <span class="env-badge">{configStore.config.environment}</span>
      </header>

      <main>
        <p>This is the production-ready application shell.</p>
        <button onclick={() => clickCount++}>Clicked {clickCount} times</button>

        {#if configStore.isFeatureEnabled('exportData')}
          <button class="feature">Export Data (feature flag enabled)</button>
        {/if}

        {#if configStore.isFeatureEnabled('betaDashboard')}
          <p class="beta">Beta Dashboard is enabled!</p>
        {/if}
      </main>

      {#if configStore.isDev}
        <HealthPanel />
      {/if}
    </div>
  {/snippet}
</ErrorBoundary>

<style>
  .app { max-width: 700px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  .env-badge { padding: 0.2rem 0.6rem; background: #dcfce7; color: #16a34a; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
  button { padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 0.5rem; }
  .feature { background: #f59e0b; }
  .beta { color: #6366f1; font-style: italic; }
</style>`
		},
		{
			name: 'config.ts',
			path: '/config.ts',
			language: 'typescript',
			content: `// TODO: Define AppConfig interface with apiUrl, environment, features, version
// TODO: Create config store with $state
// TODO: Add isDev, isProd getters and isFeatureEnabled method
`
		},
		{
			name: 'ErrorBoundary.svelte',
			path: '/ErrorBoundary.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  // TODO: Accept children snippet
  // TODO: Add $state for error tracking
  // TODO: Add $effect for window error listener with cleanup
</script>

<!-- TODO: Show error fallback or render children -->

<style>
  /* Add error screen styles */
</style>`
		},
		{
			name: 'HealthPanel.svelte',
			path: '/HealthPanel.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import config store
  // TODO: Create $derived health data
</script>

<!-- TODO: Render health panel with environment, version, features, uptime -->

<style>
  /* Add health panel styles */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'config.ts',
			path: '/config.ts',
			language: 'typescript',
			content: `export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    darkMode: boolean;
    betaDashboard: boolean;
    exportData: boolean;
  };
  version: string;
}

function createConfigStore() {
  let config = $state<AppConfig>({
    apiUrl: 'http://localhost:3000',
    environment: 'development',
    features: {
      darkMode: true,
      betaDashboard: false,
      exportData: true,
    },
    version: '1.0.0',
  });

  return {
    get config() { return config; },
    get isDev() { return config.environment === 'development'; },
    get isProd() { return config.environment === 'production'; },
    isFeatureEnabled(feature: keyof AppConfig['features']) {
      return config.features[feature];
    },
    setEnvironment(env: AppConfig['environment']) {
      config.environment = env;
    },
    toggleFeature(feature: keyof AppConfig['features']) {
      config.features[feature] = !config.features[feature];
    },
  };
}

export const configStore = createConfigStore();
`
		},
		{
			name: 'ErrorBoundary.svelte',
			path: '/ErrorBoundary.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  let error = $state<Error | null>(null);
  let errorInfo = $state('');

  $effect(() => {
    function handleError(event: ErrorEvent) {
      error = event.error ?? new Error(event.message);
      errorInfo = event.filename ? \`at \${event.filename}:\${event.lineno}\` : '';
      console.error('[ErrorBoundary]', error, errorInfo);
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      error = new Error(event.reason?.message ?? 'Unhandled promise rejection');
      console.error('[ErrorBoundary] Unhandled rejection:', event.reason);
    }

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  });

  function reset() {
    error = null;
    errorInfo = '';
  }
</script>

{#if error}
  <div class="error-screen">
    <div class="error-card">
      <h1>Something went wrong</h1>
      <p class="message">{error.message}</p>
      {#if errorInfo}
        <p class="info">{errorInfo}</p>
      {/if}
      <button onclick={reset}>Try Again</button>
    </div>
  </div>
{:else}
  {@render children()}
{/if}

<style>
  .error-screen {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #fef2f2;
    padding: 2rem;
  }

  .error-card {
    background: white;
    border: 1px solid #fca5a5;
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    text-align: center;
  }

  h1 {
    color: #dc2626;
    margin: 0 0 0.75rem;
  }

  .message {
    color: #374151;
    margin: 0 0 0.5rem;
  }

  .info {
    color: #94a3b8;
    font-size: 0.8rem;
    font-family: monospace;
  }

  button {
    margin-top: 1rem;
    padding: 0.5rem 1.5rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
  }
</style>`
		},
		{
			name: 'HealthPanel.svelte',
			path: '/HealthPanel.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { configStore } from './config';

  let startTime = Date.now();
  let now = $state(Date.now());

  $effect(() => {
    const interval = setInterval(() => { now = Date.now(); }, 1000);
    return () => clearInterval(interval);
  });

  let healthData = $derived({
    environment: configStore.config.environment,
    version: configStore.config.version,
    apiUrl: configStore.config.apiUrl,
    enabledFeatures: Object.entries(configStore.config.features)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name),
    uptimeSeconds: Math.floor((now - startTime) / 1000),
  });
</script>

<div class="health-panel">
  <h3>Health Panel (dev only)</h3>
  <dl>
    <dt>Environment</dt>
    <dd>{healthData.environment}</dd>

    <dt>Version</dt>
    <dd>{healthData.version}</dd>

    <dt>API URL</dt>
    <dd><code>{healthData.apiUrl}</code></dd>

    <dt>Features</dt>
    <dd>{healthData.enabledFeatures.join(', ') || 'None'}</dd>

    <dt>Uptime</dt>
    <dd>{healthData.uptimeSeconds}s</dd>
  </dl>
</div>

<style>
  .health-panel {
    margin-top: 2rem;
    padding: 1rem;
    background: #1e293b;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.85rem;
  }

  h3 {
    margin: 0 0 0.75rem;
    color: #94a3b8;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  dl {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 0.35rem 1rem;
    margin: 0;
  }

  dt {
    color: #94a3b8;
    font-weight: 600;
  }

  dd {
    margin: 0;
    color: #e2e8f0;
  }

  code {
    background: #334155;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.8rem;
  }
</style>`
		},
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import ErrorBoundary from './ErrorBoundary.svelte';
  import HealthPanel from './HealthPanel.svelte';
  import { configStore } from './config';

  let clickCount = $state(0);
</script>

<ErrorBoundary>
  {#snippet children()}
    <div class="app">
      <header>
        <h1>SaaS App v{configStore.config.version}</h1>
        <span class="env-badge">{configStore.config.environment}</span>
      </header>

      <main>
        <p>This is the production-ready application shell.</p>
        <button onclick={() => clickCount++}>Clicked {clickCount} times</button>

        {#if configStore.isFeatureEnabled('exportData')}
          <button class="feature">Export Data (feature flag enabled)</button>
        {/if}

        {#if configStore.isFeatureEnabled('betaDashboard')}
          <p class="beta">Beta Dashboard is enabled!</p>
        {/if}
      </main>

      {#if configStore.isDev}
        <HealthPanel />
      {/if}
    </div>
  {/snippet}
</ErrorBoundary>

<style>
  .app { max-width: 700px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  .env-badge { padding: 0.2rem 0.6rem; background: #dcfce7; color: #16a34a; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
  button { padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 0.5rem; }
  .feature { background: #f59e0b; }
  .beta { color: #6366f1; font-style: italic; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-deploy-config',
			description: 'Create config store with environment settings and feature flag support',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$state' },
						{ type: 'contains', value: 'AppConfig' },
						{ type: 'contains', value: 'isFeatureEnabled' }
					]
				}
			},
			hints: [
				'Define an `AppConfig` interface with apiUrl, environment, features (object of booleans), and version.',
				'Create a `$state<AppConfig>` object with default values and expose `isDev`, `isProd` getters.',
				'Implement `isFeatureEnabled(feature: keyof AppConfig[\'features\'])` that reads from `config.features[feature]`.'
			],
			conceptsTested: ['svelte5.runes.state']
		},
		{
			id: 'cp-deploy-error',
			description: 'Build ErrorBoundary component with window error listener and fallback UI',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$effect' },
						{ type: 'contains', value: 'addEventListener' },
						{ type: 'contains', value: '@render children()' }
					]
				}
			},
			hints: [
				'Use `$effect` to add `window.addEventListener(\'error\', ...)` and return a cleanup function.',
				'Track the error with `let error = $state<Error | null>(null)` and show fallback when error is set.',
				'Conditionally render: `{#if error}<div class="error-screen">...{:else}{@render children()}{/if}` with a reset button.'
			],
			conceptsTested: ['svelte5.runes.effect', 'svelte5.components.composition']
		},
		{
			id: 'cp-deploy-health',
			description: 'Create HealthPanel with $derived status data and live uptime counter',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$derived' },
						{ type: 'contains', value: 'healthData' },
						{ type: 'contains', value: 'setInterval' }
					]
				}
			},
			hints: [
				'Create `$derived` health data from the config store: environment, version, apiUrl, enabled features.',
				'Add a live uptime counter with `$effect` and `setInterval` that updates a `$state` timestamp.',
				'Display the health data in a styled panel with a definition list or grid layout.'
			],
			conceptsTested: ['svelte5.runes.derived', 'svelte5.runes.effect']
		}
	]
};
