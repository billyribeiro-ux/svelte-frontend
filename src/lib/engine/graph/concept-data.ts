import type { ConceptNode, ConceptEdge } from '$types/concept';

export const initialNodes: ConceptNode[] = [
	// ── HTML concepts ──────────────────────────────────────────────
	{
		id: 'html.document-structure',
		title: 'Document Structure',
		description: 'The foundational skeleton of every HTML page including doctype, head, and body.',
		category: 'html',
		difficulty: 1,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'html.semantic-elements',
		title: 'Semantic Elements',
		description: 'Meaningful elements like header, nav, main, article, and section that convey purpose.',
		category: 'html',
		difficulty: 2,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'html.forms',
		title: 'Forms',
		description: 'The form element and its attributes for collecting and submitting user input.',
		category: 'html',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'html.inputs',
		title: 'Input Types',
		description: 'The many input types including text, number, date, range, and their validation attributes.',
		category: 'html',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'html.media',
		title: 'Media Elements',
		description: 'Embedding images, video, audio, and responsive media with picture and source elements.',
		category: 'html',
		difficulty: 2,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'html.tables',
		title: 'Tables',
		description: 'Structuring tabular data with table, thead, tbody, and proper accessibility headers.',
		category: 'html',
		difficulty: 2,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'html.accessibility',
		title: 'Accessibility',
		description: 'ARIA roles, labels, live regions, and patterns for building inclusive web content.',
		category: 'html',
		difficulty: 4,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'html.meta-tags',
		title: 'Meta Tags',
		description: 'Metadata elements for SEO, social sharing, viewport, and character encoding.',
		category: 'html',
		difficulty: 2,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},

	// ── CSS concepts ───────────────────────────────────────────────
	{
		id: 'css.selectors',
		title: 'Selectors',
		description: 'Targeting elements with type, class, id, attribute, and pseudo-class selectors.',
		category: 'css',
		difficulty: 2,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'css.specificity',
		title: 'Specificity',
		description: 'How the cascade resolves conflicts between competing selectors using specificity weights.',
		category: 'css',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'css.box-model',
		title: 'Box Model',
		description: 'Content, padding, border, and margin — the fundamental layout model of every element.',
		category: 'css',
		difficulty: 2,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'css.flexbox',
		title: 'Flexbox',
		description: 'One-dimensional layout with flexible alignment, ordering, and distribution of space.',
		category: 'css',
		difficulty: 4,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'css.grid',
		title: 'Grid',
		description: 'Two-dimensional layout with explicit rows, columns, and named template areas.',
		category: 'css',
		difficulty: 5,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'css.custom-properties',
		title: 'Custom Properties',
		description: 'CSS variables that cascade and can be dynamically updated at runtime.',
		category: 'css',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'css.native-nesting',
		title: 'Native Nesting',
		description: 'Nesting selectors directly in CSS without a preprocessor using the & syntax.',
		category: 'css',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'css.oklch-colors',
		title: 'OKLCH Colors',
		description: 'Perceptually uniform color space for consistent lightness and chroma control.',
		category: 'css',
		difficulty: 4,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'css.logical-properties',
		title: 'Logical Properties',
		description: 'Writing-mode-aware properties like inline-size and margin-block for internationalization.',
		category: 'css',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'css.container-queries',
		title: 'Container Queries',
		description: 'Responsive styles based on a parent container size rather than the viewport.',
		category: 'css',
		difficulty: 5,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},

	// ── TypeScript concepts ────────────────────────────────────────
	{
		id: 'ts.types',
		title: 'Basic Types',
		description: 'Primitive types, type annotations, and type inference in TypeScript.',
		category: 'typescript',
		difficulty: 2,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'ts.interfaces',
		title: 'Interfaces',
		description: 'Defining object shapes with interface declarations and optional properties.',
		category: 'typescript',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'ts.generics',
		title: 'Generics',
		description: 'Parameterized types for building reusable and type-safe functions and classes.',
		category: 'typescript',
		difficulty: 5,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'ts.type-narrowing',
		title: 'Type Narrowing',
		description: 'Refining union types through control flow analysis, type guards, and discriminants.',
		category: 'typescript',
		difficulty: 5,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'ts.utility-types',
		title: 'Utility Types',
		description: 'Built-in mapped types like Partial, Pick, Omit, and Record for type transformations.',
		category: 'typescript',
		difficulty: 6,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'ts.strict-mode',
		title: 'Strict Mode',
		description: 'Compiler flags for strictNullChecks, noImplicitAny, and maximum type safety.',
		category: 'typescript',
		difficulty: 4,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'ts.modules',
		title: 'Modules',
		description: 'ES module syntax with import/export and module resolution strategies.',
		category: 'typescript',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'ts.enums',
		title: 'Enums',
		description: 'Named constants with string and numeric enums and their compile-time behavior.',
		category: 'typescript',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},

	// ── Svelte 5 concepts ──────────────────────────────────────────
	{
		id: 'svelte5.components.basic',
		title: 'Basic Components',
		description: 'Creating Svelte components with script, markup, and scoped style blocks.',
		category: 'svelte',
		difficulty: 2,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'svelte5.template-expressions',
		title: 'Template Expressions',
		description: 'Embedding dynamic values in markup with curly brace expressions.',
		category: 'svelte',
		difficulty: 2,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'svelte5.styling',
		title: 'Styling',
		description: 'Scoped styles, global modifiers, and passing CSS custom properties to components.',
		category: 'svelte',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'svelte5.runes.state',
		title: '$state Rune',
		description: 'Declaring reactive state with the $state rune for fine-grained reactivity.',
		category: 'svelte',
		subcategory: 'runes',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'svelte5.runes.state-raw',
		title: '$state.raw Rune',
		description: 'Opting out of deep reactivity for large or immutable data structures.',
		category: 'svelte',
		subcategory: 'runes',
		difficulty: 5,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'svelte5.runes.derived',
		title: '$derived Rune',
		description: 'Computing values that automatically update when their dependencies change.',
		category: 'svelte',
		subcategory: 'runes',
		difficulty: 4,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'svelte5.runes.derived-by',
		title: '$derived.by Rune',
		description: 'Deriving values with complex logic using a callback function.',
		category: 'svelte',
		subcategory: 'runes',
		difficulty: 5,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'svelte5.runes.effect',
		title: '$effect Rune',
		description: 'Running side effects that re-execute when their reactive dependencies change.',
		category: 'svelte',
		subcategory: 'runes',
		difficulty: 5,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'svelte5.runes.props',
		title: '$props Rune',
		description: 'Declaring component inputs with destructured props and default values.',
		category: 'svelte',
		subcategory: 'runes',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'svelte5.runes.bindable',
		title: '$bindable Rune',
		description: 'Marking props as two-way bindable for parent-child state synchronization.',
		category: 'svelte',
		subcategory: 'runes',
		difficulty: 5,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'svelte5.runes.inspect',
		title: '$inspect Rune',
		description: 'Debugging reactive values by logging changes during development.',
		category: 'svelte',
		subcategory: 'runes',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'svelte5.control-flow.if',
		title: '{#if} Blocks',
		description: 'Conditional rendering with if, else if, and else template blocks.',
		category: 'svelte',
		subcategory: 'control-flow',
		difficulty: 2,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'svelte5.control-flow.each',
		title: '{#each} Blocks',
		description: 'Iterating over arrays with keyed each blocks for efficient list rendering.',
		category: 'svelte',
		subcategory: 'control-flow',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'svelte5.control-flow.await',
		title: '{#await} Blocks',
		description: 'Handling promise states with pending, then, and catch template blocks.',
		category: 'svelte',
		subcategory: 'control-flow',
		difficulty: 4,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'svelte5.snippets',
		title: 'Snippets',
		description: 'Reusable markup fragments defined with {#snippet} and rendered with {@render}.',
		category: 'svelte',
		subcategory: 'advanced',
		difficulty: 5,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'svelte5.events',
		title: 'Event Handling',
		description: 'Handling DOM and component events with on: directives and callback props.',
		category: 'svelte',
		subcategory: 'interaction',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},

	// ── SvelteKit concepts ─────────────────────────────────────────
	{
		id: 'sveltekit.routing',
		title: 'File-based Routing',
		description: 'Defining routes with the filesystem using +page, +layout, and route parameters.',
		category: 'sveltekit',
		difficulty: 3,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'sveltekit.load-functions',
		title: 'Load Functions',
		description: 'Fetching data on the server or client with +page.ts and +page.server.ts load functions.',
		category: 'sveltekit',
		difficulty: 5,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'sveltekit.form-actions',
		title: 'Form Actions',
		description: 'Server-side form handling with default and named actions in +page.server.ts.',
		category: 'sveltekit',
		difficulty: 6,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'sveltekit.hooks',
		title: 'Hooks',
		description: 'Intercepting requests and responses with handle, handleError, and handleFetch hooks.',
		category: 'sveltekit',
		difficulty: 7,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'sveltekit.ssr',
		title: 'Server-Side Rendering',
		description: 'Understanding SSR, hydration, and controlling rendering with ssr and csr page options.',
		category: 'sveltekit',
		difficulty: 6,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'sveltekit.api-routes',
		title: 'API Routes',
		description: 'Creating REST endpoints with +server.ts files and HTTP method handlers.',
		category: 'sveltekit',
		difficulty: 5,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'sveltekit.error-handling',
		title: 'Error Handling',
		description: 'Managing expected and unexpected errors with +error.svelte and error helpers.',
		category: 'sveltekit',
		difficulty: 5,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	},
	{
		id: 'sveltekit.adapters',
		title: 'Adapters',
		description: 'Deploying to different platforms with adapter-auto, adapter-node, and adapter-static.',
		category: 'sveltekit',
		difficulty: 4,
		mastery: 'unstarted',
		score: 0,
		lessons: []
	}
];

export const initialEdges: ConceptEdge[] = [
	// ── HTML prerequisite chains ───────────────────────────────────
	{ source: 'html.document-structure', target: 'html.semantic-elements', weight: 1, type: 'prerequisite' },
	{ source: 'html.document-structure', target: 'html.meta-tags', weight: 1, type: 'prerequisite' },
	{ source: 'html.semantic-elements', target: 'html.forms', weight: 0.8, type: 'prerequisite' },
	{ source: 'html.forms', target: 'html.inputs', weight: 1, type: 'prerequisite' },
	{ source: 'html.document-structure', target: 'html.media', weight: 0.6, type: 'prerequisite' },
	{ source: 'html.document-structure', target: 'html.tables', weight: 0.6, type: 'prerequisite' },
	{ source: 'html.semantic-elements', target: 'html.accessibility', weight: 1, type: 'prerequisite' },
	{ source: 'html.forms', target: 'html.accessibility', weight: 0.8, type: 'prerequisite' },

	// ── CSS prerequisite chains ────────────────────────────────────
	{ source: 'css.selectors', target: 'css.specificity', weight: 1, type: 'prerequisite' },
	{ source: 'css.selectors', target: 'css.box-model', weight: 0.8, type: 'prerequisite' },
	{ source: 'css.box-model', target: 'css.flexbox', weight: 1, type: 'prerequisite' },
	{ source: 'css.box-model', target: 'css.grid', weight: 1, type: 'prerequisite' },
	{ source: 'css.flexbox', target: 'css.grid', weight: 0.5, type: 'related' },
	{ source: 'css.selectors', target: 'css.custom-properties', weight: 0.8, type: 'prerequisite' },
	{ source: 'css.selectors', target: 'css.native-nesting', weight: 0.8, type: 'prerequisite' },
	{ source: 'css.specificity', target: 'css.native-nesting', weight: 0.6, type: 'prerequisite' },
	{ source: 'css.custom-properties', target: 'css.oklch-colors', weight: 0.5, type: 'related' },
	{ source: 'css.box-model', target: 'css.logical-properties', weight: 0.8, type: 'prerequisite' },
	{ source: 'css.grid', target: 'css.container-queries', weight: 0.7, type: 'prerequisite' },
	{ source: 'css.custom-properties', target: 'css.container-queries', weight: 0.5, type: 'related' },

	// ── TypeScript prerequisite chains ─────────────────────────────
	{ source: 'ts.types', target: 'ts.interfaces', weight: 1, type: 'prerequisite' },
	{ source: 'ts.interfaces', target: 'ts.generics', weight: 1, type: 'prerequisite' },
	{ source: 'ts.types', target: 'ts.type-narrowing', weight: 0.8, type: 'prerequisite' },
	{ source: 'ts.generics', target: 'ts.utility-types', weight: 1, type: 'prerequisite' },
	{ source: 'ts.types', target: 'ts.strict-mode', weight: 0.8, type: 'prerequisite' },
	{ source: 'ts.types', target: 'ts.modules', weight: 0.6, type: 'prerequisite' },
	{ source: 'ts.types', target: 'ts.enums', weight: 0.6, type: 'prerequisite' },

	// ── Cross-domain prerequisites into Svelte ─────────────────────
	{ source: 'html.document-structure', target: 'svelte5.components.basic', weight: 1, type: 'prerequisite' },
	{ source: 'css.selectors', target: 'svelte5.styling', weight: 0.8, type: 'prerequisite' },
	{ source: 'ts.types', target: 'svelte5.runes.props', weight: 0.6, type: 'prerequisite' },
	{ source: 'ts.interfaces', target: 'svelte5.runes.props', weight: 0.5, type: 'related' },

	// ── Svelte 5 prerequisite chains ───────────────────────────────
	{ source: 'svelte5.components.basic', target: 'svelte5.template-expressions', weight: 1, type: 'prerequisite' },
	{ source: 'svelte5.components.basic', target: 'svelte5.styling', weight: 0.8, type: 'prerequisite' },
	{ source: 'svelte5.components.basic', target: 'svelte5.runes.state', weight: 1, type: 'prerequisite' },
	{ source: 'svelte5.runes.state', target: 'svelte5.runes.state-raw', weight: 0.8, type: 'prerequisite' },
	{ source: 'svelte5.runes.state', target: 'svelte5.runes.derived', weight: 1, type: 'prerequisite' },
	{ source: 'svelte5.runes.derived', target: 'svelte5.runes.derived-by', weight: 1, type: 'prerequisite' },
	{ source: 'svelte5.runes.state', target: 'svelte5.runes.effect', weight: 1, type: 'prerequisite' },
	{ source: 'svelte5.runes.derived', target: 'svelte5.runes.effect', weight: 0.7, type: 'prerequisite' },
	{ source: 'svelte5.components.basic', target: 'svelte5.runes.props', weight: 1, type: 'prerequisite' },
	{ source: 'svelte5.runes.props', target: 'svelte5.runes.bindable', weight: 1, type: 'prerequisite' },
	{ source: 'svelte5.runes.state', target: 'svelte5.runes.inspect', weight: 0.6, type: 'prerequisite' },
	{ source: 'svelte5.template-expressions', target: 'svelte5.control-flow.if', weight: 1, type: 'prerequisite' },
	{ source: 'svelte5.template-expressions', target: 'svelte5.control-flow.each', weight: 1, type: 'prerequisite' },
	{ source: 'svelte5.control-flow.each', target: 'svelte5.control-flow.await', weight: 0.7, type: 'prerequisite' },
	{ source: 'svelte5.control-flow.if', target: 'svelte5.snippets', weight: 0.8, type: 'prerequisite' },
	{ source: 'svelte5.control-flow.each', target: 'svelte5.snippets', weight: 0.8, type: 'prerequisite' },
	{ source: 'svelte5.runes.props', target: 'svelte5.snippets', weight: 0.6, type: 'builds_on' },
	{ source: 'svelte5.components.basic', target: 'svelte5.events', weight: 0.8, type: 'prerequisite' },
	{ source: 'svelte5.runes.state', target: 'svelte5.events', weight: 0.6, type: 'prerequisite' },

	// ── Svelte -> SvelteKit prerequisites ──────────────────────────
	{ source: 'svelte5.components.basic', target: 'sveltekit.routing', weight: 1, type: 'prerequisite' },
	{ source: 'svelte5.runes.props', target: 'sveltekit.routing', weight: 0.6, type: 'prerequisite' },
	{ source: 'sveltekit.routing', target: 'sveltekit.load-functions', weight: 1, type: 'prerequisite' },
	{ source: 'svelte5.runes.effect', target: 'sveltekit.load-functions', weight: 0.5, type: 'related' },
	{ source: 'sveltekit.load-functions', target: 'sveltekit.form-actions', weight: 1, type: 'prerequisite' },
	{ source: 'html.forms', target: 'sveltekit.form-actions', weight: 0.7, type: 'prerequisite' },
	{ source: 'sveltekit.routing', target: 'sveltekit.hooks', weight: 0.8, type: 'prerequisite' },
	{ source: 'sveltekit.load-functions', target: 'sveltekit.hooks', weight: 0.7, type: 'prerequisite' },
	{ source: 'sveltekit.routing', target: 'sveltekit.ssr', weight: 0.8, type: 'prerequisite' },
	{ source: 'sveltekit.load-functions', target: 'sveltekit.ssr', weight: 0.7, type: 'prerequisite' },
	{ source: 'sveltekit.routing', target: 'sveltekit.api-routes', weight: 1, type: 'prerequisite' },
	{ source: 'ts.modules', target: 'sveltekit.api-routes', weight: 0.5, type: 'related' },
	{ source: 'sveltekit.routing', target: 'sveltekit.error-handling', weight: 0.8, type: 'prerequisite' },
	{ source: 'sveltekit.load-functions', target: 'sveltekit.error-handling', weight: 0.7, type: 'prerequisite' },
	{ source: 'sveltekit.ssr', target: 'sveltekit.adapters', weight: 0.8, type: 'prerequisite' }
];
