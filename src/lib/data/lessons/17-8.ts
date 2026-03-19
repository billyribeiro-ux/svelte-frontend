import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-8',
		title: 'Security: XSS, CSRF & CSP',
		phase: 5,
		module: 17,
		lessonIndex: 8
	},
	description: `Web security in SvelteKit involves defending against cross-site scripting (XSS), cross-site request forgery (CSRF), and content injection attacks. Svelte auto-escapes all template expressions, but the {@html} tag bypasses this protection — you must sanitize any user-generated HTML. SvelteKit automatically checks the Origin header on form submissions to prevent CSRF. Content Security Policy (CSP) headers control which scripts, styles, and resources can load on your pages, preventing injection attacks.

This lesson covers practical security patterns every SvelteKit developer must understand.`,
	objectives: [
		'Understand how Svelte auto-escapes output and when {@html} creates XSS risk',
		'Sanitize user-generated HTML with DOMPurify or similar libraries',
		'Leverage SvelteKit built-in CSRF protection and understand Origin checking',
		'Configure Content Security Policy headers in hooks.server.ts'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Security: XSS, CSRF & CSP — interactive reference

  // XSS Demo
  let userInput = $state('<b>Hello</b> <img src=x onerror="alert(1)">');
  let sanitizedOutput = $derived(sanitize(userInput));

  // Simple sanitizer simulation (in real apps, use DOMPurify)
  function sanitize(html: string): string {
    return html
      .replace(/<script[^>]*>.*?<\\/script>/gi, '')
      .replace(/on\\w+="[^"]*"/gi, '')
      .replace(/on\\w+='[^']*'/gi, '')
      .replace(/<iframe[^>]*>.*?<\\/iframe>/gi, '')
      .replace(/javascript:/gi, '');
  }

  type SecurityTopic = {
    name: string;
    threat: string;
    protection: string;
    code: string;
  };

  const topics: SecurityTopic[] = [
    {
      name: 'XSS Prevention',
      threat: 'Attackers inject malicious scripts into your pages through user input that gets rendered as HTML.',
      protection: 'Svelte auto-escapes all {expression} output. Only {@html} bypasses escaping — always sanitize with DOMPurify before using it.',
      code: \`<!-- SAFE: Svelte auto-escapes expressions -->
<p>{userComment}</p>
<!-- Input: <script>alert('xss')</script> -->
<!-- Output: &lt;script&gt;alert('xss')&lt;/script&gt; -->

<!-- DANGEROUS: {@html} renders raw HTML -->
<div>{@html userComment}</div>
<!-- This WOULD execute the script! -->

<!-- SAFE: Sanitize before rendering -->
<script>
  import DOMPurify from 'dompurify';

  let { content } = $props();
  let clean = $derived(DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  }));
<\\/script>

<div class="user-content">{@html clean}</div>

<!-- Also safe: render markdown with a markdown library -->
<script>
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  let { markdown } = $props();
  let html = $derived(DOMPurify.sanitize(marked(markdown)));
<\\/script>
{@html html}\`
    },
    {
      name: 'CSRF Protection',
      threat: 'An attacker tricks a logged-in user into submitting a form to your server from a different site, performing actions on their behalf.',
      protection: 'SvelteKit automatically checks the Origin header on POST/PUT/PATCH/DELETE requests. If Origin does not match the app, the request is rejected with 403.',
      code: \`// SvelteKit CSRF protection is automatic!
// No configuration needed for form actions.

// How it works:
// 1. Browser sends Origin header with form submissions
// 2. SvelteKit compares Origin to the app's URL
// 3. Mismatch → 403 Forbidden

// For API routes, add your own CSRF token if needed:

// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import crypto from 'crypto';

export const handle: Handle = async ({ event, resolve }) => {
  // Generate CSRF token for forms
  if (event.request.method === 'GET') {
    const token = crypto.randomBytes(32).toString('hex');
    event.cookies.set('csrf', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true
    });
    event.locals.csrfToken = token;
  }

  return resolve(event);
};

// If you need to disable CSRF for a specific route:
// svelte.config.js
export default {
  kit: {
    csrf: {
      checkOrigin: true  // default, keep this on
    }
  }
};

// For webhooks or external API calls, validate differently:
// src/routes/api/webhook/+server.ts
export async function POST({ request }) {
  const signature = request.headers.get('x-webhook-signature');
  if (!verifySignature(signature, await request.text())) {
    return new Response('Invalid signature', { status: 401 });
  }
  // Process webhook...
}\`
    },
    {
      name: 'CSP Headers',
      threat: 'Attackers inject unauthorized scripts, styles, or iframes into your page through compromised third-party resources or injection vulnerabilities.',
      protection: 'Content Security Policy headers tell the browser which sources of content are allowed. SvelteKit can generate CSP headers with nonces for inline scripts.',
      code: \`// svelte.config.js — CSP configuration
import { sveltekit } from '@sveltejs/kit/vite';

export default {
  kit: {
    csp: {
      directives: {
        'default-src': ['self'],
        'script-src': ['self'],    // SvelteKit auto-adds nonce
        'style-src': ['self', 'unsafe-inline'],
        'img-src': ['self', 'data:', 'https:'],
        'font-src': ['self', 'https://fonts.gstatic.com'],
        'connect-src': ['self', 'https://api.example.com'],
        'frame-ancestors': ['none'],  // Prevent clickjacking
        'base-uri': ['self'],
        'form-action': ['self']
      },
      mode: 'auto'  // 'hash' | 'nonce' | 'auto'
    }
  }
};

// Or set CSP manually in hooks for more control:
// src/hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy',
    'camera=(), microphone=(), geolocation=()');

  return response;
};\`
    },
    {
      name: 'Cookie Security',
      threat: 'Session cookies can be stolen via XSS, sent to malicious sites via CSRF, or intercepted over unencrypted connections.',
      protection: 'Always set cookies with httpOnly (no JS access), secure (HTTPS only), sameSite strict or lax, and appropriate path restrictions.',
      code: \`// src/routes/api/auth/login/+server.ts
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, request }) => {
  const { email, password } = await request.json();
  const session = await authenticate(email, password);

  if (session) {
    cookies.set('session', session.token, {
      path: '/',
      httpOnly: true,      // JS cannot read this cookie
      secure: true,         // Only sent over HTTPS
      sameSite: 'lax',      // Sent on top-level navigations
      maxAge: 60 * 60 * 24  // 1 day
    });

    return new Response(JSON.stringify({ success: true }));
  }

  return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
    status: 401
  });
};

// For sensitive actions, use sameSite: 'strict'
cookies.set('admin_session', token, {
  path: '/admin',
  httpOnly: true,
  secure: true,
  sameSite: 'strict',  // Never sent from external sites
  maxAge: 60 * 30      // 30 minutes
});\`
    }
  ];

  let activeTopic = $state(0);
</script>

<main>
  <h1>Security: XSS, CSRF & CSP</h1>
  <p class="subtitle">Defend your SvelteKit app against common web vulnerabilities</p>

  <!-- XSS interactive demo -->
  <section>
    <h2>XSS Demo: Why {@html} is Dangerous</h2>
    <div class="xss-demo">
      <div class="input-area">
        <label for="xss-input">Enter HTML (try injecting a script tag):</label>
        <textarea id="xss-input" bind:value={userInput} rows="3"></textarea>
      </div>
      <div class="output-grid">
        <div class="output-card safe">
          <h4>{'{expression}'} — Auto-Escaped (Safe)</h4>
          <div class="output-content">{userInput}</div>
        </div>
        <div class="output-card danger">
          <h4>{'{@html}'} — Raw (Dangerous)</h4>
          <div class="output-content">{@html sanitizedOutput}</div>
          <p class="note">* Shown with basic sanitization for safety</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Topic reference -->
  <section>
    <h2>Security Reference</h2>
    <div class="topic-tabs">
      {#each topics as topic, i}
        <button
          class={['topic-tab', activeTopic === i && 'active']}
          onclick={() => activeTopic = i}
        >
          {topic.name}
        </button>
      {/each}
    </div>

    <div class="topic-detail">
      <div class="threat-box">
        <strong>Threat:</strong> {topics[activeTopic].threat}
      </div>
      <div class="protection-box">
        <strong>Protection:</strong> {topics[activeTopic].protection}
      </div>
      <h3>Implementation</h3>
      <pre><code>{topics[activeTopic].code}</code></pre>
    </div>
  </section>
</main>

<style>
  main { max-width: 900px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  h1 { text-align: center; color: #333; }
  h2 { color: #555; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
  h3 { color: #555; margin: 1.25rem 0 0.5rem; }
  h4 { margin: 0 0 0.5rem; font-size: 0.9rem; }
  .subtitle { text-align: center; color: #666; }
  section { margin: 2rem 0; }

  .xss-demo { background: #f8f9fa; padding: 1.5rem; border-radius: 12px; }
  .input-area { margin-bottom: 1rem; }
  .input-area label { display: block; font-size: 0.85rem; color: #555; margin-bottom: 0.25rem; }
  .input-area textarea {
    width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 6px;
    font-family: 'Fira Code', monospace; font-size: 0.85rem; resize: vertical;
  }

  .output-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .output-card { padding: 1rem; border-radius: 8px; }
  .output-card.safe { background: #e8f5e9; border: 1px solid #a5d6a7; }
  .output-card.danger { background: #fef2f2; border: 1px solid #fca5a5; }
  .output-content {
    background: white; padding: 0.5rem; border-radius: 4px; font-size: 0.85rem;
    min-height: 40px; word-break: break-all;
  }
  .note { font-size: 0.75rem; color: #888; margin: 0.25rem 0 0; font-style: italic; }

  .topic-tabs { display: flex; gap: 0.5rem; margin: 1.5rem 0; flex-wrap: wrap; }
  .topic-tab {
    flex: 1; min-width: 120px; padding: 0.6rem 0.75rem; border: 2px solid #e0e0e0;
    border-radius: 8px; background: #f8f9fa; cursor: pointer; font-size: 0.85rem; font-weight: 500;
  }
  .topic-tab.active { border-color: #dc2626; background: #fef2f2; color: #dc2626; }

  .topic-detail { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 1.5rem; }
  .threat-box {
    background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px;
    padding: 0.75rem; margin-bottom: 0.75rem; font-size: 0.9rem; color: #991b1b;
  }
  .protection-box {
    background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 8px;
    padding: 0.75rem; margin-bottom: 0.75rem; font-size: 0.9rem; color: #166534;
  }

  pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 8px; font-size: 0.76rem; overflow-x: auto; line-height: 1.5; }
  code { font-family: 'Fira Code', monospace; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
