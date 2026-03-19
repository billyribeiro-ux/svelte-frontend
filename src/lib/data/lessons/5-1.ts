import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '5-1',
		title: 'Client, Server & HTTP',
		phase: 2,
		module: 5,
		lessonIndex: 1
	},
	description: `Every web app is a conversation between two computers: the client (your browser) and the server (a machine somewhere on the internet). They speak a language called HTTP — HyperText Transfer Protocol.

When you type a URL and press Enter, your browser sends an HTTP request to a server. The server processes it and sends back an HTTP response with a status code (200 = OK, 404 = not found, 500 = server broke).

Understanding this flow is the foundation for everything we'll build with SvelteKit. In this lesson, you'll visualise the request/response cycle and explore the most common HTTP methods and status codes.`,
	objectives: [
		'Understand the client-server model and how browsers talk to servers',
		'Identify common HTTP methods: GET, POST, PUT, DELETE',
		'Read and interpret HTTP status codes (2xx, 3xx, 4xx, 5xx)',
		'Visualise the request/response lifecycle'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let selectedMethod = $state('GET');
  let statusCode = $state(200);

  const methods = [
    { name: 'GET', description: 'Retrieve data from the server', color: '#61affe' },
    { name: 'POST', description: 'Send new data to the server', color: '#49cc90' },
    { name: 'PUT', description: 'Update existing data on the server', color: '#fca130' },
    { name: 'DELETE', description: 'Remove data from the server', color: '#f93e3e' }
  ];

  const statusCodes = [
    { code: 200, text: 'OK', category: 'Success' },
    { code: 201, text: 'Created', category: 'Success' },
    { code: 301, text: 'Moved Permanently', category: 'Redirect' },
    { code: 304, text: 'Not Modified', category: 'Redirect' },
    { code: 404, text: 'Not Found', category: 'Client Error' },
    { code: 403, text: 'Forbidden', category: 'Client Error' },
    { code: 500, text: 'Internal Server Error', category: 'Server Error' }
  ];

  let currentMethod = $derived(methods.find(m => m.name === selectedMethod));
  let currentStatus = $derived(statusCodes.find(s => s.code === statusCode));

  let statusCategory = $derived(
    statusCode < 300 ? 'success' :
    statusCode < 400 ? 'redirect' :
    statusCode < 500 ? 'client-error' : 'server-error'
  );
</script>

<h1>Client, Server & HTTP</h1>

<div class="diagram">
  <div class="box client">
    <h3>Client (Browser)</h3>
    <p>Sends requests</p>
  </div>

  <div class="arrow-section">
    <div class="arrow request">
      <span>Request: {selectedMethod}</span>
      <div class="arrow-line">&#8594;</div>
    </div>
    <div class="arrow response">
      <div class="arrow-line">&#8592;</div>
      <span class={statusCategory}>Response: {statusCode}</span>
    </div>
  </div>

  <div class="box server">
    <h3>Server</h3>
    <p>Sends responses</p>
  </div>
</div>

<section>
  <h2>HTTP Methods</h2>
  <div class="methods">
    {#each methods as method}
      <button
        class:active={selectedMethod === method.name}
        style="--method-color: {method.color}"
        onclick={() => selectedMethod = method.name}
      >
        {method.name}
      </button>
    {/each}
  </div>
  {#if currentMethod}
    <p class="info">{currentMethod.description}</p>
  {/if}
</section>

<section>
  <h2>Status Codes</h2>
  <select bind:value={statusCode}>
    {#each statusCodes as s}
      <option value={s.code}>{s.code} {s.text}</option>
    {/each}
  </select>
  {#if currentStatus}
    <p class="info {statusCategory}">{currentStatus.category}: {currentStatus.text}</p>
  {/if}
</section>

<style>
  h1 { text-align: center; color: #333; }
  .diagram {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin: 2rem 0;
  }
  .box {
    border: 2px solid #ccc;
    border-radius: 8px;
    padding: 1rem 1.5rem;
    text-align: center;
    min-width: 120px;
  }
  .client { border-color: #61affe; background: #e8f4fd; }
  .server { border-color: #49cc90; background: #e8f8f0; }
  .box h3 { margin: 0 0 0.5rem; }
  .box p { margin: 0; font-size: 0.85rem; color: #666; }
  .arrow-section { display: flex; flex-direction: column; gap: 0.5rem; }
  .arrow { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
  .arrow-line { font-size: 1.5rem; color: #999; }
  .methods { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .methods button {
    padding: 0.5rem 1rem;
    border: 2px solid var(--method-color);
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    color: var(--method-color);
  }
  .methods button.active {
    background: var(--method-color);
    color: white;
  }
  section { margin: 1.5rem 0; }
  select { padding: 0.5rem; font-size: 1rem; }
  .info { margin-top: 0.5rem; padding: 0.5rem; border-radius: 4px; background: #f5f5f5; }
  .success { color: #2e7d32; background: #e8f5e9; }
  .redirect { color: #f57f17; background: #fff8e1; }
  .client-error { color: #c62828; background: #ffebee; }
  .server-error { color: #b71c1c; background: #fce4ec; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
