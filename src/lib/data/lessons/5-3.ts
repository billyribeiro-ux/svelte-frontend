import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '5-3',
		title: 'URLs, Query Strings & URL API',
		phase: 2,
		module: 5,
		lessonIndex: 3
	},
	description: `URLs are the addresses of the web. Every link you click, every API you call, every page you visit — it all starts with a URL. Understanding their anatomy is essential for building routed web apps and calling APIs.

A URL has distinct parts: **protocol** (\`https:\`), **host** (\`example.com\`), **port** (\`:8080\`), **pathname** (\`/products/42\`), **search** (\`?sort=price\`), and **hash** (\`#reviews\`). JavaScript gives you two built-in classes — \`URL\` and \`URLSearchParams\` — that let you parse, build, and manipulate URLs without messy string concatenation.

You'll also learn about **encoding**: special characters like spaces, \`&\`, and \`=\` have special meaning in URLs, so you use \`encodeURIComponent\` to escape them safely when putting user input into a URL. Forget this and your query strings break the moment someone types an ampersand.`,
	objectives: [
		'Break down a URL into its component parts (protocol, host, pathname, search, hash)',
		'Use the URL and URLSearchParams APIs to parse and build query strings',
		'Read, set, append, and delete individual query parameters',
		'Understand when and why to use encodeURIComponent vs encodeURI',
		'Build API URLs safely from user input'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === Parse an arbitrary URL ===
  let rawUrl = $state('https://shop.example.com:8080/products/42?sort=price&filter=new&q=hello%20world#reviews');

  // $derived.by runs a function whose return value is the derived value.
  // try/catch because \`new URL('not a url')\` throws.
  let parsedUrl = $derived.by(() => {
    try {
      return new URL(rawUrl);
    } catch {
      return null;
    }
  });

  // Extract search params into an iterable list of {key, value} pairs.
  let params = $derived.by(() => {
    if (!parsedUrl) return [];
    const entries = [];
    parsedUrl.searchParams.forEach((value, key) => {
      entries.push({ key, value });
    });
    return entries;
  });

  // === Build a URL from parts ===
  let buildProtocol = $state('https');
  let buildHost = $state('api.example.com');
  let buildPath = $state('/search');
  let newParamKey = $state('');
  let newParamValue = $state('');

  // Controlled list of query params — start with one example.
  let builtParams = $state([
    { key: 'q', value: 'hello world' },
    { key: 'page', value: '1' }
  ]);

  let builtUrl = $derived.by(() => {
    try {
      const url = new URL(\`\${buildProtocol}://\${buildHost}\${buildPath.startsWith('/') ? buildPath : '/' + buildPath}\`);
      for (const { key, value } of builtParams) {
        if (key) url.searchParams.set(key, value);
      }
      return url.toString();
    } catch {
      return '(invalid)';
    }
  });

  function addParam() {
    if (!newParamKey) return;
    builtParams = [...builtParams, { key: newParamKey, value: newParamValue }];
    newParamKey = '';
    newParamValue = '';
  }

  function removeParam(i) {
    builtParams = builtParams.filter((_, idx) => idx !== i);
  }

  // === Encoding playground ===
  let encInput = $state('Hello World & friends = fun!');
  let encoded = $derived(encodeURIComponent(encInput));
  let decoded = $derived.by(() => {
    try {
      return decodeURIComponent(encoded);
    } catch {
      return '(error)';
    }
  });

  // === Common danger: raw concatenation vs safe building ===
  let searchQuery = $state('cats & dogs');
  let unsafeUrl = $derived(\`https://api.example.com/search?q=\${searchQuery}\`);
  let safeUrl = $derived.by(() => {
    const u = new URL('https://api.example.com/search');
    u.searchParams.set('q', searchQuery);
    return u.toString();
  });
</script>

<h1>URLs, Query Strings &amp; the URL API</h1>

<p class="lead">
  A URL is more than a string — it's a structured address with parts the browser and servers
  both understand. JavaScript's built-in <code>URL</code> class gives you safe, ergonomic access
  to every part.
</p>

<section>
  <h2>1. Parse a URL</h2>
  <input
    type="text"
    bind:value={rawUrl}
    placeholder="Paste a URL here"
    class="url-input"
  />

  {#if parsedUrl}
    <div class="parts">
      <div class="part">
        <span class="label">protocol</span>
        <span class="value protocol">{parsedUrl.protocol}</span>
      </div>
      <div class="part">
        <span class="label">host</span>
        <span class="value host">{parsedUrl.host}</span>
      </div>
      <div class="part">
        <span class="label">hostname</span>
        <span class="value">{parsedUrl.hostname}</span>
      </div>
      <div class="part">
        <span class="label">port</span>
        <span class="value">{parsedUrl.port || '(default)'}</span>
      </div>
      <div class="part">
        <span class="label">pathname</span>
        <span class="value path">{parsedUrl.pathname}</span>
      </div>
      <div class="part">
        <span class="label">search</span>
        <span class="value search">{parsedUrl.search || '(none)'}</span>
      </div>
      <div class="part">
        <span class="label">hash</span>
        <span class="value hash">{parsedUrl.hash || '(none)'}</span>
      </div>
      <div class="part">
        <span class="label">origin</span>
        <span class="value">{parsedUrl.origin}</span>
      </div>
    </div>

    {#if params.length > 0}
      <h3>Query Parameters</h3>
      <table>
        <thead><tr><th>Key</th><th>Value</th></tr></thead>
        <tbody>
          {#each params as p (p.key)}
            <tr><td><code>{p.key}</code></td><td>{p.value}</td></tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {:else}
    <p class="error">Invalid URL — try entering a complete URL with <code>https://</code></p>
  {/if}
</section>

<section>
  <h2>2. Build a URL</h2>

  <div class="builder">
    <label>
      Protocol
      <select bind:value={buildProtocol}>
        <option value="https">https</option>
        <option value="http">http</option>
        <option value="ws">ws</option>
        <option value="wss">wss</option>
      </select>
    </label>
    <label>Host <input bind:value={buildHost} /></label>
    <label>Path <input bind:value={buildPath} /></label>
  </div>

  <h3>Query parameters</h3>
  <div class="param-list">
    {#each builtParams as p, i (i)}
      <div class="param-row">
        <input bind:value={p.key} placeholder="key" />
        <span>=</span>
        <input bind:value={p.value} placeholder="value" />
        <button class="remove" onclick={() => removeParam(i)}>&times;</button>
      </div>
    {/each}
  </div>

  <div class="add-row">
    <input bind:value={newParamKey} placeholder="new key" />
    <input bind:value={newParamValue} placeholder="new value" />
    <button onclick={addParam}>Add</button>
  </div>

  <div class="result">
    <strong>Result:</strong>
    <code class="big">{builtUrl}</code>
  </div>
</section>

<section>
  <h2>3. Encoding &amp; Decoding</h2>
  <label class="full-label">
    Try typing special characters (&amp;, =, spaces, unicode):
    <input bind:value={encInput} />
  </label>
  <div class="enc-grid">
    <div>
      <span class="m-label">encodeURIComponent</span>
      <code class="small">{encoded}</code>
    </div>
    <div>
      <span class="m-label">decodeURIComponent (round-trip)</span>
      <code class="small">{decoded}</code>
    </div>
  </div>
  <p class="note">
    <code>encodeURIComponent</code> escapes every reserved character so it can sit safely
    inside a query parameter. Use it whenever you stick user input into a URL by hand —
    or just use <code>URLSearchParams</code>, which does it for you.
  </p>
</section>

<section>
  <h2>4. Why You Should Never Concatenate</h2>
  <label class="full-label">
    Search for: <input bind:value={searchQuery} />
  </label>

  <div class="comparison">
    <div class="panel bad">
      <h4>Unsafe (template string)</h4>
      <pre>\`https://.../search?q=\${query}\`</pre>
      <p class="small-url">{unsafeUrl}</p>
      <p class="warn">
        The <code>&amp;</code> in "cats &amp; dogs" looks like a parameter separator!
        The server will see <code>q=cats </code> and <code>dogs=</code>.
      </p>
    </div>

    <div class="panel good">
      <h4>Safe (URLSearchParams)</h4>
      <pre>url.searchParams.set('q', query)</pre>
      <p class="small-url">{safeUrl}</p>
      <p class="ok">
        The <code>&amp;</code> is correctly encoded as <code>%26</code>. Works for any input.
      </p>
    </div>
  </div>
</section>

<div class="cheatsheet">
  <h3>URL API Cheat Sheet</h3>
  <ul>
    <li><code>new URL(str)</code> — parse a URL (throws on invalid)</li>
    <li><code>url.searchParams.get('key')</code> — read a param</li>
    <li><code>url.searchParams.set('key', 'val')</code> — set/replace</li>
    <li><code>url.searchParams.append('key', 'val')</code> — add (allows duplicates)</li>
    <li><code>url.searchParams.delete('key')</code> — remove</li>
    <li><code>url.searchParams.has('key')</code> — check existence</li>
    <li><code>url.toString()</code> — serialise back to string</li>
  </ul>
</div>

<style>
  h1 { color: #333; }
  .lead { color: #555; max-width: 720px; }
  section {
    margin: 1.5rem 0;
    padding: 1rem;
    background: #fafafa;
    border-radius: 10px;
  }
  section h2 { margin-top: 0; }

  .url-input {
    width: 100%;
    padding: 0.75rem;
    font-family: monospace;
    font-size: 0.85rem;
    border: 2px solid #ddd;
    border-radius: 6px;
    box-sizing: border-box;
  }

  .parts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 0.5rem;
    margin: 0.75rem 0;
  }
  .part { display: flex; align-items: center; gap: 0.75rem; }
  .label {
    font-weight: bold;
    min-width: 90px;
    font-size: 0.75rem;
    color: #666;
    text-transform: uppercase;
  }
  .value {
    font-family: monospace;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background: #f0f0f0;
    font-size: 0.85rem;
    word-break: break-all;
  }
  .protocol { color: #7c3aed; }
  .host { color: #0891b2; }
  .path { color: #059669; }
  .search { color: #d97706; }
  .hash { color: #dc2626; }

  table { border-collapse: collapse; width: 100%; margin-top: 0.5rem; }
  th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; font-size: 0.85rem; }
  th { background: #f5f5f5; }

  .builder {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.75rem;
  }
  .builder label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; }
  .builder input, .builder select {
    padding: 0.4rem;
    font-family: monospace;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .param-list { display: flex; flex-direction: column; gap: 0.4rem; margin: 0.5rem 0; }
  .param-row { display: flex; align-items: center; gap: 0.4rem; }
  .param-row input {
    flex: 1;
    padding: 0.35rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.85rem;
  }
  .remove {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.2rem 0.5rem;
    cursor: pointer;
  }
  .add-row { display: flex; gap: 0.4rem; margin-top: 0.4rem; }
  .add-row input {
    flex: 1;
    padding: 0.35rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.85rem;
  }
  .add-row button {
    padding: 0.35rem 0.75rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .result {
    margin-top: 0.75rem;
    background: white;
    border: 1px dashed #4f46e5;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
  }
  .big {
    display: block;
    margin-top: 0.3rem;
    padding: 0.4rem;
    background: #f8f9fa;
    font-family: monospace;
    font-size: 0.85rem;
    word-break: break-all;
  }

  .full-label { display: flex; flex-direction: column; gap: 0.25rem; margin: 0.5rem 0; font-size: 0.85rem; }
  .full-label input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-family: monospace;
  }

  .enc-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin: 0.5rem 0;
  }
  .enc-grid div {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 0.5rem;
  }
  .m-label {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 0.25rem;
  }
  .small { font-family: monospace; font-size: 0.8rem; word-break: break-all; display: block; }

  .comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .panel { padding: 0.75rem; border-radius: 8px; border: 2px solid; }
  .bad { background: #fef2f2; border-color: #ef4444; }
  .good { background: #f0fdf4; border-color: #22c55e; }
  .panel h4 { margin: 0 0 0.5rem; }
  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    font-size: 0.8rem;
    margin: 0 0 0.5rem;
    overflow-x: auto;
    white-space: pre;
  }
  .small-url {
    font-family: monospace;
    font-size: 0.75rem;
    word-break: break-all;
    background: white;
    padding: 0.4rem;
    border-radius: 4px;
    margin: 0.25rem 0;
  }
  .warn { font-size: 0.8rem; color: #b91c1c; margin: 0.3rem 0 0; }
  .ok { font-size: 0.8rem; color: #15803d; margin: 0.3rem 0 0; }

  code { background: #f0f0f0; padding: 0.15rem 0.4rem; border-radius: 3px; font-size: 0.85em; }
  .note { font-size: 0.85rem; color: #666; font-style: italic; }
  .error { color: #dc2626; }

  .cheatsheet {
    background: #eef2ff;
    border-left: 4px solid #4f46e5;
    padding: 0.75rem 1rem;
    border-radius: 0 8px 8px 0;
    margin: 1rem 0;
  }
  .cheatsheet h3 { margin: 0 0 0.5rem; }
  .cheatsheet ul { margin: 0; padding-left: 1.2rem; }
  .cheatsheet li { margin: 0.2rem 0; font-size: 0.85rem; }

  @media (max-width: 720px) {
    .enc-grid, .comparison { grid-template-columns: 1fr; }
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
