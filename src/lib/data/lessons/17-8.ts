import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-8',
		title: 'Security: XSS, CSRF & CSP',
		phase: 5,
		module: 17,
		lessonIndex: 8
	},
	description: `Svelte and SvelteKit give you secure defaults — template interpolation escapes HTML, form actions require a same-origin token, and CSP is configurable out of the box. But real apps still have to handle hostile input, authenticate requests, and lock down third-party scripts. This lesson covers the three biggest web-security concerns and their SvelteKit-specific mitigations.

XSS (Cross-Site Scripting): by default Svelte escapes everything you interpolate with {expression}. The escape hatch {@html raw} injects raw HTML — ONLY use it on content you've sanitized (ideally with DOMPurify). Markdown, rich-text editors, and user-generated HTML are the classic footguns.

CSRF (Cross-Site Request Forgery): SvelteKit's default form action handler checks that the request's origin matches the host — a same-origin policy enforced for every non-GET form submission. You can configure allowed origins in svelte.config.js.

CSP (Content Security Policy): an HTTP header that tells the browser which scripts, styles, images, and connections are allowed. SvelteKit's kit.csp config generates the header for you, including nonces for inline scripts so your strict CSP doesn't break hydration.`,
	objectives: [
		"Understand Svelte's automatic escaping and when {@html} is safe",
		'Sanitize user HTML with DOMPurify before rendering',
		'Know how SvelteKit protects form actions against CSRF',
		'Configure Content-Security-Policy via kit.csp in svelte.config.js',
		'Use nonces for inline scripts under a strict CSP'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // 1) XSS demo — escaped vs {@html} vs sanitized
  // ============================================================
  // Tiny sanitizer for demo purposes. In production use DOMPurify:
  //   import DOMPurify from 'isomorphic-dompurify';
  //   const clean = DOMPurify.sanitize(dirty, {
  //     ALLOWED_TAGS: ['b','i','em','strong','a','p','br'],
  //     ALLOWED_ATTR: ['href']
  //   });
  function sanitize(html: string): string {
    // Strip script tags and any on* event handlers
    return html
      .replace(/<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi, '')
      .replace(/\\son\\w+\\s*=\\s*"[^"]*"/gi, '')
      .replace(/\\son\\w+\\s*=\\s*'[^']*'/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/<iframe\\b[^>]*>/gi, '')
      .replace(/<object\\b[^>]*>/gi, '');
  }

  const attackSamples = [
    '<b>Hello</b> <i>world</i>',
    '<img src=x onerror="alert(1)">',
    '<a href="javascript:alert(1)">click</a>',
    '<script>alert("xss")</script><p>after</p>',
    '<iframe src="https://evil.example"></iframe>'
  ];

  let userInput: string = $state(attackSamples[1]);
  let sanitized = $derived(sanitize(userInput));

  // ============================================================
  // 2) CSRF simulator
  // ============================================================
  type RequestAttempt = {
    id: number;
    origin: string;
    method: string;
    result: 'accepted' | 'blocked-csrf' | 'accepted-get';
  };
  let attempts: RequestAttempt[] = $state([]);
  let attemptId: number = $state(0);

  const myOrigin = 'https://app.example.com';

  function simulateRequest(origin: string, method: string): void {
    let result: RequestAttempt['result'];
    if (method === 'GET') {
      result = 'accepted-get'; // GET is never CSRF-protected
    } else if (origin === myOrigin) {
      result = 'accepted';
    } else {
      result = 'blocked-csrf';
    }
    attempts = [{ id: attemptId++, origin, method, result }, ...attempts].slice(0, 8);
  }

  // ============================================================
  // 3) CSP directive builder
  // ============================================================
  type CspMode = 'strict' | 'moderate' | 'loose';
  let cspMode: CspMode = $state('strict');

  const cspDirectives: Record<CspMode, Record<string, string[]>> = {
    strict: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'nonce-{NONCE}'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:'],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"]
    },
    moderate: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'nonce-{NONCE}'", 'https://cdn.example.com'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'", 'https://api.example.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'frame-ancestors': ["'self'"]
    },
    loose: {
      'default-src': ["'self'", 'https:'],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:'],
      'style-src': ["'self'", "'unsafe-inline'", 'https:'],
      'img-src': ['*', 'data:', 'blob:'],
      'connect-src': ['*']
    }
  };

  let cspHeader = $derived.by(() => {
    return Object.entries(cspDirectives[cspMode])
      .map(([directive, sources]) => \`\${directive} \${sources.join(' ')}\`)
      .join('; ');
  });
</script>

<h1>Security: XSS, CSRF &amp; CSP</h1>

<section>
  <h2>1. XSS — escaped vs {'{@html}'} vs sanitized</h2>
  <div class="row">
    <label>Input (user-provided HTML):</label>
    <textarea bind:value={userInput} rows="3"></textarea>
  </div>
  <div class="attack-samples">
    <span>Load sample:</span>
    {#each attackSamples as s, i (i)}
      <button onclick={() => (userInput = s)}>#{i + 1}</button>
    {/each}
  </div>

  <div class="xss-grid">
    <div class="xss-box safe">
      <div class="xss-label">
        <span class="dot green"></span>
        Default: {'{userInput}'} (escaped)
      </div>
      <div class="xss-result">{userInput}</div>
      <p class="caption">Always safe. HTML is escaped to text.</p>
    </div>

    <div class="xss-box danger">
      <div class="xss-label">
        <span class="dot red"></span>
        {'{@html userInput}'} — DANGER
      </div>
      <div class="xss-result">{@html userInput}</div>
      <p class="caption">Never use on untrusted input. Demo shows rendered result; malicious tags may execute in a real browser.</p>
    </div>

    <div class="xss-box sanitized">
      <div class="xss-label">
        <span class="dot yellow"></span>
        {'{@html sanitize(userInput)}'} — SAFE
      </div>
      <div class="xss-result">{@html sanitized}</div>
      <p class="caption">OK when sanitized (use DOMPurify in production).</p>
    </div>
  </div>
</section>

<section>
  <h2>2. CSRF — origin check on non-GET form actions</h2>
  <p class="note">
    SvelteKit's default CSRF guard rejects POST/PUT/DELETE/PATCH/... form submissions
    whose <code>Origin</code> header does not match the app host.
    Our origin is <strong>{myOrigin}</strong>.
  </p>

  <div class="csrf-buttons">
    <button onclick={() => simulateRequest(myOrigin, 'POST')}>
      POST from same origin
    </button>
    <button onclick={() => simulateRequest('https://evil.example.com', 'POST')}>
      POST from evil.example.com
    </button>
    <button onclick={() => simulateRequest('https://evil.example.com', 'GET')}>
      GET from evil.example.com
    </button>
    <button onclick={() => simulateRequest(myOrigin, 'DELETE')}>
      DELETE from same origin
    </button>
  </div>

  {#if attempts.length > 0}
    <div class="attempts">
      {#each attempts as a (a.id)}
        <div
          class="attempt"
          class:accepted={a.result === 'accepted' || a.result === 'accepted-get'}
          class:blocked={a.result === 'blocked-csrf'}
        >
          <span class="method">{a.method}</span>
          <code>{a.origin}</code>
          <span class="result">
            {#if a.result === 'accepted'}accepted (same origin)
            {:else if a.result === 'accepted-get'}accepted (GET exempt)
            {:else}BLOCKED (CSRF){/if}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</section>

<section>
  <h2>3. CSP builder</h2>
  <div class="csp-modes">
    {#each ['strict', 'moderate', 'loose'] as m (m)}
      <button
        class:active={cspMode === m}
        onclick={() => (cspMode = m as CspMode)}
      >
        {m}
      </button>
    {/each}
  </div>

  <div class="directives">
    {#each Object.entries(cspDirectives[cspMode]) as [directive, sources] (directive)}
      <div class="directive">
        <strong>{directive}</strong>
        <div class="sources">
          {#each sources as src (src)}
            <code class:nonce={src.includes('nonce')}>{src}</code>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="header">
    <div class="header-label">Content-Security-Policy header:</div>
    <pre><code>{cspHeader}</code></pre>
  </div>
</section>

<section>
  <h2>svelte.config.js — CSP + CSRF options</h2>
  <pre class="code"><code>{\`// svelte.config.js
export default {
  kit: {
    csp: {
      mode: 'auto',  // 'auto' | 'hash' | 'nonce'
      directives: {
        'default-src': ['self'],
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline'],
        'img-src': ['self', 'data:'],
        'connect-src': ['self'],
        'frame-ancestors': ['none'],
        'base-uri': ['self'],
        'form-action': ['self']
      },
      // Report-only mode — browsers send violations to a URL
      // but do NOT block anything. Perfect for rollouts.
      reportOnly: {
        'script-src': ['self'],
        'report-uri': ['/api/csp-report']
      }
    },

    csrf: {
      // Default: true — blocks cross-site form submissions
      // to any non-GET action. Disable only if your app
      // intentionally accepts cross-origin form POSTs.
      checkOrigin: true
    }
  }
};

// src/routes/+page.svelte — inline script under strict CSP
// SvelteKit injects the nonce for you; don't do this manually.
<svelte:head>
  <script nonce="%sveltekit.nonce%">
    // Your code here — only runs because the nonce matches.
  </script>
</svelte:head>

// hooks.server.ts — also set HSTS and related headers
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
};
\`}</code></pre>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #d63031; font-size: 1.05rem; }
  .note { font-size: 0.85rem; color: #636e72; margin: 0 0 0.75rem; }
  .note code { background: #dfe6e9; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }
  .row { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.5rem; }
  .row label { font-size: 0.8rem; font-weight: 600; color: #2d3436; }
  .row textarea {
    width: 100%; padding: 0.5rem; border: 1px solid #ddd;
    border-radius: 4px; font-family: monospace; font-size: 0.85rem;
    box-sizing: border-box;
  }
  .attack-samples {
    display: flex; gap: 0.25rem; align-items: center; margin-bottom: 0.75rem;
  }
  .attack-samples span { font-size: 0.8rem; color: #636e72; }
  .attack-samples button {
    padding: 0.2rem 0.5rem; border: none; border-radius: 3px;
    background: #dfe6e9; cursor: pointer; font-size: 0.75rem;
    font-weight: 600;
  }
  .xss-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 0.75rem;
  }
  .xss-box {
    background: white; padding: 0.75rem; border-radius: 6px;
    border-left: 4px solid;
  }
  .xss-box.safe { border-left-color: #00b894; }
  .xss-box.danger { border-left-color: #d63031; }
  .xss-box.sanitized { border-left-color: #fdcb6e; }
  .xss-label {
    display: flex; align-items: center; gap: 0.4rem;
    font-weight: 700; font-size: 0.75rem; color: #2d3436;
    font-family: monospace; margin-bottom: 0.5rem;
  }
  .dot {
    width: 10px; height: 10px; border-radius: 50%;
  }
  .dot.green { background: #00b894; }
  .dot.red { background: #d63031; }
  .dot.yellow { background: #fdcb6e; }
  .xss-result {
    padding: 0.5rem; background: #f8f9fa; border-radius: 4px;
    min-height: 2rem; word-break: break-word; font-size: 0.85rem;
  }
  .caption { margin: 0.4rem 0 0; font-size: 0.7rem; color: #636e72; }
  .csrf-buttons { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 0.75rem; }
  .csrf-buttons button {
    padding: 0.4rem 0.75rem; border: none; border-radius: 4px;
    background: #0984e3; color: white; cursor: pointer;
    font-weight: 600; font-size: 0.8rem;
  }
  .attempts { background: white; border-radius: 6px; overflow: hidden; }
  .attempt {
    display: grid; grid-template-columns: 80px 1fr auto;
    gap: 0.75rem; align-items: center; padding: 0.5rem 0.75rem;
    border-left: 4px solid; font-size: 0.85rem;
  }
  .attempt.accepted { border-color: #00b894; background: #f0fff4; }
  .attempt.blocked { border-color: #d63031; background: #fff5f5; }
  .attempt .method {
    font-family: monospace; font-weight: 700;
    padding: 0.1rem 0.4rem; background: #2d3436;
    color: white; border-radius: 3px; font-size: 0.7rem; text-align: center;
  }
  .attempt code { font-family: monospace; font-size: 0.8rem; color: #2d3436; }
  .attempt .result { font-weight: 600; font-size: 0.75rem; }
  .attempt.blocked .result { color: #d63031; }
  .attempt.accepted .result { color: #00b894; }
  .csp-modes { display: flex; gap: 0.25rem; margin-bottom: 0.75rem; }
  .csp-modes button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #dfe6e9; cursor: pointer; font-weight: 600;
    font-size: 0.85rem; text-transform: capitalize;
  }
  .csp-modes button.active { background: #d63031; color: white; }
  .directives { background: white; border-radius: 6px; padding: 0.75rem; margin-bottom: 0.75rem; }
  .directive {
    padding: 0.4rem 0; border-bottom: 1px solid #f1f2f6;
    display: grid; grid-template-columns: 150px 1fr; gap: 0.5rem;
    align-items: start;
  }
  .directive:last-child { border-bottom: none; }
  .directive strong {
    font-family: monospace; color: #6c5ce7; font-size: 0.8rem;
  }
  .sources { display: flex; flex-wrap: wrap; gap: 0.3rem; }
  .sources code {
    padding: 0.1rem 0.4rem; background: #dfe6e9; border-radius: 3px;
    font-size: 0.75rem; font-family: monospace;
  }
  .sources code.nonce { background: #fdcb6e; }
  .header-label { font-size: 0.75rem; color: #636e72; margin-bottom: 0.25rem; text-transform: uppercase; }
  .header pre {
    margin: 0; padding: 0.75rem; background: #2d3436;
    border-radius: 4px; overflow-x: auto;
  }
  .header code { color: #55efc4; font-size: 0.75rem; font-family: monospace; word-break: break-all; }
  .code {
    padding: 1rem; background: #2d3436; border-radius: 6px;
    overflow-x: auto; margin: 0;
  }
  .code code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; font-family: monospace; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
