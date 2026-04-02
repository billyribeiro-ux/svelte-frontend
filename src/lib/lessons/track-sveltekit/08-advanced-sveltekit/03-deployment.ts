import type { Lesson } from '$types/lesson';

export const deployment: Lesson = {
	id: 'sveltekit.advanced-sveltekit.deployment',
	slug: 'deployment',
	title: 'Building & Deploying',
	description: 'Build, preview, and deploy your SvelteKit app to production.',
	trackId: 'sveltekit',
	moduleId: 'advanced-sveltekit',
	order: 3,
	estimatedMinutes: 10,
	concepts: ['sveltekit.deployment.build', 'sveltekit.deployment.preview'],
	prerequisites: ['sveltekit.deployment.adapters'],

	content: [
		{
			type: 'text',
			content: `# Building and Deploying

## Why Deployment Is More Than "Just Build and Push"

Deploying a SvelteKit application involves a pipeline of steps that each serve a distinct purpose. Understanding this pipeline -- not just running the commands blindly -- lets you debug build failures, optimize performance, and set up reliable CI/CD workflows.

The core pipeline:
1. **Type check** -- catch type errors before they reach production
2. **Build** -- compile, bundle, optimize, and run the adapter
3. **Preview** -- verify the production build locally
4. **Deploy** -- push to your hosting platform
5. **Monitor** -- verify the deployment is healthy

Each step catches a different category of problems. Skipping any step means discovering those problems in production.

## The Build Process in Detail

\`vite build\` orchestrates SvelteKit's entire build pipeline:

**Phase 1: Svelte compilation**
Every \`.svelte\` file is compiled into JavaScript. Svelte's compiler produces optimized code that does not use a virtual DOM -- direct DOM manipulation. This is why Svelte apps are smaller and faster than equivalent React/Vue apps.

**Phase 2: Vite bundling**
Vite bundles all JavaScript into optimized chunks. SvelteKit automatically code-splits by route, meaning each page only loads the JavaScript it needs. Shared dependencies (Svelte runtime, utility libraries) are extracted into common chunks.

**Phase 3: CSS extraction**
Component styles are extracted into CSS files, grouped by route. Unused styles are eliminated. CSS is hashed for cache-busting.

**Phase 4: Prerendering**
Pages with \`prerender = true\` are rendered to static HTML files. SvelteKit starts from entry points and crawls links to discover all prerenderable pages.

**Phase 5: Adapter transformation**
The adapter takes the compiled output and produces platform-specific artifacts. For adapter-node, this means a standalone server. For adapter-static, it means plain files. For adapter-vercel, it means serverless function configurations.

\`\`\`bash
npm run build
# Equivalent to: vite build
# Output: build/ directory (depends on adapter config)
\`\`\`

## Preview: Testing the Production Build

\`vite preview\` serves the production build locally. This is essential because the development server (\`vite dev\`) behaves differently from production:

- Development uses on-demand compilation; production uses pre-built bundles
- Development includes hot module replacement; production does not
- Development may be more lenient with errors; production is strict
- Environment variables resolve differently (\`.env.development\` vs \`.env.production\`)

\`\`\`bash
npm run preview
# Serves the production build at http://localhost:4173
\`\`\`

Always preview before deploying. Issues that only appear in production builds:
- Missing environment variables
- Import resolution differences
- Prerendering failures (dynamic data in static pages)
- CSS ordering issues (development loads CSS on demand; production bundles it)

## The Production Checklist

Before your first production deployment, verify each item:

**Security:**
- CSP (Content Security Policy) configured in \`svelte.config.js\`
- CSRF protection enabled (default, verify it is not disabled)
- \`ORIGIN\` environment variable set (for adapter-node)
- No sensitive data in \`$env/static/public\` or client-accessible code
- HTTP-only, secure cookies for authentication

**Performance:**
- \`precompress: true\` in adapter config (generates .gz and .br files)
- Static assets have cache headers (\`immutable\` for hashed assets)
- Images have explicit width/height to prevent CLS
- Critical CSS is inlined (SvelteKit does this by default)
- Prerender static pages where possible

**Observability:**
- \`handleError\` hook configured with error tracking (Sentry, etc.)
- Request logging in the \`handle\` hook or via platform features
- Version tracking configured (\`config.kit.version.name\`)
- Health check endpoint (\`/api/health\` or similar)

**Type safety:**
- Run \`svelte-kit sync && svelte-check\` in CI to catch type errors
- Include the check in your build script:
\`\`\`json
{
  "scripts": {
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "build": "npm run check && vite build"
  }
}
\`\`\`

## Docker Deployment with adapter-node

A production Dockerfile for SvelteKit:

\`\`\`dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .

ENV NODE_ENV=production
ENV PORT=3000
ENV ORIGIN=https://myapp.com

EXPOSE 3000
CMD ["node", "build/index.js"]
\`\`\`

Key decisions:
- **Multi-stage build** reduces final image size (no dev dependencies, no source code)
- **\`npm prune --production\`** removes dev dependencies before copying to production stage
- **\`ORIGIN\`** must be set for CSRF protection to work correctly
- **Alpine base** for minimal image size

## CI/CD Pipeline

A typical GitHub Actions workflow:

\`\`\`yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run check    # Type check
      - run: npm run test     # Run tests
      - run: npm run build    # Build for production

      # Platform-specific deploy step
      - run: npm run deploy
\`\`\`

The pipeline should fail fast: type checks and tests run before the build. If types are wrong or tests fail, there is no point in building.

## Environment Variable Management

Production environment variables should NEVER be in your repository. Common patterns:

- **Platform secrets:** Vercel, Netlify, and Cloudflare have built-in secrets management
- **Docker:** Use Docker secrets or environment files: \`docker run --env-file .env.production\`
- **CI/CD:** Store secrets in your CI platform (GitHub Secrets, GitLab Variables)
- **Kubernetes:** Use ConfigMaps and Secrets

For adapter-node, environment variables are read at runtime. For adapter-vercel/cloudflare, they are injected by the platform. For adapter-static, only \`PUBLIC_\` variables matter (private vars are irrelevant since there is no server).

## Version Management and Zero-Downtime Deploys

Configure version tracking to handle deployments gracefully:

\`\`\`javascript
// svelte.config.js
kit: {
  version: {
    name: process.env.npm_package_version,
    pollInterval: 60000 // Check every minute
  }
}
\`\`\`

When SvelteKit detects a version change, subsequent navigations trigger full page reloads to load the new code. This prevents users from running stale JavaScript that might call deprecated API endpoints.

For zero-downtime deploys with adapter-node:
- Use a process manager (PM2, systemd) that supports graceful restarts
- Deploy behind a load balancer or reverse proxy (Nginx, Caddy)
- Use rolling deploys in container orchestrators (Kubernetes, Docker Swarm)

## Monitoring Post-Deployment

After deployment, verify:
1. **Health endpoint responds:** \`curl https://myapp.com/api/health\`
2. **Key pages render correctly:** Spot-check critical routes
3. **Error rates are normal:** Check your error tracking service
4. **Performance is acceptable:** Check Core Web Vitals in real-time monitoring
5. **SSL/TLS is working:** Verify HTTPS and certificate validity

Automate these checks in your CI/CD pipeline as post-deployment verification steps. If any check fails, automatically rollback to the previous version.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.deployment.build'
		},
		{
			type: 'text',
			content: `## Build Commands

SvelteKit uses Vite under the hood. The standard build commands are:

\`\`\`bash
npm run build    # Build for production
npm run preview  # Preview the production build
\`\`\`

**Your task:** Review the package.json scripts and understand the build pipeline.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Environment-Specific Configuration

Different environments may need different settings. Use environment variables and adapter options to customize.

**Task:** Create a production-ready configuration with proper settings.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'package.json',
			path: '/package.json',
			language: 'typescript',
			content: `{
  "name": "my-sveltekit-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview"
  }
}`
		},
		{
			name: 'svelte.config.js',
			path: '/svelte.config.js',
			language: 'typescript',
			content: `import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    // TODO: Add production-ready settings
  }
};

export default config;`
		}
	],

	solutionFiles: [
		{
			name: 'package.json',
			path: '/package.json',
			language: 'typescript',
			content: `{
  "name": "my-sveltekit-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"
  }
}`
		},
		{
			name: 'svelte.config.js',
			path: '/svelte.config.js',
			language: 'typescript',
			content: `import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    csp: {
      directives: {
        'script-src': ['self']
      }
    },
    version: {
      name: process.env.npm_package_version
    }
  }
};

export default config;`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Understand the build and preview commands',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'vite build' },
						{ type: 'contains', value: 'vite preview' }
					]
				}
			},
			hints: [
				'The `build` script runs `vite build` to create the production output.',
				'The `preview` script runs `vite preview` to test locally.',
				'Consider adding a `check` script for type-checking: `svelte-kit sync && svelte-check`.'
			],
			conceptsTested: ['sveltekit.deployment.build']
		},
		{
			id: 'cp-2',
			description: 'Add production-ready configuration settings',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'regex', value: '(csp|version|prerender)' }]
				}
			},
			hints: [
				'Add CSP (Content Security Policy) directives for security.',
				'Set `version.name` to track deployed versions.',
				'These settings improve security and observability in production.'
			],
			conceptsTested: ['sveltekit.deployment.preview']
		}
	]
};
