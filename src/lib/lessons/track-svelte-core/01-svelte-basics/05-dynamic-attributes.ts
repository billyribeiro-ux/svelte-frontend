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

Just like you can use curly braces in text, you can use them in element attributes to make them dynamic:

\`\`\`svelte
<img src={imageSrc} alt={imageAlt} />
\`\`\`

This is essential for building real UIs where attributes depend on data.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.template.dynamic-attributes'
		},
		{
			type: 'text',
			content: `## Making Attributes Dynamic

Look at the starter code — the image \`src\` and \`alt\` are hardcoded in the HTML. The variables exist in the script but aren't connected.

**Task:** Replace the hardcoded \`src\` and \`alt\` attributes with dynamic expressions.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Attribute Shorthand

When the attribute name and variable name are the same, Svelte gives you a handy shorthand:

\`\`\`svelte
<!-- These are equivalent -->
<img src={src} />
<img {src} />
\`\`\`

**Task:** Use the shorthand syntax for the \`src\` attribute.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode to see how dynamic attributes compile. Svelte generates a targeted `setAttribute` call for each dynamic attribute — no diffing needed.'
		},
		{
			type: 'text',
			content: `## Spreading Props

When you have an object of attributes, you can spread them onto an element:

\`\`\`svelte
<script lang="ts">
  let imgProps = { src: '/photo.jpg', alt: 'A photo', width: 200 };
</script>

<img {...imgProps} />
\`\`\`

**Task:** Create a props object and spread it onto the image element.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let src = 'https://picsum.photos/300/200';
  let alt = 'A random placeholder image';
</script>

<!-- TODO: Make these attributes dynamic using {expressions} -->
<img src="https://picsum.photos/300/200" alt="A random placeholder image" />

<style>
  img {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 100%;
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
  let src = 'https://picsum.photos/300/200';
  let alt = 'A random placeholder image';

  let imgProps = { src, alt, width: 300 };
</script>

<img {...imgProps} />

<style>
  img {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 100%;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use dynamic expressions for src and alt attributes',
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
				'Replace the hardcoded string values in the `<img>` tag with curly-brace expressions.',
				'Change `src="https://..."` to `src={src}` to bind to the variable.',
				'The img tag should look like: `<img src={src} alt={alt} />`'
			],
			conceptsTested: ['svelte5.template.dynamic-attributes']
		},
		{
			id: 'cp-2',
			description: 'Use the shorthand syntax {src} instead of src={src}',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: '\\{src\\}' },
						{ type: 'not-contains', value: 'src={src}' }
					]
				}
			},
			hints: [
				'When the attribute name matches the variable name, you can omit the `name=` part.',
				'Instead of `src={src}`, just write `{src}`.',
				'The img tag should look like: `<img {src} alt={alt} />`'
			],
			conceptsTested: ['svelte5.template.shorthand']
		},
		{
			id: 'cp-3',
			description: 'Use the spread syntax to apply an object of attributes',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{...imgProps}' },
						{ type: 'regex', value: 'let\\s+imgProps' }
					]
				}
			},
			hints: [
				'Create an object that contains `src`, `alt`, and other attributes.',
				'Add `let imgProps = { src, alt, width: 300 };` in the script.',
				'Then use `<img {...imgProps} />` to spread all properties as attributes.'
			],
			conceptsTested: ['svelte5.template.spread']
		}
	]
};
