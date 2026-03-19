import type { Course, Phase, Module, LessonMeta } from '$lib/types';

function lesson(module: number, lessonIndex: number, title: string, phase: number): LessonMeta {
	return {
		id: `${module}-${lessonIndex}`,
		title,
		phase,
		module,
		lessonIndex
	};
}

function mod(index: number, title: string, lessons: LessonMeta[]): Module {
	return {
		index,
		title,
		lessonCount: lessons.length,
		lessons
	};
}

export const course: Course = {
	id: 'svelte-pe7-mastery',
	title: 'Svelte PE7 Mastery',
	phases: [
		// ── PHASE 1: FIRST STEPS (Modules 0–4) · 32 lessons ──
		{
			index: 1,
			title: 'First Steps',
			description:
				'Dev setup, Git, Prettier from day 1. Variables, types, null/undefined, type coercion. Objects, arrays, destructuring, spread, Object utilities. Components, props, {#if}, {#each}. Array methods, strings, regex, Math, Date, Intl. Events, bubbling, keyboard, scope, closures.',
			project: 'Interactive Product Catalog',
			modules: [
				mod(0, 'First Contact', [
					lesson(0, 1, 'Set Up Your Machine', 1),
					lesson(0, 2, 'Your First SvelteKit Project', 1),
					lesson(0, 3, 'Seeing Your Data & Leaving Notes', 1),
					lesson(0, 4, 'Functions & Making Things Happen', 1),
					lesson(0, 5, 'Text, Numbers & Booleans', 1),
					lesson(0, 6, 'The Void: null, undefined & Falsy', 1),
					lesson(0, 7, 'let vs const', 1),
					lesson(0, 8, 'Git & Prettier: Save Your Work', 1)
				]),
				mod(1, 'Working with Data', [
					lesson(1, 1, 'Objects: Grouping Related Data', 1),
					lesson(1, 2, 'Arrays: Lists of Things', 1),
					lesson(1, 3, 'Destructuring', 1),
					lesson(1, 4, 'Spread & Copying', 1),
					lesson(1, 5, 'Operators & Comparisons', 1),
					lesson(1, 6, 'Object Utilities', 1)
				]),
				mod(2, 'Components & Props', [
					lesson(2, 1, 'Your First Component', 1),
					lesson(2, 2, 'Passing Data: $props()', 1),
					lesson(2, 3, 'Conditional Rendering: {#if}', 1),
					lesson(2, 4, 'List Rendering: {#each}', 1),
					lesson(2, 5, 'Component Patterns', 1)
				]),
				mod(3, 'Transforming Data', [
					lesson(3, 1, 'Control Flow: if/else, switch', 1),
					lesson(3, 2, 'Loops & Recursion', 1),
					lesson(3, 3, 'Array Methods: map, filter, find', 1),
					lesson(3, 4, 'Sorting, Reducing & Mutating', 1),
					lesson(3, 5, 'String Methods', 1),
					lesson(3, 6, 'Regular Expressions', 1),
					lesson(3, 7, 'Math, Numbers, Dates & Intl', 1)
				]),
				mod(4, 'Events & Interactivity', [
					lesson(4, 1, 'Events Deep Dive', 1),
					lesson(4, 2, 'Bubbling & stopPropagation', 1),
					lesson(4, 3, 'Keyboard Events & Accessibility', 1),
					lesson(4, 4, 'Callbacks & Communication', 1),
					lesson(4, 5, 'Scope & Closures', 1)
				])
			]
		} satisfies Phase,

		// ── PHASE 2: FOUNDATIONS (Modules 5–8) · 25 lessons ──
		{
			index: 2,
			title: 'Foundations',
			description:
				'How the web works, derived state & effects, error handling & JSON, TypeScript introduction.',
			project: 'Real-Time Dashboard',
			modules: [
				mod(5, 'How the Web Works', [
					lesson(5, 1, 'Client, Server & HTTP', 2),
					lesson(5, 2, 'The DOM & Hydration', 2),
					lesson(5, 3, 'URLs, Query Strings & URL API', 2),
					lesson(5, 4, 'Browser Storage', 2),
					lesson(5, 5, 'Browser APIs & Reactive Window State', 2)
				]),
				mod(6, 'Derived State & Effects', [
					lesson(6, 1, '$derived: Computed Values', 2),
					lesson(6, 2, 'Derived Chains & Destructuring', 2),
					lesson(6, 3, 'Overriding Derived (Optimistic UI)', 2),
					lesson(6, 4, '$effect: Side Effects', 2),
					lesson(6, 5, 'When NOT to Use $effect', 2),
					lesson(6, 6, 'Reactivity Boundaries: What Breaks', 2),
					lesson(6, 7, 'untrack() & Dependency Control', 2),
					lesson(6, 8, 'Timers, Cleanup & Debounce', 2),
					lesson(6, 9, '$inspect, flushSync, Event Loop & Timing', 2)
				]),
				mod(7, 'Error Handling & JSON', [
					lesson(7, 1, 'try/catch/finally', 2),
					lesson(7, 2, 'Error Types & Stack Traces', 2),
					lesson(7, 3, 'Custom Errors & Patterns', 2),
					lesson(7, 4, 'JSON & Deep Copying', 2)
				]),
				mod(8, 'TypeScript: The Switch', [
					lesson(8, 1, 'Why Types & lang=ts', 2),
					lesson(8, 2, 'Interfaces for Props', 2),
					lesson(8, 3, 'Union Types, Literals & as const', 2),
					lesson(8, 4, 'Type Guards & Discriminated Unions', 2),
					lesson(8, 5, 'Generic Functions & unknown', 2),
					lesson(8, 6, 'Utility Types & Aliases', 2),
					lesson(8, 7, 'satisfies, ReturnType & app.d.ts', 2)
				])
			]
		} satisfies Phase,

		// ── PHASE 3: COMPONENTS & FORMS (Modules 9–11) · 22 lessons ──
		{
			index: 3,
			title: 'Components & Forms',
			description:
				'Forms & binding, component composition, SvelteKit routing.',
			project: 'Multi-Page App',
			modules: [
				mod(9, 'Forms & Binding', [
					lesson(9, 1, 'Two-Way Binding: bind:value', 3),
					lesson(9, 2, 'Checkboxes, Radios, Selects & Details', 3),
					lesson(9, 3, 'Function Bindings (Since 5.9)', 3),
					lesson(9, 4, 'Reactive Forms: Validation', 3),
					lesson(9, 5, 'Files, Dimensions & DOM References', 3),
					lesson(9, 6, 'Contenteditable & Special Bindings', 3),
					lesson(9, 7, 'The this Keyword', 3)
				]),
				mod(10, 'Component Composition', [
					lesson(10, 1, 'Snippets: Reusable Markup', 3),
					lesson(10, 2, 'Passing Snippets to Components', 3),
					lesson(10, 3, 'Context: Sharing Without Props', 3),
					lesson(10, 4, 'Modules & Shared State', 3),
					lesson(10, 5, '{#key}, {@const} & {@debug}', 3),
					lesson(10, 6, 'Packages & Dependencies', 3),
					lesson(10, 7, 'Compound Components', 3)
				]),
				mod(11, 'SvelteKit Routing', [
					lesson(11, 1, 'File-Based Routing', 3),
					lesson(11, 2, 'Layouts: Shared UI', 3),
					lesson(11, 3, 'Dynamic Routes & Params', 3),
					lesson(11, 4, 'Navigation & $app/state', 3),
					lesson(11, 5, '<svelte:head> & Metadata', 3),
					lesson(11, 6, 'Error Pages & <svelte:boundary>', 3),
					lesson(11, 7, 'Link Options & Preloading', 3),
					lesson(11, 8, 'Config, Assets, Images & Icons', 3)
				])
			]
		} satisfies Phase,

		// ── PHASE 4: DATA & ASYNC (Modules 12–13) · 14 lessons ──
		{
			index: 4,
			title: 'Data & Async',
			description:
				'Async JavaScript & data loading, form actions & mutations.',
			project: 'Blog with CMS',
			modules: [
				mod(12, 'Async JavaScript & Data Loading', [
					lesson(12, 1, 'Promises & Event Loop', 4),
					lesson(12, 2, 'async/await', 4),
					lesson(12, 3, 'fetch API', 4),
					lesson(12, 4, 'Parallel Async & Partial Failures', 4),
					lesson(12, 5, 'AbortController, Cancellation & getAbortSignal', 4),
					lesson(12, 6, 'Universal Load (+page.js)', 4),
					lesson(12, 7, 'Server Load (+page.server.js)', 4),
					lesson(12, 8, 'Universal vs Server: The Decision', 4),
					lesson(12, 9, 'Streaming, {#await} & Parallel Loading', 4)
				]),
				mod(13, 'Form Actions & Mutations', [
					lesson(13, 1, 'HTML Forms & FormData', 4),
					lesson(13, 2, 'Default & Named Actions', 4),
					lesson(13, 3, 'Validation, fail() & Errors', 4),
					lesson(13, 4, 'use:enhance', 4),
					lesson(13, 5, 'Redirects & Post-Action Loading', 4)
				])
			]
		} satisfies Phase,

		// ── PHASE 5: ADVANCED MASTERY (Modules 14–17) · 30 lessons ──
		{
			index: 5,
			title: 'Advanced Mastery',
			description:
				'Advanced runes, advanced components, classes, generics & advanced JS, SvelteKit advanced & security.',
			project: 'Feature-Rich App',
			modules: [
				mod(14, 'Advanced Runes', [
					lesson(14, 1, '$state.raw & $state.snapshot', 5),
					lesson(14, 2, '$state.eager & Sync Updates', 5),
					lesson(14, 3, '$effect.pre, $effect.tracking, $effect.root', 5),
					lesson(14, 4, '$bindable & Two-Way Component Binding', 5),
					lesson(14, 5, '$props.id() & Accessible Components', 5)
				]),
				mod(15, 'Advanced Components', [
					lesson(15, 1, '{@attach} & use: Directive Awareness', 5),
					lesson(15, 2, '<svelte:boundary>: Error Recovery', 5),
					lesson(15, 3, 'Async Svelte: Rendering & Pending (Experimental)', 5),
					lesson(15, 4, 'Async Svelte: Forking & Concurrency (Experimental)', 5),
					lesson(15, 5, 'Transitions & Animations', 5),
					lesson(15, 6, 'Spring & Tween Classes: Motion Primitives', 5),
					lesson(15, 7, 'animate:flip & List Reordering', 5),
					lesson(15, 8, 'Special Elements', 5),
					lesson(15, 9, 'Dynamic Classes & Styles', 5),
					lesson(15, 10, 'Legacy Awareness', 5),
					lesson(15, 11, 'Imperative API: mount, unmount & hydrate', 5)
				]),
				mod(16, 'Classes, Generics & Advanced JS', [
					lesson(16, 1, 'Classes with $state Fields', 5),
					lesson(16, 2, 'Private Fields, Static & Inheritance', 5),
					lesson(16, 3, 'Reactive Built-ins', 5),
					lesson(16, 4, 'Generic Components', 5),
					lesson(16, 5, 'Component Type & Wrappers', 5),
					lesson(16, 6, 'Symbol, WeakMap & Iterators', 5),
					lesson(16, 7, 'Dynamic import() & Code Splitting', 5)
				]),
				mod(17, 'SvelteKit Advanced & Security', [
					lesson(17, 1, 'Hooks: handle, handleError, init', 5),
					lesson(17, 2, '$app/navigation & Lifecycle', 5),
					lesson(17, 3, '$app/server: getRequestEvent & read', 5),
					lesson(17, 4, 'Page Options: prerender, ssr, csr, trailingSlash', 5),
					lesson(17, 5, 'Advanced Routing & Layout Groups', 5),
					lesson(17, 6, 'Shallow Routing & Snapshots', 5),
					lesson(17, 7, 'Data Invalidation Patterns', 5),
					lesson(17, 8, 'Security: XSS, CSRF & CSP', 5),
					lesson(17, 9, 'Environment, Server-Only & Transport', 5)
				])
			]
		} satisfies Phase,

		// ── PHASE 6: SEO (Module 18) · 8 lessons ──
		{
			index: 6,
			title: 'SEO',
			description:
				'Search engine optimization for SvelteKit applications.',
			modules: [
				mod(18, 'SEO: Search Engine Optimization', [
					lesson(18, 1, 'Crawling, Indexing, Ranking', 6),
					lesson(18, 2, 'E-E-A-T & March 2026 Google Core Update', 6),
					lesson(18, 3, 'Technical SEO in SvelteKit', 6),
					lesson(18, 4, 'Structured Data & JSON-LD', 6),
					lesson(18, 5, 'Core Web Vitals', 6),
					lesson(18, 6, 'SSR, Prerender & SEO Architecture', 6),
					lesson(18, 7, 'Sitemaps, Robots & Indexing', 6),
					lesson(18, 8, 'Content Strategy Post-March 2026', 6)
				])
			]
		} satisfies Phase,

		// ── PHASE 7: PRODUCTION (Modules 19–20) · 17 lessons ──
		{
			index: 7,
			title: 'Production',
			description:
				'Production tooling, testing, deployment, and capstone project.',
			modules: [
				mod(19, 'Production Tooling', [
					lesson(19, 1, 'CSS PE7: Two-Tier Architecture', 7),
					lesson(19, 2, 'Styling: Variants, :global() & Component Props', 7),
					lesson(19, 3, 'Code Quality: ESLint & svelte-check', 7),
					lesson(19, 4, 'Unit Testing with Vitest', 7),
					lesson(19, 5, 'E2E Testing with Playwright', 7),
					lesson(19, 6, 'Debugging & Performance', 7),
					lesson(19, 7, 'Accessibility', 7),
					lesson(19, 8, 'File Organization & Naming', 7),
					lesson(19, 9, 'Building Component Libraries: svelte-package', 7),
					lesson(19, 10, 'Deployment', 7)
				]),
				mod(20, 'Capstone: Build What You Imagine', [
					lesson(20, 1, 'Architecture & Planning', 7),
					lesson(20, 2, 'Design System Setup', 7),
					lesson(20, 3, 'Core Components', 7),
					lesson(20, 4, 'Page Architecture & Data', 7),
					lesson(20, 5, 'SEO Implementation', 7),
					lesson(20, 6, 'Testing & Audit', 7),
					lesson(20, 7, 'Deploy & Ship', 7)
				])
			]
		} satisfies Phase
	]
};

export default course;
