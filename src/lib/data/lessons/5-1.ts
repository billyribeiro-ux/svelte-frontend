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

When you type a URL and press Enter, your browser sends an HTTP request to a server. That request has a **method** (GET, POST, PUT, DELETE...), a **URL**, a set of **headers**, and sometimes a **body**. The server processes it and sends back a response with a **status code** (200 = OK, 404 = not found, 500 = server broke), response headers, and usually a body (HTML, JSON, an image...).

Understanding this flow is the foundation for everything we'll build with SvelteKit. In this lesson, you'll visualise the request/response cycle, explore common HTTP methods and status codes, and peek inside a real request/response pair.`,
	objectives: [
		'Understand the client-server model and how browsers talk to servers',
		'Identify common HTTP methods: GET, POST, PUT, PATCH, DELETE',
		'Read and interpret HTTP status codes (1xx, 2xx, 3xx, 4xx, 5xx)',
		'Recognise common request and response headers',
		'Visualise the full request/response lifecycle'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === State ===
  let selectedMethod = $state('GET');
  let statusCode = $state(200);
  let requestUrl = $state('/api/users/42');
  let requestBody = $state('{"name": "Ada Lovelace"}');
  let sending = $state(false);
  let sent = $state(false);

  // HTTP methods we care about in everyday web apps.
  // "safe" means the method should not modify server state.
  // "idempotent" means calling it N times has the same effect as calling it once.
  const methods = [
    { name: 'GET',    description: 'Retrieve data. Safe & idempotent. No body.',    color: '#61affe', hasBody: false, safe: true,  idempotent: true },
    { name: 'POST',   description: 'Create a new resource. Not idempotent.',        color: '#49cc90', hasBody: true,  safe: false, idempotent: false },
    { name: 'PUT',    description: 'Replace a resource entirely. Idempotent.',      color: '#fca130', hasBody: true,  safe: false, idempotent: true },
    { name: 'PATCH',  description: 'Partially update a resource.',                  color: '#50e3c2', hasBody: true,  safe: false, idempotent: false },
    { name: 'DELETE', description: 'Remove a resource. Idempotent.',                color: '#f93e3e', hasBody: false, safe: false, idempotent: true }
  ];

  // Representative status codes grouped by class.
  const statusCodes = [
    { code: 100, text: 'Continue',              category: 'Informational' },
    { code: 200, text: 'OK',                    category: 'Success' },
    { code: 201, text: 'Created',               category: 'Success' },
    { code: 204, text: 'No Content',            category: 'Success' },
    { code: 301, text: 'Moved Permanently',     category: 'Redirect' },
    { code: 302, text: 'Found',                 category: 'Redirect' },
    { code: 304, text: 'Not Modified',          category: 'Redirect' },
    { code: 400, text: 'Bad Request',           category: 'Client Error' },
    { code: 401, text: 'Unauthorized',          category: 'Client Error' },
    { code: 403, text: 'Forbidden',             category: 'Client Error' },
    { code: 404, text: 'Not Found',             category: 'Client Error' },
    { code: 409, text: 'Conflict',              category: 'Client Error' },
    { code: 418, text: "I'm a teapot",          category: 'Client Error' },
    { code: 429, text: 'Too Many Requests',     category: 'Client Error' },
    { code: 500, text: 'Internal Server Error', category: 'Server Error' },
    { code: 502, text: 'Bad Gateway',           category: 'Server Error' },
    { code: 503, text: 'Service Unavailable',   category: 'Server Error' }
  ];

  // $derived reacts automatically — no manual sync needed.
  let currentMethod = $derived(methods.find((m) => m.name === selectedMethod));
  let currentStatus = $derived(statusCodes.find((s) => s.code === statusCode));

  let statusCategory = $derived(
    statusCode < 200 ? 'info' :
    statusCode < 300 ? 'success' :
    statusCode < 400 ? 'redirect' :
    statusCode < 500 ? 'client-error' : 'server-error'
  );

  // The "explain the number" description.
  let statusExplanation = $derived(
    statusCode < 200 ? 'Informational — the request was received, keep going.' :
    statusCode < 300 ? 'Success — the request was understood and accepted.' :
    statusCode < 400 ? 'Redirection — you need to do something extra to complete the request.' :
    statusCode < 500 ? "Client Error — the request is malformed or unauthorised. It's your fault." :
    'Server Error — the server failed to fulfil a valid request. Not your fault.'
  );

  // Build a visual of the raw HTTP request.
  let rawRequest = $derived.by(() => {
    const lines = [
      \`\${selectedMethod} \${requestUrl} HTTP/1.1\`,
      'Host: api.example.com',
      'User-Agent: SvelteMastery/1.0',
      'Accept: application/json'
    ];
    if (currentMethod?.hasBody) {
      lines.push('Content-Type: application/json');
      lines.push(\`Content-Length: \${requestBody.length}\`);
      lines.push('');
      lines.push(requestBody);
    }
    return lines.join('\\n');
  });

  // Build a visual of the raw HTTP response.
  let rawResponse = $derived.by(() => {
    const lines = [
      \`HTTP/1.1 \${statusCode} \${currentStatus?.text ?? ''}\`,
      'Content-Type: application/json',
      'Date: ' + new Date().toUTCString(),
      'Cache-Control: no-cache',
      ''
    ];
    if (statusCode >= 200 && statusCode < 300) {
      lines.push('{ "id": 42, "name": "Ada Lovelace" }');
    } else if (statusCode >= 400) {
      lines.push(\`{ "error": "\${currentStatus?.text}" }\`);
    }
    return lines.join('\\n');
  });

  async function simulateRequest() {
    sending = true;
    sent = false;
    // Fake network latency so the arrow animation has time to breathe.
    await new Promise((resolve) => setTimeout(resolve, 700));
    sending = false;
    sent = true;
  }
</script>

<h1>Client, Server &amp; HTTP</h1>

<p class="intro">
  Every web page is the result of a <strong>request</strong> and a <strong>response</strong>.
  Your browser (the <strong>client</strong>) asks for something; a <strong>server</strong> answers.
  The language they use is HTTP.
</p>

<div class="diagram">
  <div class="box client">
    <h3>Client</h3>
    <p class="subtle">(your browser)</p>
  </div>

  <div class="arrow-section">
    <div class="arrow request" class:animating={sending}>
      <span class="tag method-{selectedMethod.toLowerCase()}">{selectedMethod} {requestUrl}</span>
      <div class="arrow-line">&#8594;</div>
    </div>
    <div class="arrow response" class:animating={sending}>
      <div class="arrow-line">&#8592;</div>
      <span class="tag status-{statusCategory}">{statusCode} {currentStatus?.text}</span>
    </div>
  </div>

  <div class="box server">
    <h3>Server</h3>
    <p class="subtle">(somewhere on the internet)</p>
  </div>
</div>

<div class="send-row">
  <button class="send" onclick={simulateRequest} disabled={sending}>
    {sending ? 'Sending...' : 'Simulate Request'}
  </button>
  {#if sent && !sending}
    <span class="sent-note">Round-trip complete.</span>
  {/if}
</div>

<section>
  <h2>1. Pick an HTTP Method</h2>
  <div class="methods">
    {#each methods as method (method.name)}
      <button
        type="button"
        class="method-btn"
        class:active={selectedMethod === method.name}
        style="--method-color: {method.color}"
        onclick={() => (selectedMethod = method.name)}
      >
        {method.name}
      </button>
    {/each}
  </div>

  {#if currentMethod}
    <div class="method-info">
      <p class="info">{currentMethod.description}</p>
      <ul class="traits">
        <li class:yes={currentMethod.safe} class:no={!currentMethod.safe}>
          Safe: {currentMethod.safe ? 'yes' : 'no'}
        </li>
        <li class:yes={currentMethod.idempotent} class:no={!currentMethod.idempotent}>
          Idempotent: {currentMethod.idempotent ? 'yes' : 'no'}
        </li>
        <li class:yes={currentMethod.hasBody} class:no={!currentMethod.hasBody}>
          Sends body: {currentMethod.hasBody ? 'yes' : 'no'}
        </li>
      </ul>
    </div>
  {/if}
</section>

<section>
  <h2>2. Choose a Status Code</h2>
  <select bind:value={statusCode}>
    {#each statusCodes as s (s.code)}
      <option value={s.code}>{s.code} {s.text}</option>
    {/each}
  </select>

  {#if currentStatus}
    <p class="info status {statusCategory}">
      <strong>{currentStatus.category}:</strong> {currentStatus.text}
    </p>
    <p class="explain">{statusExplanation}</p>
  {/if}

  <div class="status-ranges">
    <div class="range info-range"><strong>1xx</strong> Informational</div>
    <div class="range success-range"><strong>2xx</strong> Success</div>
    <div class="range redirect-range"><strong>3xx</strong> Redirect</div>
    <div class="range client-range"><strong>4xx</strong> Client Error</div>
    <div class="range server-range"><strong>5xx</strong> Server Error</div>
  </div>
</section>

<section>
  <h2>3. Request Inspector</h2>
  <label class="url-field">
    URL path:
    <input type="text" bind:value={requestUrl} />
  </label>

  {#if currentMethod?.hasBody}
    <label class="body-field">
      Request body (JSON):
      <textarea bind:value={requestBody} rows="3"></textarea>
    </label>
  {/if}

  <div class="raw-grid">
    <div class="raw">
      <h4>Raw Request</h4>
      <pre class="req">{rawRequest}</pre>
    </div>
    <div class="raw">
      <h4>Raw Response</h4>
      <pre class="res {statusCategory}">{rawResponse}</pre>
    </div>
  </div>

  <div class="headers-note">
    <strong>Common headers to know:</strong>
    <ul>
      <li><code>Content-Type</code> — what the body is (JSON? HTML? image?)</li>
      <li><code>Accept</code> — what the client wants to receive</li>
      <li><code>Authorization</code> — credentials like <code>Bearer &lt;token&gt;</code></li>
      <li><code>Cache-Control</code> — how long can this be cached?</li>
      <li><code>Set-Cookie</code> — the server asks the browser to store a cookie</li>
    </ul>
  </div>
</section>

<style>
  h1 { color: #333; text-align: center; }
  .intro { color: #555; max-width: 720px; }
  .diagram {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin: 1.5rem 0 0.75rem;
    flex-wrap: wrap;
  }
  .box {
    border: 2px solid #ccc;
    border-radius: 10px;
    padding: 1rem 1.5rem;
    text-align: center;
    min-width: 120px;
  }
  .client { border-color: #61affe; background: #e8f4fd; }
  .server { border-color: #49cc90; background: #e8f8f0; }
  .box h3 { margin: 0 0 0.25rem; }
  .subtle { margin: 0; font-size: 0.8rem; color: #666; }
  .arrow-section { display: flex; flex-direction: column; gap: 0.4rem; min-width: 260px; }
  .arrow { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; }
  .arrow-line { font-size: 1.5rem; color: #999; }
  .arrow.animating .arrow-line { animation: slide 0.7s ease; }
  @keyframes slide { 0% { transform: translateX(-10px); opacity: 0.2; } 100% { transform: translateX(0); opacity: 1; } }
  .tag {
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }
  .method-get    { background: #e8f4fd; color: #1e60a8; }
  .method-post   { background: #e8f8f0; color: #0f7b4a; }
  .method-put    { background: #fff3e0; color: #a85b00; }
  .method-patch  { background: #e0f7f4; color: #007b66; }
  .method-delete { background: #fdecea; color: #a02020; }
  .status-info         { background: #ede9fe; color: #5b21b6; }
  .status-success      { background: #e8f5e9; color: #2e7d32; }
  .status-redirect     { background: #fff8e1; color: #b06b00; }
  .status-client-error { background: #ffebee; color: #c62828; }
  .status-server-error { background: #fce4ec; color: #9c1e3f; }

  .send-row { display: flex; align-items: center; gap: 1rem; justify-content: center; margin-bottom: 1rem; }
  .send {
    padding: 0.5rem 1.5rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
  }
  .send:disabled { opacity: 0.6; cursor: not-allowed; }
  .sent-note { font-size: 0.85rem; color: #16a34a; }

  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 10px; }
  section h2 { margin-top: 0; }

  .methods { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .method-btn {
    padding: 0.5rem 1rem;
    border: 2px solid var(--method-color);
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    color: var(--method-color);
  }
  .method-btn.active { background: var(--method-color); color: white; }

  .method-info { margin-top: 0.75rem; }
  .info {
    margin: 0.5rem 0;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    background: #f0f0f0;
  }
  .info.status.success { background: #e8f5e9; color: #2e7d32; }
  .info.status.redirect { background: #fff8e1; color: #b06b00; }
  .info.status.client-error { background: #ffebee; color: #c62828; }
  .info.status.server-error { background: #fce4ec; color: #9c1e3f; }
  .info.status.info { background: #ede9fe; color: #5b21b6; }

  .traits { list-style: none; padding: 0; display: flex; gap: 0.75rem; margin: 0.5rem 0; flex-wrap: wrap; }
  .traits li { font-size: 0.8rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: #eee; }
  .traits .yes { background: #e8f5e9; color: #2e7d32; }
  .traits .no  { background: #ffebee; color: #c62828; }

  select { padding: 0.5rem; font-size: 1rem; }
  .explain { font-size: 0.85rem; color: #555; margin: 0.25rem 0 0.75rem; }

  .status-ranges { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.5rem; margin-top: 0.75rem; }
  .range { padding: 0.4rem 0.5rem; border-radius: 4px; font-size: 0.8rem; text-align: center; }
  .info-range     { background: #ede9fe; color: #5b21b6; }
  .success-range  { background: #e8f5e9; color: #2e7d32; }
  .redirect-range { background: #fff8e1; color: #b06b00; }
  .client-range   { background: #ffebee; color: #c62828; }
  .server-range   { background: #fce4ec; color: #9c1e3f; }

  .url-field, .body-field { display: flex; flex-direction: column; gap: 0.25rem; margin: 0.5rem 0; font-size: 0.85rem; }
  .url-field input, .body-field textarea {
    padding: 0.4rem;
    font-family: monospace;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .raw-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }
  .raw h4 { margin: 0 0 0.3rem; font-size: 0.85rem; color: #555; }
  pre.req, pre.res {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    overflow-x: auto;
    margin: 0;
    white-space: pre;
    border-left: 4px solid #666;
  }
  pre.req { border-left-color: #61affe; }
  pre.res.success      { border-left-color: #22c55e; }
  pre.res.redirect     { border-left-color: #f59e0b; }
  pre.res.client-error { border-left-color: #ef4444; }
  pre.res.server-error { border-left-color: #991b1b; }

  .headers-note {
    margin-top: 1rem;
    background: #eef2ff;
    border-left: 4px solid #4f46e5;
    padding: 0.75rem 1rem;
    border-radius: 0 6px 6px 0;
  }
  .headers-note ul { margin: 0.4rem 0 0; padding-left: 1.2rem; }
  .headers-note li { margin: 0.2rem 0; font-size: 0.85rem; }
  code { background: #e5e7eb; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }

  @media (max-width: 720px) {
    .raw-grid { grid-template-columns: 1fr; }
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
