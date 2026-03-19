import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-9',
		title: 'Environment, Server-Only & Transport',
		phase: 5,
		module: 17,
		lessonIndex: 9
	},
	description: `SvelteKit provides four $env modules for safe environment variable access: $env/static/private and $env/static/public are inlined at build time for maximum performance, while $env/dynamic/private and $env/dynamic/public are read at runtime. The $lib/server/ directory enforces a server-only boundary — any import from it in client code triggers a build error, preventing accidental secret leakage. The transport hook in hooks.ts lets you define custom serialization for non-POD data types (like Date, Map, Set, or custom classes) that cross the server-client boundary.

These features work together to keep your secrets safe, your environment configuration clean, and your data serialization seamless.`,
	objectives: [
		'Access environment variables safely with the four $env modules',
		'Use $lib/server/ to enforce server-only code boundaries',
		'Configure the transport hook to serialize custom data types across the wire',
		'Understand the difference between static and dynamic env modules'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Environment, Server-Only & Transport — interactive reference

  type EnvModule = {
    name: string;
    prefix: string;
    timing: string;
    access: string;
    description: string;
    example: string;
  };

  const envModules: EnvModule[] = [
    {
      name: '$env/static/private',
      prefix: 'Any (without PUBLIC_)',
      timing: 'Build time',
      access: 'Server only',
      description: 'Private secrets inlined at build time. Cannot be imported in client code. Ideal for API keys, database URLs, and signing secrets.',
      example: \`// .env
DATABASE_URL=postgres://user:pass@host/db
API_SECRET=sk_live_abc123
STRIPE_KEY=sk_test_xyz

// src/lib/server/db.ts
import { DATABASE_URL } from '$env/static/private';

export const db = createClient(DATABASE_URL);

// src/routes/api/charge/+server.ts
import { STRIPE_KEY } from '$env/static/private';

const stripe = new Stripe(STRIPE_KEY);

// Trying to import in client code → BUILD ERROR
// src/routes/+page.svelte
// import { API_SECRET } from '$env/static/private'; // ERROR!\`
    },
    {
      name: '$env/static/public',
      prefix: 'PUBLIC_',
      timing: 'Build time',
      access: 'Server + Client',
      description: 'Public values inlined at build time. Available everywhere including client-side code. Must use the PUBLIC_ prefix.',
      example: \`// .env
PUBLIC_API_URL=https://api.example.com
PUBLIC_APP_NAME=My SvelteKit App
PUBLIC_ANALYTICS_ID=G-XXXXXX

// Available in client components:
// src/routes/+page.svelte
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';

// Available in server code too:
// src/routes/+page.server.ts
import { PUBLIC_API_URL } from '$env/static/public';

// These values are inlined into the JavaScript bundle
// so they are visible to anyone inspecting your code.
// NEVER put secrets in PUBLIC_ variables!\`
    },
    {
      name: '$env/dynamic/private',
      prefix: 'Any (without PUBLIC_)',
      timing: 'Runtime',
      access: 'Server only',
      description: 'Private values read at runtime on each access. Use when env vars change between deployments without rebuilding, like feature flags or runtime config.',
      example: \`// src/routes/+page.server.ts
import { env } from '$env/dynamic/private';

export const load = async () => {
  // Read at request time — not inlined at build
  const featureFlag = env.ENABLE_NEW_FEATURE === 'true';
  const maintenanceMode = env.MAINTENANCE_MODE === 'true';

  return {
    featureFlag,
    maintenanceMode
  };
};

// Great for:
// - Feature flags that change without redeploying
// - Database connection strings set by the platform
// - API keys rotated at runtime\`
    },
    {
      name: '$env/dynamic/public',
      prefix: 'PUBLIC_',
      timing: 'Runtime',
      access: 'Server + Client',
      description: 'Public values read at runtime. Available in both server and client code. Useful when public configuration changes between deployments.',
      example: \`// src/routes/+page.svelte
import { env } from '$env/dynamic/public';

// Read at runtime
const apiUrl = env.PUBLIC_API_URL;

// Useful when the same build runs in multiple environments:
// staging: PUBLIC_API_URL=https://staging-api.example.com
// production: PUBLIC_API_URL=https://api.example.com

// Comparison:
// static = faster (inlined, tree-shaken, dead code eliminated)
// dynamic = flexible (changes without rebuild)\`
    }
  ];

  let activeModule = $state(0);

  // Server-only boundary code
  const serverOnlyCode = \`// Files inside $lib/server/ are server-only
// Importing them in client code causes a build error

// src/lib/server/db.ts
import { DATABASE_URL } from '$env/static/private';
export const db = createPool(DATABASE_URL);

// src/lib/server/auth.ts
import { JWT_SECRET } from '$env/static/private';
export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

// src/lib/server/email.ts
import { SMTP_PASSWORD } from '$env/static/private';
export async function sendEmail(to: string, subject: string, body: string) {
  // Uses private SMTP credentials
}

// SAFE: Import in server files
// src/routes/+page.server.ts
import { db } from '$lib/server/db';           // OK
import { verifyToken } from '$lib/server/auth'; // OK

// ERROR: Import in client files
// src/routes/+page.svelte
// import { db } from '$lib/server/db';
// ^ Cannot import $lib/server/db into client-side code\`;

  // Transport hook code
  const transportCode = \`// src/hooks.ts (shared hooks — runs on both server and client)
import type { Transport } from '@sveltejs/kit';

// Define how to serialize/deserialize custom types
export const transport: Transport = {
  Date: {
    encode: (value) => value instanceof Date && value.toISOString(),
    decode: (value) => new Date(value)
  },

  Set: {
    encode: (value) => value instanceof Set && [...value],
    decode: (value) => new Set(value)
  },

  Map: {
    encode: (value) => value instanceof Map && [...value.entries()],
    decode: (entries) => new Map(entries)
  },

  BigInt: {
    encode: (value) => typeof value === 'bigint' && value.toString(),
    decode: (value) => BigInt(value)
  }
};

// Now load functions can return these types directly!
// src/routes/+page.server.ts
export const load = async () => {
  return {
    createdAt: new Date(),           // Arrives as Date, not string!
    tags: new Set(['svelte', 'kit']),  // Arrives as Set, not array!
    metadata: new Map([['key', 'value']]),
    bigNumber: 9007199254740993n
  };
};

// src/routes/+page.svelte
// let { data } = $props();
// data.createdAt instanceof Date  → true
// data.tags instanceof Set        → true\`;

  let activeTab = $state<'env' | 'server' | 'transport'>('env');
</script>

<main>
  <h1>Environment, Server-Only & Transport</h1>
  <p class="subtitle">$env modules, $lib/server/ boundaries, and custom serialization</p>

  <div class="main-tabs">
    <button class:active={activeTab === 'env'} onclick={() => activeTab = 'env'}>$env Modules</button>
    <button class:active={activeTab === 'server'} onclick={() => activeTab = 'server'}>$lib/server/</button>
    <button class:active={activeTab === 'transport'} onclick={() => activeTab = 'transport'}>Transport</button>
  </div>

  {#if activeTab === 'env'}
    <section>
      <h2>Environment Variable Modules</h2>
      <div class="env-grid">
        {#each envModules as mod, i}
          <button
            class={['env-card', activeModule === i && 'active']}
            onclick={() => activeModule = i}
          >
            <code class="env-name">{mod.name}</code>
            <div class="env-meta">
              <span class="badge timing">{mod.timing}</span>
              <span class="badge access">{mod.access}</span>
            </div>
          </button>
        {/each}
      </div>

      <div class="env-detail">
        <div class="env-header">
          <code>{envModules[activeModule].name}</code>
          <span class="prefix">Prefix: {envModules[activeModule].prefix}</span>
        </div>
        <p class="env-desc">{envModules[activeModule].description}</p>
        <pre><code>{envModules[activeModule].example}</code></pre>
      </div>

      <div class="comparison-table">
        <h3>Quick Comparison</h3>
        <div class="table-row header">
          <span>Module</span><span>Prefix</span><span>Timing</span><span>Access</span>
        </div>
        {#each envModules as mod}
          <div class="table-row">
            <code>{mod.name.split('/').slice(1).join('/')}</code>
            <span>{mod.prefix}</span>
            <span>{mod.timing}</span>
            <span>{mod.access}</span>
          </div>
        {/each}
      </div>
    </section>

  {:else if activeTab === 'server'}
    <section>
      <h2>$lib/server/ — Server-Only Boundary</h2>
      <div class="server-warning">
        Any file inside <code>src/lib/server/</code> can only be imported in server-side code.
        Importing it in a <code>.svelte</code> component or <code>+page.ts</code> causes a build error.
      </div>
      <pre><code>{serverOnlyCode}</code></pre>
    </section>

  {:else}
    <section>
      <h2>Transport Hook — Custom Serialization</h2>
      <div class="transport-info">
        By default, data crossing the server-client boundary must be JSON-serializable. The transport hook lets you define custom encode/decode functions for types like Date, Set, Map, and BigInt.
      </div>
      <pre><code>{transportCode}</code></pre>
    </section>
  {/if}
</main>

<style>
  main { max-width: 900px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  h1 { text-align: center; color: #333; }
  h2 { color: #555; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
  h3 { color: #555; margin: 1.25rem 0 0.5rem; }
  .subtitle { text-align: center; color: #666; }
  section { margin: 2rem 0; }

  .main-tabs { display: flex; gap: 0.5rem; margin: 2rem 0 1.5rem; }
  .main-tabs button {
    flex: 1; padding: 0.7rem; border: 2px solid #e0e0e0; border-radius: 8px;
    background: #f8f9fa; cursor: pointer; font-weight: 600; font-size: 0.95rem;
  }
  .main-tabs button.active { border-color: #7b1fa2; background: #f3e5f5; color: #7b1fa2; }

  .env-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; }
  .env-card {
    display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem;
    border: 2px solid #e0e0e0; border-radius: 10px; background: #fafafa;
    cursor: pointer; text-align: left;
  }
  .env-card.active { border-color: #7b1fa2; background: #f3e5f5; }
  .env-name { font-size: 0.82rem; font-weight: 600; color: #7b1fa2; }
  .env-meta { display: flex; gap: 0.25rem; }
  .badge {
    font-size: 0.7rem; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 600;
  }
  .badge.timing { background: #e3f2fd; color: #1976d2; }
  .badge.access { background: #e8f5e9; color: #2e7d32; }

  .env-detail { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
  .env-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
  .env-header code { font-size: 1rem; font-weight: 700; color: #7b1fa2; background: #f3e5f5; padding: 0.3rem 0.6rem; border-radius: 6px; }
  .prefix { font-size: 0.85rem; color: #666; }
  .env-desc { color: #555; line-height: 1.6; }

  .comparison-table { background: #f8f9fa; border-radius: 10px; overflow: hidden; border: 1px solid #e0e0e0; }
  .table-row { display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr; gap: 0.5rem; padding: 0.5rem 1rem; font-size: 0.82rem; align-items: center; }
  .table-row.header { background: #e0e0e0; font-weight: 700; font-size: 0.85rem; }
  .table-row:not(.header) { border-bottom: 1px solid #eee; }
  .table-row code { font-size: 0.78rem; background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; }

  .server-warning {
    background: #fff3e0; border: 1px solid #ffcc80; border-radius: 10px;
    padding: 1rem; color: #e65100; font-size: 0.9rem; margin-bottom: 1.5rem;
  }
  .server-warning code { background: rgba(0,0,0,0.1); padding: 0.1rem 0.3rem; border-radius: 3px; }

  .transport-info {
    background: #e3f2fd; border: 1px solid #90caf9; border-radius: 10px;
    padding: 1rem; color: #1565c0; font-size: 0.9rem; margin-bottom: 1.5rem;
  }

  pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 8px; font-size: 0.76rem; overflow-x: auto; line-height: 1.5; }
  code { font-family: 'Fira Code', monospace; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
