import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-9',
		title: 'Environment, Server-Only & Transport',
		phase: 5,
		module: 17,
		lessonIndex: 9
	},
	description: `SvelteKit provides structured access to environment variables through dedicated modules. $env/static/private and $env/static/public expose build-time variables (tree-shakeable), while $env/dynamic/private and $env/dynamic/public provide runtime variables. Private env vars are never exposed to the client.

The $lib/server/ convention restricts modules to server-side imports only — attempting to import them in client code causes a build error, preventing accidental secret exposure. SvelteKit's transport hook lets you serialize non-JSON types like Date, Map, Set, and custom classes across the server/client boundary, so load function data arrives fully typed.`,
	objectives: [
		'Access environment variables safely through $env modules',
		'Distinguish between static/dynamic and private/public env variables',
		'Use $lib/server/ to enforce server-only module boundaries',
		'Configure the transport hook to serialize custom types across boundaries'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let activeTab: 'env' | 'server' | 'transport' = $state('env');

  // Simulated environment variables
  const envVars = {
    staticPrivate: [
      { key: 'DATABASE_URL', value: 'postgres://localhost:5432/mydb', safe: false },
      { key: 'API_SECRET', value: 'sk_live_abc123...', safe: false },
      { key: 'SMTP_PASSWORD', value: 'mail_pass_xyz', safe: false },
    ],
    staticPublic: [
      { key: 'PUBLIC_API_URL', value: 'https://api.example.com', safe: true },
      { key: 'PUBLIC_APP_NAME', value: 'My SvelteKit App', safe: true },
      { key: 'PUBLIC_VERSION', value: '2.1.0', safe: true },
    ],
    dynamicPrivate: [
      { key: 'RUNTIME_SECRET', value: '(set at runtime)', safe: false },
    ],
    dynamicPublic: [
      { key: 'PUBLIC_FEATURE_FLAG', value: 'true', safe: true },
    ],
  };

  let showSecrets: boolean = $state(false);

  const transportExample = \`// svelte.config.js
export default &#123;
  kit: &#123;
    transport: &#123;
      // Register custom type serializers
      Date: &#123;
        encode: (value) => value instanceof Date
          ? value.toISOString()
          : false,
        decode: (str) => new Date(str),
      &#125;,
      Map: &#123;
        encode: (value) => value instanceof Map
          ? Array.from(value.entries())
          : false,
        decode: (entries) => new Map(entries),
      &#125;,
      Set: &#123;
        encode: (value) => value instanceof Set
          ? Array.from(value)
          : false,
        decode: (arr) => new Set(arr),
      &#125;,
    &#125;,
  &#125;,
&#125;;\`;

  const serverOnlyExample = \`// $lib/server/db.ts — ONLY importable on the server
import &#123; DATABASE_URL &#125; from '$env/static/private';

const pool = new Pool(&#123; connectionString: DATABASE_URL &#125;);

export async function getUsers() &#123;
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
&#125;

// If client code tries to import this:
// import &#123; getUsers &#125; from '$lib/server/db';
// BUILD ERROR: Cannot import $lib/server/db into client-side code\`;
</script>

<h1>Environment & Transport</h1>

<div class="tabs">
  <button class:active={activeTab === 'env'} onclick={() => activeTab = 'env'}>$env Modules</button>
  <button class:active={activeTab === 'server'} onclick={() => activeTab = 'server'}>Server-Only</button>
  <button class:active={activeTab === 'transport'} onclick={() => activeTab = 'transport'}>Transport</button>
</div>

{#if activeTab === 'env'}
  <section>
    <h2>Environment Variables</h2>

    <label class="toggle">
      <input type="checkbox" bind:checked={showSecrets} />
      Show secret values (never do this in production!)
    </label>

    <div class="env-grid">
      <div class="env-group">
        <h3>$env/static/private</h3>
        <p class="env-desc">Build-time, server-only, tree-shakeable</p>
        {#each envVars.staticPrivate as v}
          <div class="env-row private">
            <code class="env-key">{v.key}</code>
            <code class="env-val">{showSecrets ? v.value : '••••••••'}</code>
            <span class="env-badge private">PRIVATE</span>
          </div>
        {/each}
      </div>

      <div class="env-group">
        <h3>$env/static/public</h3>
        <p class="env-desc">Build-time, client-safe, tree-shakeable</p>
        {#each envVars.staticPublic as v}
          <div class="env-row public">
            <code class="env-key">{v.key}</code>
            <code class="env-val">{v.value}</code>
            <span class="env-badge public">PUBLIC</span>
          </div>
        {/each}
      </div>

      <div class="env-group">
        <h3>$env/dynamic/private</h3>
        <p class="env-desc">Runtime, server-only</p>
        {#each envVars.dynamicPrivate as v}
          <div class="env-row private">
            <code class="env-key">{v.key}</code>
            <code class="env-val">{showSecrets ? v.value : '••••••••'}</code>
            <span class="env-badge private">PRIVATE</span>
          </div>
        {/each}
      </div>

      <div class="env-group">
        <h3>$env/dynamic/public</h3>
        <p class="env-desc">Runtime, client-safe</p>
        {#each envVars.dynamicPublic as v}
          <div class="env-row public">
            <code class="env-key">{v.key}</code>
            <code class="env-val">{v.value}</code>
            <span class="env-badge public">PUBLIC</span>
          </div>
        {/each}
      </div>
    </div>

    <pre class="code"><code>// Server-only (hooks, load, actions, endpoints)
import &#123; DATABASE_URL &#125; from '$env/static/private';
import &#123; env &#125; from '$env/dynamic/private';

// Anywhere (including client)
import &#123; PUBLIC_API_URL &#125; from '$env/static/public';
import &#123; env &#125; from '$env/dynamic/public';</code></pre>
  </section>

{:else if activeTab === 'server'}
  <section>
    <h2>$lib/server/ — Server-Only Modules</h2>

    <div class="file-tree">
      <div class="file-entry dir">src/lib/</div>
      <div class="file-entry dir indent">server/</div>
      <div class="file-entry file indent2 restricted">db.ts <span class="badge">server only</span></div>
      <div class="file-entry file indent2 restricted">auth.ts <span class="badge">server only</span></div>
      <div class="file-entry file indent2 restricted">email.ts <span class="badge">server only</span></div>
      <div class="file-entry dir indent">components/</div>
      <div class="file-entry file indent2">Button.svelte</div>
      <div class="file-entry dir indent">utils/</div>
      <div class="file-entry file indent2">format.ts</div>
    </div>

    <div class="rule-cards">
      <div class="rule-card safe">
        <h3>Allowed</h3>
        <code>+page.server.ts -> $lib/server/db.ts</code>
        <code>+server.ts -> $lib/server/auth.ts</code>
        <code>hooks.server.ts -> $lib/server/email.ts</code>
      </div>
      <div class="rule-card blocked">
        <h3>Build Error</h3>
        <code>+page.svelte -> $lib/server/db.ts</code>
        <code>$lib/utils/format.ts -> $lib/server/auth.ts</code>
      </div>
    </div>

    <pre class="code"><code>{serverOnlyExample}</code></pre>
  </section>

{:else}
  <section>
    <h2>Transport Hook — Custom Serialization</h2>

    <p>By default, SvelteKit can only pass JSON-serializable data from load functions to pages. The transport hook lets you register serializers for custom types.</p>

    <div class="type-cards">
      <div class="type-card">
        <h3>Date</h3>
        <p>Serialized as ISO string, deserialized back to Date object</p>
        <code>new Date() -> "2026-03-19T..." -> new Date()</code>
      </div>
      <div class="type-card">
        <h3>Map</h3>
        <p>Serialized as array of entries, deserialized back to Map</p>
        <code>new Map([...]) -> [[k,v],...] -> new Map([...])</code>
      </div>
      <div class="type-card">
        <h3>Set</h3>
        <p>Serialized as array, deserialized back to Set</p>
        <code>new Set([...]) -> [...] -> new Set([...])</code>
      </div>
      <div class="type-card">
        <h3>Custom Classes</h3>
        <p>Register your own encode/decode for any type</p>
        <code>new User({...}) -> &#123;...&#125; -> new User({...})</code>
      </div>
    </div>

    <pre class="code"><code>{transportExample}</code></pre>

    <pre class="code"><code>// +page.server.ts — return rich types
export async function load() &#123;
  return &#123;
    createdAt: new Date(),           // Transported as Date
    tags: new Set(['svelte', 'ts']), // Transported as Set
    metadata: new Map([              // Transported as Map
      ['version', '2.0'],
      ['author', 'Alice'],
    ]),
  &#125;;
&#125;

// +page.svelte — receives actual Date, Set, Map objects
// data.createdAt instanceof Date === true</code></pre>
  </section>
{/if}

<style>
  h1 { color: #2d3436; }
  .tabs { display: flex; gap: 2px; margin-bottom: 0; }
  .tabs button {
    flex: 1; padding: 0.6rem; border: none; background: #dfe6e9;
    cursor: pointer; font-weight: 600; border-radius: 4px 4px 0 0;
  }
  .tabs button.active { background: #00b894; color: white; }
  section { padding: 1rem; background: #f8f9fa; border-radius: 0 0 8px 8px; }
  h2 { margin-top: 0; color: #00b894; font-size: 1.1rem; }
  h3 { margin: 0 0 0.25rem; font-size: 0.95rem; }
  .toggle {
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 0.85rem; margin-bottom: 1rem;
  }
  .env-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
  .env-group {
    padding: 0.75rem; background: white; border-radius: 6px;
    border: 1px solid #dfe6e9;
  }
  .env-desc { font-size: 0.75rem; color: #636e72; margin: 0 0 0.5rem; }
  .env-row {
    display: flex; gap: 0.5rem; align-items: center;
    padding: 0.3rem 0; font-size: 0.8rem; flex-wrap: wrap;
  }
  .env-key { font-weight: 600; }
  .env-val { color: #636e72; word-break: break-all; }
  .env-badge {
    padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.65rem;
    font-weight: 700;
  }
  .env-badge.private { background: #ff7675; color: white; }
  .env-badge.public { background: #00b894; color: white; }
  .file-tree {
    padding: 0.75rem; background: #2d3436; border-radius: 6px;
    margin-bottom: 1rem; font-family: monospace; font-size: 0.85rem;
    color: #dfe6e9;
  }
  .file-entry { padding: 0.15rem 0; }
  .dir { color: #74b9ff; }
  .indent { padding-left: 1rem; }
  .indent2 { padding-left: 2rem; }
  .restricted { color: #ff7675; }
  .badge {
    font-size: 0.7rem; padding: 0.1rem 0.3rem; background: #ff7675;
    border-radius: 3px; color: white; margin-left: 0.5rem;
  }
  .rule-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
  .rule-card {
    padding: 0.75rem; border-radius: 6px;
  }
  .rule-card.safe { background: #e8f8f0; border: 1px solid #00b894; }
  .rule-card.blocked { background: #fff5f5; border: 1px solid #ff7675; }
  .rule-card h3 { font-size: 0.9rem; }
  .rule-card.safe h3 { color: #00b894; }
  .rule-card.blocked h3 { color: #d63031; }
  .rule-card code {
    display: block; font-size: 0.75rem; color: #2d3436;
    padding: 0.2rem 0; background: transparent;
  }
  .type-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem; }
  .type-card {
    padding: 0.75rem; background: white; border-radius: 6px;
    border: 1px solid #dfe6e9;
  }
  .type-card p { font-size: 0.8rem; color: #636e72; margin: 0.2rem 0; }
  .type-card code { font-size: 0.75rem; color: #00b894; display: block; background: transparent; }
  button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #00b894; color: white; cursor: pointer; font-weight: 600;
  }
  .code, pre {
    background: #2d3436; padding: 0.75rem; border-radius: 6px;
    overflow-x: auto; margin: 0 0 0.75rem;
  }
  code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
