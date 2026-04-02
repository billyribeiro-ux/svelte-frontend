import type { Lesson } from '$types/lesson';

export const stylingComponents: Lesson = {
	id: 'svelte-core.svelte-basics.styling-components',
	slug: 'styling-components',
	title: 'Styling Components',
	description: 'Learn how Svelte scopes CSS to components, and use class directives and CSS custom properties.',
	trackId: 'svelte-core',
	moduleId: 'svelte-basics',
	order: 3,
	estimatedMinutes: 12,
	concepts: ['svelte5.styles.scoped', 'svelte5.styles.class-directive', 'css.custom-properties'],
	prerequisites: ['svelte5.components.basic'],

	content: [
		{
			type: 'text',
			content: `# Styling Svelte Components

CSS in large applications has a fundamental problem: everything is global. A \`.card\` class defined in one file affects every element with that class across the entire application. Over the years, the industry has invented numerous solutions — BEM naming conventions (\`.block__element--modifier\`), CSS Modules (locally-scoped class names via build tools), CSS-in-JS libraries (styled-components, Emotion), and utility frameworks (Tailwind). Each solves the global scope problem but adds complexity, tooling requirements, or runtime overhead.

Svelte takes a different approach: **scoped styles are the default**, handled by the compiler at build time with zero runtime cost.

## Why Scoped Styles Are the Default

When you write CSS inside a \`<style>\` block in a Svelte component, three things happen automatically:

1. **Isolation** — Your styles cannot accidentally affect elements in other components. You can use simple, semantic class names like \`.card\`, \`.title\`, \`.button\` without fear of collisions.
2. **Maintainability** — When you delete a component, its styles are deleted too. No hunting through global stylesheets to find and remove orphaned rules.
3. **Dead code elimination** — The Svelte compiler warns you about unused CSS selectors within a component. If you write \`.header { color: red }\` but never use the \`.header\` class in the template, the compiler flags it. This keeps your styles lean over time.

These benefits come free — no configuration, no naming conventions, no extra dependencies.

## How Svelte Adds Unique Class Hashes

Under the hood, the compiler transforms your CSS selectors by appending a unique hash. Consider this component:

\`\`\`svelte
<div class="card">
  <h2>Title</h2>
  <p>Description</p>
</div>

<style>
  .card { background: #1e1e2e; padding: 1.5rem; }
  h2 { color: white; margin: 0; }
  p { color: #a1a1aa; }
</style>
\`\`\`

The compiler generates CSS like:

\`\`\`css
.card.svelte-x7k9f2 { background: #1e1e2e; padding: 1.5rem; }
h2.svelte-x7k9f2 { color: white; margin: 0; }
p.svelte-x7k9f2 { color: #a1a1aa; }
\`\`\`

And the HTML output becomes:

\`\`\`html
<div class="card svelte-x7k9f2">
  <h2 class="svelte-x7k9f2">Title</h2>
  <p class="svelte-x7k9f2">Description</p>
</div>
\`\`\`

The hash \`svelte-x7k9f2\` is derived from the component's file contents. Every element in the template that could be targeted by a scoped selector gets the hash class added. The result: \`h2.svelte-x7k9f2\` only matches \`<h2>\` elements within this specific component. An \`<h2>\` in a child component has a different hash (or no hash), so it is unaffected.

This is why scoped styles do not reach into child components. The child's elements do not carry the parent's hash class, so the parent's selectors simply do not match. This is intentional — each component is responsible for its own styling.

## Comparison with Other Approaches

| Approach | Scoping Method | Runtime Cost | Tooling Required |
|---|---|---|---|
| **Svelte scoped styles** | Compiler-added hash classes | None | Svelte compiler (already required) |
| **CSS Modules** | Build-tool-generated unique class names | None | Webpack/Vite loader configuration |
| **CSS-in-JS (styled-components)** | Runtime-generated \`<style>\` tags | Yes — generates CSS in the browser | Library dependency (~12KB) |
| **BEM convention** | Developer discipline | None | None, but error-prone |
| **Tailwind** | Utility classes (no custom names) | None | PostCSS plugin, large config |

Svelte's approach is the lightest: it requires zero extra configuration (the compiler already processes your files), adds zero runtime code, and gives you the full power of standard CSS syntax.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.styles.scoped'
		},
		{
			type: 'text',
			content: `## Building a Themed Card — Hands On

Look at the starter code. It renders a notification card with a status indicator, a title, and a message. The card should change its appearance based on a \`status\` prop — \`success\`, \`warning\`, or \`error\`.

**Task:** Add a \`<style>\` block that styles the \`.notification\` card. Give it a dark background, rounded corners, padding, and use the CSS custom property \`--status-color\` (already set in the template via the \`style:\` directive) to color the left border and the status indicator dot.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## The class: Directive

Svelte provides a shorthand for conditionally toggling CSS classes:

\`\`\`svelte
<!-- Long form -->
<div class={isActive ? 'card active' : 'card'}>

<!-- Svelte class directive — much cleaner -->
<div class="card" class:active={isActive}>
\`\`\`

The \`class:name={condition}\` directive adds the class \`name\` when \`condition\` is truthy and removes it when falsy. If the variable name matches the class name, you get an even shorter form:

\`\`\`svelte
<!-- When the variable is named 'active' and the class is 'active' -->
<div class="card" class:active>
\`\`\`

This is not just syntax sugar. The compiled output for \`class:\` directives is a targeted \`classList.toggle()\` call — it does not rebuild the entire class attribute string. This is more efficient than the ternary approach, especially when an element has many conditional classes.

**Task:** Add a \`class:dismissed\` directive to the notification card. When clicked, the card should toggle its dismissed state and show a visual change (opacity reduction, strikethrough, etc.).`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## The style: Directive and CSS Custom Properties

Beyond classes, Svelte lets you set individual CSS properties dynamically with the \`style:\` directive:

\`\`\`svelte
<div style:color={textColor} style:font-size="{size}px">
  Dynamic styling
</div>
\`\`\`

This compiles to a targeted \`element.style.setProperty()\` call — no string concatenation, no re-parsing of the entire \`style\` attribute.

### CSS Custom Properties for Theming

CSS custom properties (\`--variable-name\`) work beautifully with Svelte's scoped styles for component theming:

\`\`\`svelte
<!-- Parent sets the theme -->
<Card --card-bg="#1e1e2e" --card-accent="#6366f1" />

<!-- Card.svelte uses the properties with fallbacks -->
<style>
  .card {
    background: var(--card-bg, white);
    border-color: var(--card-accent, blue);
  }
</style>
\`\`\`

This pattern lets parent components customize child component appearance without breaking encapsulation. The child defines which properties are customizable (via \`var()\` with fallbacks), and the parent sets values for the ones it cares about. This is far more maintainable than passing style-related props — the component's styling API is defined in CSS, where it belongs.

## The :global() Escape Hatch

Sometimes you genuinely need a style to reach beyond the component boundary. Svelte provides \`:global()\` for this:

\`\`\`svelte
<style>
  /* Scoped — only affects this component's .card */
  .card { background: white; }

  /* Global — affects ALL .card elements everywhere */
  :global(.card) { box-sizing: border-box; }

  /* Partially global — .card is scoped, but .highlight inside it is global */
  .card :global(.highlight) { color: yellow; }
</style>
\`\`\`

Use \`:global()\` sparingly. Common legitimate uses:

- Styling elements injected by third-party libraries (e.g., a date picker's dropdown)
- Setting styles on \`:global(body)\` or \`:global(html)\`
- Targeting dynamic class names added by actions or libraries

If you find yourself using \`:global()\` frequently, it usually means the component boundaries are drawn wrong. Consider moving the styles into the component that owns the elements.`
		},
		{
			type: 'xray-prompt',
			content: `Toggle X-Ray mode and examine the compiled CSS output. Look for these specific details:

1. **Hash specificity** — Every scoped selector has \`.svelte-xxxxx\` appended, increasing its specificity by exactly one class. This means scoped styles are slightly more specific than equivalent unscoped styles. If you have a global \`.card { color: red }\` and a scoped \`.card { color: blue }\`, the scoped style wins because \`.card.svelte-xxxxx\` is more specific than \`.card\`.

2. **The \`class:\` directive output** — Find the compiled JavaScript for the \`class:dismissed\` directive. You should see a \`classList.toggle('dismissed', condition)\` call, not string concatenation of the class attribute.

3. **The \`style:\` directive output** — Look for \`element.style.setProperty('--status-color', value)\` in the compiled code. This is a direct API call, not a template string rebuild.

4. **Unused selector warnings** — If you add a selector in the style block that does not match any element in the template, the compiler produces a warning. This static analysis is only possible because styles are scoped to a single component — global CSS cannot be analyzed this way.`
		},
		{
			type: 'text',
			content: `## Summary

Svelte's approach to styling embodies the framework's philosophy: do the heavy lifting at compile time so the runtime is minimal. Scoped styles give you isolation without BEM, CSS Modules, or runtime libraries. The \`class:\` directive provides clean conditional class toggling that compiles to efficient \`classList.toggle()\` calls. The \`style:\` directive enables dynamic inline styles via targeted \`setProperty()\` calls. CSS custom properties bridge the gap between component encapsulation and parent-level theming.

The key insight is that these are not runtime features — they are compiler features. The Svelte compiler sees your \`<style>\` block, your \`class:\` directives, and your \`style:\` directives at build time and generates the minimal JavaScript and CSS needed to make them work. The browser never loads a CSS-in-JS runtime, never parses template strings to compute class names, and never diffs style objects. It just applies pre-computed styles to pre-hashed elements.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let status: 'success' | 'warning' | 'error' = 'success';
  let dismissed = false;

  const statusColors = {
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444'
  };

  const messages = {
    success: 'Deployment completed successfully.',
    warning: 'Build succeeded with 3 warnings.',
    error: 'Pipeline failed at test stage.'
  };
</script>

<div class="controls">
  <button onclick={() => status = 'success'}>Success</button>
  <button onclick={() => status = 'warning'}>Warning</button>
  <button onclick={() => status = 'error'}>Error</button>
</div>

<!-- TODO: Add class:dismissed directive -->
<div
  class="notification"
  style:--status-color={statusColors[status]}
  onclick={() => dismissed = !dismissed}
>
  <span class="dot"></span>
  <div>
    <strong>{status.toUpperCase()}</strong>
    <p>{messages[status]}</p>
  </div>
</div>

<!-- TODO: Add a <style> block -->`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let status: 'success' | 'warning' | 'error' = 'success';
  let dismissed = false;

  const statusColors = {
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444'
  };

  const messages = {
    success: 'Deployment completed successfully.',
    warning: 'Build succeeded with 3 warnings.',
    error: 'Pipeline failed at test stage.'
  };
</script>

<div class="controls">
  <button onclick={() => status = 'success'}>Success</button>
  <button onclick={() => status = 'warning'}>Warning</button>
  <button onclick={() => status = 'error'}>Error</button>
</div>

<div
  class="notification"
  class:dismissed
  style:--status-color={statusColors[status]}
  onclick={() => dismissed = !dismissed}
>
  <span class="dot"></span>
  <div>
    <strong>{status.toUpperCase()}</strong>
    <p>{messages[status]}</p>
  </div>
</div>

<style>
  .controls {
    display: flex;
    gap: 0.5rem;
    margin-block-end: 1rem;
  }

  button {
    padding: 0.4rem 0.8rem;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    background: #27272a;
    color: #d4d4d8;
    cursor: pointer;
    font-size: 0.85rem;
  }

  button:hover {
    background: #3f3f46;
  }

  .notification {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: #1e1e2e;
    border-radius: 10px;
    border-left: 4px solid var(--status-color, #6366f1);
    color: white;
    font-family: system-ui, sans-serif;
    cursor: pointer;
    transition: opacity 300ms ease, border-color 300ms ease;
  }

  .notification.dismissed {
    opacity: 0.4;
    text-decoration: line-through;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--status-color, #6366f1);
    margin-top: 0.35rem;
    flex-shrink: 0;
  }

  strong {
    font-size: 0.8rem;
    letter-spacing: 0.05em;
    color: var(--status-color, #6366f1);
  }

  p {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: #a1a1aa;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add a <style> block with styles for the .notification class using --status-color',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<style>' },
						{ type: 'contains', value: '.notification' },
						{ type: 'contains', value: '--status-color' }
					]
				}
			},
			hints: [
				'Add a `<style>` block at the bottom of the component. Target `.notification` and give it `padding`, `background`, and `border-radius`. Use `var(--status-color)` for the `border-left` color.',
				'The `--status-color` custom property is already set on the element via `style:--status-color={statusColors[status]}`. You reference it in CSS with `var(--status-color)`. Try: `border-left: 4px solid var(--status-color);`',
				'Full `.notification` rule: `.notification { display: flex; gap: 0.75rem; padding: 1rem 1.25rem; background: #1e1e2e; border-radius: 10px; border-left: 4px solid var(--status-color, #6366f1); color: white; }`'
			],
			conceptsTested: ['svelte5.styles.scoped']
		},
		{
			id: 'cp-2',
			description: 'Add a class:dismissed directive to the notification div',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'class:dismissed' }]
				}
			},
			hints: [
				'The `class:` directive conditionally adds a CSS class. Since the variable `dismissed` matches the class name `dismissed`, you can use the shorthand form: `class:dismissed` (no `={...}` needed).',
				'Add `class:dismissed` as an attribute on the `.notification` div, alongside the existing `class="notification"`. Then add a `.notification.dismissed` style rule with reduced opacity.',
				'Change the div to: `<div class="notification" class:dismissed style:--status-color={statusColors[status]} onclick={() => dismissed = !dismissed}>` and add `.notification.dismissed { opacity: 0.4; }` to your style block.'
			],
			conceptsTested: ['svelte5.styles.class-directive']
		}
	]
};
