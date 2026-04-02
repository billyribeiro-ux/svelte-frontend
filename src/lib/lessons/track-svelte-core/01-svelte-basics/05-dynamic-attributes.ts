import type { Lesson } from '$types/lesson';

export const dynamicAttributes: Lesson = {
	id: 'svelte-core.svelte-basics.dynamic-attributes',
	slug: 'dynamic-attributes',
	title: 'Dynamic Attributes',
	description: 'Use dynamic attributes, shorthand syntax, and spread props in Svelte 5.',
	trackId: 'svelte-core',
	moduleId: 'svelte-basics',
	order: 5,
	estimatedMinutes: 10,
	concepts: ['svelte5.template.dynamic-attributes', 'svelte5.template.shorthand', 'svelte5.template.spread'],
	prerequisites: ['svelte5.components.basic', 'svelte5.template.expressions'],

	content: [
		{
			type: 'text',
			content: `# Dynamic Attributes

Static HTML attributes are constants — they never change after the page loads. But real applications need attributes that respond to user interaction, API data, and component state. Svelte lets you make any HTML attribute dynamic by wrapping its value in curly braces:

\`\`\`svelte
<img src={imageUrl} alt={imageDescription} />
<a href={linkTarget}>Click here</a>
<input type="text" placeholder={placeholderText} disabled={isDisabled} />
\`\`\`

This looks simple, but the way Svelte handles dynamic attributes under the hood is fundamentally different from how React or Vue handles them — and that difference matters for performance.

## How Attribute Updates Work (No Virtual DOM)

In React, when any piece of state changes, the entire component function re-runs. React builds a new virtual DOM tree, diffs it against the previous tree, and then applies the differences to the real DOM. If you have 20 attributes on an element and one changes, React still needs to compare all 20 during diffing.

Svelte skips all of that. The compiler analyzes your template at build time and generates targeted update code for each dynamic attribute. If you write:

\`\`\`svelte
<img src={url} alt={description} width={size} />
\`\`\`

The compiler generates something conceptually like:

\`\`\`javascript
// Creation:
img.src = url;
img.alt = description;
img.width = size;

// Update (only runs when the specific variable changes):
if (changed_url) img.src = url;
if (changed_description) img.alt = description;
if (changed_size) img.width = size;
\`\`\`

Each attribute gets its own conditional update. If only \`url\` changes, only the \`img.src\` assignment runs. The \`alt\` and \`width\` updates are skipped entirely — not because of a diff, but because the compiler knows statically which variables affect which attributes.

This is the core Svelte advantage: **the compiler converts your declarative template into imperative, surgical DOM operations at build time.**

## Building a Dynamic Image Gallery

Look at the starter code. It defines a small image gallery with an array of photos and a \`selectedIndex\` that tracks which photo is currently displayed. The image element has hardcoded attributes.

**Task:** Replace the hardcoded \`src\` and \`alt\` attributes on the \`<img>\` tag with dynamic expressions that read from the \`photos\` array using \`selectedIndex\`.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.template.dynamic-attributes'
		},
		{
			type: 'text',
			content: `## Attribute Shorthand — Why It Exists

When the attribute name and the variable name are identical, Svelte offers a shorthand:

\`\`\`svelte
<!-- These are equivalent -->
<img src={src} alt={alt} />
<img {src} {alt} />
\`\`\`

This is not just about saving keystrokes. The shorthand syntax communicates intent: the variable and the attribute are the same concept. When you see \`{src}\`, you immediately know there is a variable called \`src\` in the script block that maps directly to the HTML \`src\` attribute.

The shorthand also works for component props:

\`\`\`svelte
<script lang="ts">
  import Avatar from './Avatar.svelte';
  let name = 'Ada';
  let size = 48;
</script>

<!-- These are equivalent -->
<Avatar name={name} size={size} />
<Avatar {name} {size} />
\`\`\`

This pattern is especially valuable in data-heavy components where you are passing many values through. A component call like \`<UserCard {name} {email} {avatar} {role} {isOnline} />\` is significantly more scannable than the long-form version.

**Task:** Refactor the image attributes to use shorthand syntax wherever the variable name matches the attribute name.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Boolean Attributes

HTML has several boolean attributes — \`disabled\`, \`checked\`, \`readonly\`, \`hidden\`, \`required\`, etc. In HTML, a boolean attribute is "true" when it is present and "false" when it is absent (the value does not matter — \`disabled="false"\` still disables the element!).

Svelte handles this correctly:

\`\`\`svelte
<button disabled={isProcessing}>Submit</button>
\`\`\`

When \`isProcessing\` is \`true\`, Svelte adds the \`disabled\` attribute. When it is \`false\`, Svelte removes it entirely. This is the correct behavior — it does not set \`disabled="false"\` (which would still disable the button in raw HTML).

You can also use the shorthand:

\`\`\`svelte
<script lang="ts">
  let disabled = true;
</script>

<button {disabled}>Submit</button>
\`\`\`

In the gallery, the "Previous" button should be disabled when viewing the first image, and "Next" should be disabled at the last image.

**Task:** Add \`disabled\` attributes to the navigation buttons with dynamic expressions. Use the shorthand syntax where possible.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: `Toggle X-Ray mode and study the compiled output for dynamic attributes. Pay attention to these details:

1. **Property vs. attribute** — For most standard HTML attributes (\`src\`, \`alt\`, \`href\`), Svelte uses property assignment (\`element.src = value\`) rather than \`setAttribute()\`. Property assignment is faster because it skips the attribute parsing step. For custom attributes or less common ones, Svelte falls back to \`setAttribute()\`.

2. **Boolean attribute handling** — Find the compiled code for the \`disabled\` attribute. You should see conditional logic that either sets or removes the attribute. Svelte does not naively set \`disabled="false"\` — it correctly removes the attribute when the value is falsy.

3. **Granular change detection** — Each dynamic attribute has its own change check. The compiled code tracks which variables have been modified since the last update and only runs the assignments for attributes that depend on changed variables. This is compile-time optimization — no runtime diffing needed.

4. **Shorthand compilation** — The shorthand \`{src}\` compiles to exactly the same code as \`src={src}\`. It is pure syntax sugar with zero runtime difference.`
		},
		{
			type: 'text',
			content: `## Spreading Props

When you have an object containing multiple attributes, you can spread them onto an element or component:

\`\`\`svelte
<script lang="ts">
  let imgProps = {
    src: '/photo.jpg',
    alt: 'A beautiful landscape',
    width: 600,
    height: 400,
    loading: 'lazy' as const
  };
</script>

<img {...imgProps} />
\`\`\`

The spread operator \`{...obj}\` applies every property in the object as an attribute on the element. This is powerful but comes with important semantics:

### Ordering Matters

When you combine spread with explicit attributes, **order determines precedence** — later values override earlier ones:

\`\`\`svelte
<!-- alt from imgProps is overridden by the explicit alt -->
<img {...imgProps} alt="Custom description" />

<!-- The explicit alt is overridden by alt from imgProps -->
<img alt="Custom description" {...imgProps} />
\`\`\`

This is the same behavior as JavaScript object spread (\`{ ...defaults, ...overrides }\`) and follows the principle of least surprise.

### Spread on Components

Spread is especially useful when passing props to components:

\`\`\`svelte
<script lang="ts">
  let cardData = { title: 'Hello', description: 'World', variant: 'primary' };
</script>

<Card {...cardData} />
\`\`\`

This pattern is common when working with arrays of data objects that map directly to component props.

### Performance Consideration

Spread props are slightly less optimal than explicit attributes because the compiler cannot statically analyze which properties the object contains. With explicit attributes, the compiler generates a targeted update for each one. With spread, it must generate code that iterates over the object's properties at runtime. For most applications this difference is negligible, but prefer explicit attributes in performance-critical inner loops.

**Task:** Create a \`photoProps\` object that derives its values from the current \`photos[selectedIndex]\` entry, and spread it onto the \`<img>\` element.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'text',
			content: `## Summary

Dynamic attributes are the mechanism that connects your component's data to the rendered DOM. Svelte's compiler-driven approach means every dynamic attribute compiles to a direct, conditional property assignment — no virtual DOM diffing, no attribute string parsing, no wasted comparisons.

Key takeaways:

- **Dynamic attributes** use \`{expression}\` syntax: \`src={url}\`
- **Shorthand** drops the attribute name when it matches the variable: \`{src}\`
- **Boolean attributes** are correctly added/removed (not set to "false"): \`disabled={isLast}\`
- **Spread** applies an object's properties as attributes: \`{...props}\`
- **Order matters** with spread — later values win
- **Explicit attributes outperform spread** in hot paths because the compiler can generate targeted updates

These patterns form the foundation for building interactive, data-driven UIs in Svelte.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let selectedIndex = $state(0);

  const photos = [
    { src: 'https://picsum.photos/seed/mountains/600/400', alt: 'Mountain landscape', caption: 'Alpine peaks at sunrise' },
    { src: 'https://picsum.photos/seed/ocean/600/400', alt: 'Ocean waves', caption: 'Pacific coast sunset' },
    { src: 'https://picsum.photos/seed/forest/600/400', alt: 'Dense forest', caption: 'Ancient redwood grove' },
    { src: 'https://picsum.photos/seed/desert/600/400', alt: 'Desert dunes', caption: 'Sahara golden hour' }
  ];

  let currentPhoto = $derived(photos[selectedIndex]);

  function next() {
    if (selectedIndex < photos.length - 1) selectedIndex++;
  }

  function prev() {
    if (selectedIndex > 0) selectedIndex--;
  }
</script>

<div class="gallery">
  <div class="viewer">
    <!-- TODO: Make src and alt dynamic, then use shorthand, then use spread -->
    <img src="https://picsum.photos/seed/mountains/600/400" alt="Mountain landscape" />
  </div>

  <p class="caption">{currentPhoto.caption}</p>
  <p class="counter">{selectedIndex + 1} / {photos.length}</p>

  <div class="controls">
    <!-- TODO: Add disabled attributes to these buttons -->
    <button onclick={prev}>Previous</button>
    <button onclick={next}>Next</button>
  </div>
</div>

<style>
  .gallery {
    max-width: 600px;
    font-family: system-ui, sans-serif;
  }

  .viewer {
    border-radius: 12px;
    overflow: hidden;
    background: #1e1e2e;
    aspect-ratio: 3/2;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .caption {
    margin: 0.75rem 0 0.25rem;
    color: white;
    font-size: 1rem;
  }

  .counter {
    margin: 0;
    color: #71717a;
    font-size: 0.85rem;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  button {
    padding: 0.5rem 1.25rem;
    border: 1px solid #3f3f46;
    border-radius: 8px;
    background: #27272a;
    color: #d4d4d8;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 150ms;
  }

  button:hover:not(:disabled) {
    background: #3f3f46;
  }

  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
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
  let selectedIndex = $state(0);

  const photos = [
    { src: 'https://picsum.photos/seed/mountains/600/400', alt: 'Mountain landscape', caption: 'Alpine peaks at sunrise' },
    { src: 'https://picsum.photos/seed/ocean/600/400', alt: 'Ocean waves', caption: 'Pacific coast sunset' },
    { src: 'https://picsum.photos/seed/forest/600/400', alt: 'Dense forest', caption: 'Ancient redwood grove' },
    { src: 'https://picsum.photos/seed/desert/600/400', alt: 'Desert dunes', caption: 'Sahara golden hour' }
  ];

  let currentPhoto = $derived(photos[selectedIndex]);
  let photoProps = $derived({ src: currentPhoto.src, alt: currentPhoto.alt, width: 600, height: 400 });

  function next() {
    if (selectedIndex < photos.length - 1) selectedIndex++;
  }

  function prev() {
    if (selectedIndex > 0) selectedIndex--;
  }
</script>

<div class="gallery">
  <div class="viewer">
    <img {...photoProps} />
  </div>

  <p class="caption">{currentPhoto.caption}</p>
  <p class="counter">{selectedIndex + 1} / {photos.length}</p>

  <div class="controls">
    <button onclick={prev} disabled={selectedIndex === 0}>Previous</button>
    <button onclick={next} disabled={selectedIndex === photos.length - 1}>Next</button>
  </div>
</div>

<style>
  .gallery {
    max-width: 600px;
    font-family: system-ui, sans-serif;
  }

  .viewer {
    border-radius: 12px;
    overflow: hidden;
    background: #1e1e2e;
    aspect-ratio: 3/2;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .caption {
    margin: 0.75rem 0 0.25rem;
    color: white;
    font-size: 1rem;
  }

  .counter {
    margin: 0;
    color: #71717a;
    font-size: 0.85rem;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  button {
    padding: 0.5rem 1.25rem;
    border: 1px solid #3f3f46;
    border-radius: 8px;
    background: #27272a;
    color: #d4d4d8;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 150ms;
  }

  button:hover:not(:disabled) {
    background: #3f3f46;
  }

  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use dynamic expressions for the image src and alt attributes',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'src=\\{' },
						{ type: 'regex', value: 'alt=\\{' }
					]
				}
			},
			hints: [
				'The `currentPhoto` derived value gives you access to the current photo object. Use `currentPhoto.src` and `currentPhoto.alt` as dynamic attribute values.',
				'Replace the hardcoded string values with expressions: change `src="https://..."` to `src={currentPhoto.src}` and `alt="Mountain landscape"` to `alt={currentPhoto.alt}`.',
				'The img tag should look like: `<img src={currentPhoto.src} alt={currentPhoto.alt} />`'
			],
			conceptsTested: ['svelte5.template.dynamic-attributes']
		},
		{
			id: 'cp-2',
			description: 'Add disabled attributes to the navigation buttons',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'disabled=\\{selectedIndex' },
						{ type: 'contains', value: 'disabled=' }
					]
				}
			},
			hints: [
				'The "Previous" button should be disabled when `selectedIndex === 0` (first photo). The "Next" button should be disabled when `selectedIndex === photos.length - 1` (last photo).',
				'Use boolean expressions with the `disabled` attribute: `disabled={selectedIndex === 0}`. When the expression is `true`, the attribute is added; when `false`, it is removed.',
				'Full buttons: `<button onclick={prev} disabled={selectedIndex === 0}>Previous</button>` and `<button onclick={next} disabled={selectedIndex === photos.length - 1}>Next</button>`'
			],
			conceptsTested: ['svelte5.template.dynamic-attributes']
		},
		{
			id: 'cp-3',
			description: 'Create a photoProps object and spread it onto the img element',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{...photoProps}' },
						{ type: 'regex', value: 'photoProps' }
					]
				}
			},
			hints: [
				'Create a derived object in the script block that combines the photo attributes: `let photoProps = $derived({ src: currentPhoto.src, alt: currentPhoto.alt, width: 600, height: 400 });`',
				'Use `$derived()` since `photoProps` depends on `currentPhoto` which changes when `selectedIndex` changes. A plain `let` would not update reactively.',
				'Then replace the individual attributes with spread: `<img {...photoProps} />`. The spread applies all properties from the object as attributes on the element.'
			],
			conceptsTested: ['svelte5.template.spread']
		}
	]
};
