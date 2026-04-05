import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-9',
		title: 'Environment, Server-Only & Transport',
		phase: 5,
		module: 17,
		lessonIndex: 9
	},
	description: `SvelteKit gives you four environment modules that map directly onto whether a secret should ever reach the browser:

- $env/static/private — build-time env vars, server-only. Compiled into server bundles, never exposed to client. Use for DATABASE_URL, API_SECRET, STRIPE_SECRET_KEY.
- $env/static/public — build-time env vars prefixed with PUBLIC_. Compiled into BOTH server and client bundles. Use for PUBLIC_API_URL, PUBLIC_SENTRY_DSN.
- $env/dynamic/private — runtime env vars, server-only. Read via process.env at request time; great for adapter-node or edge environments where secrets are injected at runtime.
- $env/dynamic/public — runtime env vars prefixed with PUBLIC_, available everywhere.

SvelteKit enforces this at the bundler level: importing $env/static/private from client code is a BUILD ERROR. Files under src/lib/server/ are similarly locked down — you cannot import them from anywhere client-reachable. Together these prevent accidental leaks.

The transport hook (new in SvelteKit 2) lets you send NON-serializable values across the server/client boundary from load functions. Date, Map, Set, BigInt, custom classes — anything that JSON.stringify would lose — can round-trip via transport. You define encode (serialize) and decode (deserialize) for each type.`,
	objectives: [
		'Use $env/static/private and $env/static/public for build-time config',
		'Use $env/dynamic/* for runtime env vars under adapter-node or edge',
		"Lock server-only code in src/lib/server/ so it can't leak to the client",
		'Configure the transport hook to send Date, Map, Set, and custom classes',
		'Understand why PUBLIC_ prefix matters and when to use dynamic vs static'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // Interactive env-module explorer.
  // Shows you which module to import for each kind of variable
  // and whether it's safe on the client.
  // ============================================================
  type EnvVar = {
    name: string;
    value: string;
    public: boolean;
    dynamic: boolean;
    description: string;
  };

  const envVars: EnvVar[] = [
    { name: 'DATABASE_URL',     value: 'postgres://...',             public: false, dynamic: false, description: 'DB connection string — baked at build' },
    { name: 'STRIPE_SECRET',    value: 'sk_live_***',                public: false, dynamic: false, description: 'Payment gateway secret' },
    { name: 'API_KEY',          value: 'key_***',                    public: false, dynamic: true,  description: 'Server-side API key, rotated at runtime' },
    { name: 'JWT_SECRET',       value: '***',                        public: false, dynamic: true,  description: 'Signing key for auth tokens' },
    { name: 'PUBLIC_API_URL',   value: 'https://api.example.com',    public: true,  dynamic: false, description: 'Public REST base — same in every build' },
    { name: 'PUBLIC_SENTRY_DSN',value: 'https://...@sentry.io/1',    public: true,  dynamic: false, description: 'Error reporting DSN' },
    { name: 'PUBLIC_FEATURE_X', value: 'enabled',                    public: true,  dynamic: true,  description: 'Feature flag toggled at runtime' },
    { name: 'PUBLIC_REGION',    value: 'eu-west',                    public: true,  dynamic: true,  description: 'Region hint injected by the deployment' }
  ];

  function moduleFor(v: EnvVar): string {
    if (v.public && v.dynamic) return '$env/dynamic/public';
    if (v.public && !v.dynamic) return '$env/static/public';
    if (!v.public && v.dynamic) return '$env/dynamic/private';
    return '$env/static/private';
  }

  function importableFromClient(v: EnvVar): boolean {
    return v.public;
  }

  // ============================================================
  // Transport hook — demo of custom types round-tripping
  // ============================================================
  type TransportEntry = {
    type: string;
    original: unknown;
    encoded: unknown;
    decoded: string;
  };

  class Money {
    amount: number;
    currency: string;
    constructor(amount: number, currency: string) {
      this.amount = amount;
      this.currency = currency;
    }
    format(): string {
      return \`\${this.currency} \${this.amount.toFixed(2)}\`;
    }
  }

  // Transport hook definition — each entry: [encode, decode]
  const transport = {
    Date: {
      encode: (v: unknown) => v instanceof Date ? v.toISOString() : false,
      decode: (v: unknown) => new Date(v as string)
    },
    Map: {
      encode: (v: unknown) => v instanceof Map ? Array.from(v.entries()) : false,
      decode: (v: unknown) => new Map(v as [unknown, unknown][])
    },
    Set: {
      encode: (v: unknown) => v instanceof Set ? Array.from(v) : false,
      decode: (v: unknown) => new Set(v as unknown[])
    },
    BigInt: {
      encode: (v: unknown) => typeof v === 'bigint' ? v.toString() : false,
      decode: (v: unknown) => BigInt(v as string)
    },
    Money: {
      encode: (v: unknown) => v instanceof Money ? [v.amount, v.currency] : false,
      decode: (v: unknown) => new Money(...(v as [number, string]))
    }
  };

  const samples: [string, unknown][] = [
    ['Date', new Date('2025-01-15T10:30:00Z')],
    ['Map',  new Map([['a', 1], ['b', 2], ['c', 3]])],
    ['Set',  new Set(['svelte', 'kit', 'typescript'])],
    ['BigInt', 123456789012345678901234567890n],
    ['Money', new Money(42.99, 'EUR')]
  ];

  const transportResults: TransportEntry[] = samples.map(([type, value]) => {
    const hook = transport[type as keyof typeof transport];
    const encoded = hook.encode(value);
    const decoded = hook.decode(encoded);
    let formatted = String(decoded);
    if (type === 'Date' && decoded instanceof Date) formatted = decoded.toISOString();
    if (type === 'Map' && decoded instanceof Map) formatted = \`Map(\${decoded.size}) \${JSON.stringify(Array.from(decoded.entries()))}\`;
    if (type === 'Set' && decoded instanceof Set) formatted = \`Set(\${decoded.size}) \${JSON.stringify(Array.from(decoded))}\`;
    if (type === 'Money' && decoded instanceof Money) formatted = decoded.format();
    return {
      type,
      original: value,
      encoded,
      decoded: formatted
    };
  });

  let showCode: 'env' | 'server' | 'transport' = $state('env');

  const codeExamples: Record<string, string> = {
    env: \`// src/routes/+page.server.ts
import { DATABASE_URL, STRIPE_SECRET } from '$env/static/private';
// Build-time import. Never reaches the client bundle — if you
// try to import this from +page.svelte it's a BUILD ERROR.

import { PUBLIC_API_URL } from '$env/static/public';
// Public vars must start with PUBLIC_. Available everywhere.

// For runtime env (values injected after build, e.g. via
// fly.io secrets, Vercel env, or docker env):
import { env } from '$env/dynamic/private';
const apiKey = env.API_KEY; // read at request time

import { env as publicEnv } from '$env/dynamic/public';
const region = publicEnv.PUBLIC_REGION;

// svelte.config.js — customize the public prefix
export default {
  kit: {
    env: {
      publicPrefix: 'PUBLIC_',     // default
      privatePrefix: '',           // default: everything else
      dir: process.cwd()           // .env file location
    }
  }
};\`,

    server: \`// Files under src/lib/server/ are LOCKED.
// Importing them from client-reachable code is a build error.

// src/lib/server/db.ts
import { DATABASE_URL } from '$env/static/private';
import postgres from 'postgres';
export const sql = postgres(DATABASE_URL);

// src/lib/server/auth.ts
import { getRequestEvent } from '$app/server';
import { sql } from './db';
export async function getCurrentUser() {
  const { cookies } = getRequestEvent();
  const sessionId = cookies.get('session');
  if (!sessionId) return null;
  return sql\\\`SELECT * FROM users WHERE session = \\\${sessionId}\\\`;
}

// src/routes/dashboard/+page.server.ts — OK
import { getCurrentUser } from '$lib/server/auth';

// src/routes/dashboard/+page.svelte — BUILD ERROR
// import { getCurrentUser } from '$lib/server/auth';
//                              ^^^^^^^^^^^^^^^^^^^^
// Cannot import $lib/server/* from client code.

// Also forbidden: importing $env/static/private from any
// component file (.svelte), any +page.ts (universal load),
// or any module reachable from client.\`,

    transport: \`// src/hooks.ts — transport hook (runs on both sides)
// Each entry has encode (server -> wire) and decode (wire -> client).
// encode returns \\\`false\\\` to signal "not my type, try the next one".

import type { Transport } from '@sveltejs/kit';

class Money {
  constructor(public amount: number, public currency: string) {}
  format() { return \\\`\\\${this.currency} \\\${this.amount.toFixed(2)}\\\`; }
}

export const transport: Transport = {
  Date: {
    encode: (v) => v instanceof Date && v.toISOString(),
    decode: (v) => new Date(v)
  },
  Map: {
    encode: (v) => v instanceof Map && Array.from(v.entries()),
    decode: (v) => new Map(v)
  },
  Set: {
    encode: (v) => v instanceof Set && Array.from(v),
    decode: (v) => new Set(v)
  },
  BigInt: {
    encode: (v) => typeof v === 'bigint' && v.toString(),
    decode: (v) => BigInt(v)
  },
  Money: {
    encode: (v) => v instanceof Money && [v.amount, v.currency],
    decode: ([amount, currency]) => new Money(amount, currency)
  }
};

// Now a load function can return rich values:
// src/routes/+page.server.ts
export const load = async () => {
  return {
    now:       new Date(),
    tags:      new Set(['svelte', 'kit']),
    scores:    new Map([['alice', 10], ['bob', 7]]),
    bigNumber: 9007199254740993n,
    price:     new Money(42.99, 'EUR')
  };
};

// And the component receives them as the real types —
// not strings or arrays — thanks to the decode step.
// src/routes/+page.svelte
<script lang="ts">
  let { data } = $props();
  console.log(data.now instanceof Date);     // true
  console.log(data.price.format());          // "EUR 42.99"
</script>\`
  };
</script>

<h1>Environment, Server-Only &amp; Transport</h1>

<section>
  <h2>Env variable classifier</h2>
  <p class="note">
    For each variable, SvelteKit provides one of four modules.
    Public values reach the browser; private values never do.
  </p>

  <div class="env-grid">
    <div class="env-header">
      <span>Name</span>
      <span>Public</span>
      <span>Dynamic</span>
      <span>Import from</span>
      <span>Client?</span>
    </div>
    {#each envVars as v (v.name)}
      <div class="env-row">
        <div>
          <code class="var-name">{v.name}</code>
          <div class="var-desc">{v.description}</div>
        </div>
        <span class:yes={v.public} class:no={!v.public}>
          {v.public ? 'yes' : 'no'}
        </span>
        <span class:yes={v.dynamic} class:no={!v.dynamic}>
          {v.dynamic ? 'yes' : 'no'}
        </span>
        <code class="module">{moduleFor(v)}</code>
        <span class="reach" class:safe={importableFromClient(v)} class:blocked={!importableFromClient(v)}>
          {importableFromClient(v) ? 'ok' : 'server-only'}
        </span>
      </div>
    {/each}
  </div>
</section>

<section>
  <h2>Transport hook — round-trip demo</h2>
  <p class="note">
    Server encodes each value, it travels as JSON, client decodes
    it back to the original type. Notice how Date, Map, Set, BigInt,
    and our custom <code>Money</code> class all survive the trip.
  </p>

  <div class="transport">
    {#each transportResults as entry (entry.type)}
      <div class="transport-row">
        <div class="t-type">{entry.type}</div>
        <div class="t-step">
          <span class="t-label">original</span>
          <code>{
            entry.type === 'Date' ? (entry.original as Date).toISOString() :
            entry.type === 'Map'  ? \`Map(\${(entry.original as Map<unknown, unknown>).size})\` :
            entry.type === 'Set'  ? \`Set(\${(entry.original as Set<unknown>).size})\` :
            entry.type === 'Money' ? (entry.original as Money).format() :
            String(entry.original)
          }</code>
        </div>
        <div class="t-arrow">&rarr;</div>
        <div class="t-step">
          <span class="t-label">wire (JSON)</span>
          <code>{JSON.stringify(entry.encoded)}</code>
        </div>
        <div class="t-arrow">&rarr;</div>
        <div class="t-step">
          <span class="t-label">decoded</span>
          <code>{entry.decoded}</code>
        </div>
      </div>
    {/each}
  </div>
</section>

<section>
  <h2>Code reference</h2>
  <div class="tabs">
    {#each ['env', 'server', 'transport'] as tab (tab)}
      <button
        class:active={showCode === tab}
        onclick={() => (showCode = tab as typeof showCode)}
      >
        {tab === 'env' ? '$env/*' : tab === 'server' ? '$lib/server' : 'transport'}
      </button>
    {/each}
  </div>
  <pre class="code"><code>{codeExamples[showCode]}</code></pre>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #00b894; font-size: 1.05rem; }
  .note { font-size: 0.85rem; color: #636e72; margin: 0 0 0.75rem; }
  .note code { background: #dfe6e9; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }
  .env-grid {
    background: white; border-radius: 6px; overflow: hidden;
    border: 1px solid #dfe6e9;
  }
  .env-header, .env-row {
    display: grid;
    grid-template-columns: 2.3fr 0.6fr 0.7fr 1.6fr 1fr;
    gap: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.8rem;
    align-items: center;
  }
  .env-header {
    background: #00b894; color: white; font-weight: 700;
    text-transform: uppercase; font-size: 0.7rem;
    letter-spacing: 0.05em;
  }
  .env-row { border-top: 1px solid #f1f2f6; }
  .var-name {
    font-family: monospace; color: #2d3436; font-weight: 600;
    font-size: 0.8rem;
  }
  .var-desc { font-size: 0.7rem; color: #636e72; margin-top: 0.1rem; }
  .yes {
    color: #00b894; font-weight: 700; text-transform: uppercase; font-size: 0.7rem;
  }
  .no {
    color: #b2bec3; font-weight: 700; text-transform: uppercase; font-size: 0.7rem;
  }
  .module {
    font-family: monospace; font-size: 0.75rem;
    background: #dfe6e9; padding: 0.15rem 0.4rem;
    border-radius: 3px; color: #6c5ce7;
  }
  .reach {
    font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
    padding: 0.15rem 0.4rem; border-radius: 3px; text-align: center;
  }
  .reach.safe { background: #d1f2eb; color: #00695c; }
  .reach.blocked { background: #fdecea; color: #c0392b; }
  .transport {
    display: flex; flex-direction: column; gap: 0.5rem;
  }
  .transport-row {
    display: grid;
    grid-template-columns: 80px 1fr 20px 1fr 20px 1fr;
    gap: 0.5rem; align-items: center;
    background: white; padding: 0.5rem 0.75rem;
    border-radius: 6px; border: 1px solid #dfe6e9;
  }
  .t-type {
    font-family: monospace; font-weight: 700;
    color: #6c5ce7; font-size: 0.9rem;
  }
  .t-step { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
  .t-label {
    font-size: 0.65rem; color: #b2bec3;
    text-transform: uppercase; font-weight: 700;
  }
  .t-step code {
    font-family: monospace; font-size: 0.75rem;
    color: #2d3436; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .t-arrow { text-align: center; color: #b2bec3; font-size: 1.2rem; }
  .tabs { display: flex; gap: 2px; }
  .tabs button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px 4px 0 0;
    background: #dfe6e9; color: #636e72; cursor: pointer;
    font-weight: 600; font-size: 0.8rem; font-family: monospace;
  }
  .tabs button.active { background: #2d3436; color: #dfe6e9; }
  .code {
    padding: 1rem; background: #2d3436;
    border-radius: 0 6px 6px 6px; overflow-x: auto; margin: 0;
  }
  .code code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; font-family: monospace; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
