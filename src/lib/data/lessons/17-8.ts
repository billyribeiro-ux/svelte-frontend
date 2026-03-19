import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-8',
		title: 'Security: XSS, CSRF & CSP',
		phase: 5,
		module: 17,
		lessonIndex: 8
	},
	description: `Web security is critical for any production application. Cross-Site Scripting (XSS) occurs when malicious scripts are injected into your pages — Svelte prevents this by default by escaping all template expressions, but the {@html} tag bypasses this protection.

Cross-Site Request Forgery (CSRF) tricks authenticated users into making unwanted requests. SvelteKit automatically protects against CSRF by checking the Origin header on form submissions. Content Security Policy (CSP) headers restrict which resources browsers can load, providing defense-in-depth. Understanding these protections helps you build secure applications and avoid common vulnerabilities.`,
	objectives: [
		'Understand how Svelte auto-escapes output to prevent XSS attacks',
		'Recognize the dangers of {@html} and how to sanitize user content',
		'Learn how SvelteKit handles CSRF protection automatically',
		'Configure Content Security Policy headers for defense-in-depth'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let userInput: string = $state('<img src=x onerror="alert(1)"> Hello <b>world</b>');
  let showUnsafe: boolean = $state(false);
  let activeTab: 'xss' | 'csrf' | 'csp' = $state('xss');

  // Simple HTML sanitizer (in production, use DOMPurify)
  function sanitizeHtml(html: string): string {
    const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li'];
    return html.replace(/<\\/?([a-zA-Z]+)[^>]*>/g, (match, tag) => {
      const lowerTag = tag.toLowerCase();
      if (allowedTags.includes(lowerTag)) {
        // Only allow the tag itself, strip attributes
        return match.startsWith('</') ? \`</\${lowerTag}>\` : \`<\${lowerTag}>\`;
      }
      return ''; // Strip disallowed tags
    });
  }

  let sanitized = $derived(sanitizeHtml(userInput));

  const csrfExample = \`// SvelteKit CSRF protection (automatic)
// 1. Form submissions check Origin header
// 2. Rejects requests from different origins

// In svelte.config.js — customize if needed:
const config = &#123;
  kit: &#123;
    csrf: &#123;
      checkOrigin: true,  // default: true
    &#125;
  &#125;
&#125;;\`;

  const cspExample = \`// src/hooks.server.ts
import type &#123; Handle &#125; from '@sveltejs/kit';

export const handle: Handle = async (&#123; event, resolve &#125;) => &#123;
  const response = await resolve(event);

  // Content Security Policy header
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'strict-dynamic'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  // Additional security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin');

  return response;
&#125;;\`;
</script>

<h1>Security: XSS, CSRF & CSP</h1>

<div class="tabs">
  <button class:active={activeTab === 'xss'} onclick={() => activeTab = 'xss'}>XSS</button>
  <button class:active={activeTab === 'csrf'} onclick={() => activeTab = 'csrf'}>CSRF</button>
  <button class:active={activeTab === 'csp'} onclick={() => activeTab = 'csp'}>CSP</button>
</div>

{#if activeTab === 'xss'}
  <section>
    <h2>Cross-Site Scripting (XSS)</h2>

    <div class="input-area">
      <label>User input (try injecting HTML/script):</label>
      <textarea bind:value={userInput} rows="3"></textarea>
    </div>

    <div class="comparison">
      <div class="safe-box">
        <h3>Safe: Template expression &#123;value&#125;</h3>
        <div class="output">{userInput}</div>
        <p class="note">Svelte auto-escapes — HTML tags render as text.</p>
      </div>

      <div class="danger-box">
        <h3>Dangerous: &#123;@html value&#125;</h3>
        <label class="toggle">
          <input type="checkbox" bind:checked={showUnsafe} />
          Show raw HTML output
        </label>
        {#if showUnsafe}
          <div class="output">
            {@html userInput}
          </div>
          <p class="warning">This renders raw HTML — XSS vulnerability!</p>
        {:else}
          <div class="output blocked">Blocked for safety in this demo</div>
        {/if}
      </div>

      <div class="sanitized-box">
        <h3>Safe: Sanitized &#123;@html sanitize(value)&#125;</h3>
        <div class="output">
          {@html sanitized}
        </div>
        <p class="note">Only allows safe tags: b, i, em, strong, p, br, ul, li.</p>
      </div>
    </div>

    <pre class="code"><code>&lt;!-- SAFE: auto-escaped --&gt;
&lt;p&gt;&#123;userInput&#125;&lt;/p&gt;

&lt;!-- DANGEROUS: raw HTML --&gt;
&lt;p&gt;&#123;@html userInput&#125;&lt;/p&gt;

&lt;!-- SAFE: sanitized first --&gt;
&lt;p&gt;&#123;@html DOMPurify.sanitize(userInput)&#125;&lt;/p&gt;</code></pre>
  </section>

{:else if activeTab === 'csrf'}
  <section>
    <h2>Cross-Site Request Forgery (CSRF)</h2>

    <div class="info-card">
      <h3>How CSRF Works</h3>
      <div class="attack-flow">
        <div class="flow-step">
          <span class="step-num">1</span>
          <p>User logs into your-app.com</p>
        </div>
        <div class="flow-step danger">
          <span class="step-num">2</span>
          <p>User visits evil-site.com</p>
        </div>
        <div class="flow-step danger">
          <span class="step-num">3</span>
          <p>Evil site sends POST to your-app.com/delete-account</p>
        </div>
        <div class="flow-step">
          <span class="step-num">4</span>
          <p>Browser includes your-app cookies automatically</p>
        </div>
      </div>
    </div>

    <div class="info-card safe">
      <h3>SvelteKit's Protection</h3>
      <ul>
        <li>Automatically checks the <code>Origin</code> header on non-GET requests</li>
        <li>Rejects requests where Origin doesn't match the app's URL</li>
        <li>Enabled by default — no configuration needed</li>
        <li>Works for both form actions and API endpoints</li>
      </ul>
    </div>

    <pre class="code"><code>{csrfExample}</code></pre>
  </section>

{:else}
  <section>
    <h2>Content Security Policy (CSP)</h2>

    <div class="csp-rules">
      <div class="rule">
        <code>default-src 'self'</code>
        <p>Only load resources from same origin</p>
      </div>
      <div class="rule">
        <code>script-src 'self'</code>
        <p>Only run scripts from same origin</p>
      </div>
      <div class="rule">
        <code>style-src 'self' 'unsafe-inline'</code>
        <p>Allow same-origin styles and inline styles</p>
      </div>
      <div class="rule">
        <code>img-src 'self' data: https:</code>
        <p>Allow images from same origin, data URLs, and HTTPS</p>
      </div>
      <div class="rule">
        <code>frame-ancestors 'none'</code>
        <p>Prevent site from being embedded in iframes</p>
      </div>
    </div>

    <pre class="code"><code>{cspExample}</code></pre>
  </section>
{/if}

<style>
  h1 { color: #2d3436; }
  .tabs { display: flex; gap: 2px; margin-bottom: 0; }
  .tabs button {
    flex: 1; padding: 0.6rem; border: none; background: #dfe6e9;
    cursor: pointer; font-weight: 700; border-radius: 4px 4px 0 0;
    font-size: 1rem;
  }
  .tabs button.active { background: #d63031; color: white; }
  section { padding: 1rem; background: #f8f9fa; border-radius: 0 0 8px 8px; }
  h2 { margin-top: 0; color: #d63031; font-size: 1.1rem; }
  h3 { margin: 0 0 0.5rem; font-size: 0.95rem; }
  .input-area { margin-bottom: 1rem; }
  label { display: block; font-weight: 600; margin-bottom: 0.25rem; }
  textarea {
    width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;
    font-family: monospace; font-size: 0.9rem; box-sizing: border-box;
  }
  .comparison { display: grid; gap: 0.75rem; margin-bottom: 1rem; }
  .safe-box, .danger-box, .sanitized-box {
    padding: 0.75rem; border-radius: 6px;
  }
  .safe-box { background: #e8f8f0; border: 1px solid #00b894; }
  .danger-box { background: #fff5f5; border: 1px solid #ff7675; }
  .sanitized-box { background: #f0f8ff; border: 1px solid #74b9ff; }
  .output {
    padding: 0.5rem; background: white; border-radius: 4px;
    margin: 0.5rem 0; min-height: 30px; word-break: break-all;
  }
  .output.blocked { color: #b2bec3; font-style: italic; }
  .note { font-size: 0.8rem; color: #00b894; margin: 0; }
  .warning { font-size: 0.8rem; color: #d63031; font-weight: 600; margin: 0; }
  .toggle { display: flex; align-items: center; gap: 0.5rem; font-weight: 400; font-size: 0.85rem; }
  .info-card {
    padding: 1rem; background: white; border-radius: 6px;
    border: 1px solid #dfe6e9; margin-bottom: 0.75rem;
  }
  .info-card.safe { border-color: #00b894; }
  .attack-flow { display: flex; flex-direction: column; gap: 0.4rem; }
  .flow-step {
    display: flex; gap: 0.5rem; align-items: center;
    padding: 0.4rem; border-radius: 4px; background: #f8f9fa;
  }
  .flow-step.danger { background: #fff5f5; }
  .step-num {
    width: 24px; height: 24px; border-radius: 50%; background: #636e72;
    color: white; display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem; font-weight: 700; flex-shrink: 0;
  }
  .flow-step.danger .step-num { background: #d63031; }
  .flow-step p { margin: 0; font-size: 0.9rem; }
  ul { padding-left: 1.5rem; }
  li { margin-bottom: 0.3rem; font-size: 0.9rem; }
  .csp-rules { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
  .rule {
    padding: 0.5rem 0.75rem; background: white; border-radius: 4px;
    border-left: 3px solid #d63031;
  }
  .rule code { color: #d63031; font-weight: 600; }
  .rule p { margin: 0.2rem 0 0; font-size: 0.85rem; color: #636e72; }
  button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #d63031; color: white; cursor: pointer; font-weight: 600;
  }
  .code, pre { background: #2d3436; padding: 0.75rem; border-radius: 6px; overflow-x: auto; margin: 0; }
  code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
