import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '5-3',
		title: 'URLs, Query Strings & URL API',
		phase: 2,
		module: 5,
		lessonIndex: 3
	},
	description: `URLs are the addresses of the web. Every link you click, every API you call, every page you visit — it all starts with a URL. Understanding their anatomy is essential for building web apps.

A URL has parts: protocol, host, pathname, search params, and hash. JavaScript gives you the URL and URLSearchParams APIs to parse, build, and manipulate URLs without messy string concatenation.

In this lesson you'll dissect URLs, build query strings programmatically, and learn when to use encodeURIComponent to handle special characters safely.`,
	objectives: [
		'Break down a URL into its component parts (protocol, host, path, search, hash)',
		'Use the URL API and URLSearchParams to parse and build query strings',
		'Understand when and why to use encodeURIComponent'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let rawUrl = $state('https://example.com/search?q=svelte+5&category=framework&page=1#results');

  let parsedUrl = $derived.by(() => {
    try {
      return new URL(rawUrl);
    } catch {
      return null;
    }
  });

  let params = $derived.by(() => {
    if (!parsedUrl) return [];
    const entries = [];
    parsedUrl.searchParams.forEach((value, key) => {
      entries.push({ key, value });
    });
    return entries;
  });

  // Build a URL from parts
  let buildHost = $state('api.example.com');
  let buildPath = $state('/users');
  let paramKey = $state('name');
  let paramValue = $state('John Doe');

  let builtUrl = $derived.by(() => {
    const url = new URL(\`https://\${buildHost}\${buildPath}\`);
    if (paramKey && paramValue) {
      url.searchParams.set(paramKey, paramValue);
    }
    return url.toString();
  });

  let encodedExample = $derived(
    encodeURIComponent(paramValue)
  );
</script>

<h1>URLs, Query Strings & URL API</h1>

<section>
  <h2>Parse a URL</h2>
  <input
    type="text"
    bind:value={rawUrl}
    placeholder="Enter a URL to parse"
    class="url-input"
  />

  {#if parsedUrl}
    <div class="parts">
      <div class="part">
        <span class="label">Protocol</span>
        <span class="value protocol">{parsedUrl.protocol}</span>
      </div>
      <div class="part">
        <span class="label">Host</span>
        <span class="value host">{parsedUrl.host}</span>
      </div>
      <div class="part">
        <span class="label">Pathname</span>
        <span class="value path">{parsedUrl.pathname}</span>
      </div>
      <div class="part">
        <span class="label">Search</span>
        <span class="value search">{parsedUrl.search || '(none)'}</span>
      </div>
      <div class="part">
        <span class="label">Hash</span>
        <span class="value hash">{parsedUrl.hash || '(none)'}</span>
      </div>
    </div>

    {#if params.length > 0}
      <h3>Query Parameters</h3>
      <table>
        <thead><tr><th>Key</th><th>Value</th></tr></thead>
        <tbody>
          {#each params as p}
            <tr><td>{p.key}</td><td>{p.value}</td></tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {:else}
    <p class="error">Invalid URL — try entering a complete URL with https://</p>
  {/if}
</section>

<section>
  <h2>Build a URL</h2>
  <div class="builder">
    <label>Host: <input bind:value={buildHost} /></label>
    <label>Path: <input bind:value={buildPath} /></label>
    <label>Param key: <input bind:value={paramKey} /></label>
    <label>Param value: <input bind:value={paramValue} /></label>
  </div>
  <p class="result">Result: <code>{builtUrl}</code></p>
  <p class="encoded">encodeURIComponent("{paramValue}") = <code>{encodedExample}</code></p>
</section>

<style>
  h1 { color: #333; }
  .url-input {
    width: 100%;
    padding: 0.75rem;
    font-family: monospace;
    font-size: 0.9rem;
    border: 2px solid #ddd;
    border-radius: 6px;
    box-sizing: border-box;
  }
  .parts { display: flex; flex-direction: column; gap: 0.5rem; margin: 1rem 0; }
  .part { display: flex; align-items: center; gap: 0.75rem; }
  .label {
    font-weight: bold;
    min-width: 80px;
    font-size: 0.85rem;
    color: #666;
  }
  .value {
    font-family: monospace;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background: #f0f0f0;
  }
  .protocol { color: #7c3aed; }
  .host { color: #0891b2; }
  .path { color: #059669; }
  .search { color: #d97706; }
  .hash { color: #dc2626; }
  table { border-collapse: collapse; width: 100%; margin-top: 0.5rem; }
  th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
  th { background: #f5f5f5; }
  section { margin: 1.5rem 0; }
  .builder { display: flex; flex-direction: column; gap: 0.5rem; }
  .builder input { padding: 0.4rem; font-family: monospace; }
  code { background: #f0f0f0; padding: 0.15rem 0.4rem; border-radius: 3px; word-break: break-all; }
  .error { color: #dc2626; }
  .result, .encoded { margin-top: 0.75rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
