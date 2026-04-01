import type { Lesson } from '$types/lesson';

export const effectBasics: Lesson = {
	id: 'svelte-core.runes.effect-basics',
	slug: 'effect-basics',
	title: 'Side Effects with $effect',
	description: 'Learn how to use $effect for side effects, cleanup, and when to choose $derived instead.',
	trackId: 'svelte-core',
	moduleId: 'runes-reactivity',
	order: 3,
	estimatedMinutes: 15,
	concepts: ['svelte5.runes.effect', 'svelte5.runes.effect-cleanup'],
	prerequisites: ['svelte5.runes.state', 'svelte5.runes.derived'],

	content: [
		{
			type: 'text',
			content: `# Side Effects with \`$effect\`

While \`$state\` and \`$derived\` handle reactive data, sometimes you need to **do something** when values change — log to the console, update the document title, start a timer, or sync with an external system. That's what \`$effect\` is for.

\`\`\`svelte
$effect(() => {
  console.log('Count is now', count);
});
\`\`\`

The effect runs whenever any reactive value it reads changes.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.effect'
		},
		{
			type: 'text',
			content: `## Your First Effect

Look at the starter code. There's a \`count\` state variable, but no logging when it changes.

**Task:** Add a \`$effect\` that logs the current count to the console every time it changes.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Cleanup with Return

Effects often set up resources that need to be cleaned up — intervals, event listeners, subscriptions. Return a cleanup function from your effect:

\`\`\`svelte
$effect(() => {
  const id = setInterval(() => { /* ... */ }, 1000);
  return () => clearInterval(id);
});
\`\`\`

The cleanup runs before the effect re-runs and when the component is destroyed.

**Task:** Add an effect that starts an interval and returns a cleanup function.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode to see how Svelte tracks which reactive values an effect reads. The compiler does not statically analyze dependencies — they are tracked at runtime, so conditional reads are handled correctly.'
		},
		{
			type: 'text',
			content: `## $effect vs $derived — Know the Difference

A common mistake is using \`$effect\` to compute values. If you find yourself setting state inside an effect, you probably want \`$derived\` instead:

\`\`\`svelte
// Bad — don't do this
let doubled = $state(0);
$effect(() => { doubled = count * 2; });

// Good — use $derived
let doubled = $derived(count * 2);
\`\`\`

**Task:** The starter code has a misused \`$effect\` that sets \`message\`. Replace it with \`$derived\`.`
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
  let count = $state(0);
  let elapsed = $state(0);

  // TODO: Add $effect that logs count changes

  // TODO: Add $effect with interval and cleanup for elapsed

  // Bad pattern — replace this $effect with $derived
  let message = $state('');
  $effect(() => {
    message = count > 10 ? 'High count!' : 'Keep clicking';
  });
</script>

<button onclick={() => count++}>Count: {count}</button>
<p>Elapsed: {elapsed}s</p>
<p>{message}</p>

<style>
  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
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
  let count = $state(0);
  let elapsed = $state(0);

  $effect(() => {
    console.log('Count changed to', count);
  });

  $effect(() => {
    const id = setInterval(() => {
      elapsed += 1;
    }, 1000);
    return () => clearInterval(id);
  });

  let message = $derived(count > 10 ? 'High count!' : 'Keep clicking');
</script>

<button onclick={() => count++}>Count: {count}</button>
<p>Elapsed: {elapsed}s</p>
<p>{message}</p>

<style>
  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add a $effect that logs the count value',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: '\\$effect\\(\\(\\)\\s*=>\\s*\\{[^}]*console\\.log' }
					]
				}
			},
			hints: [
				'`$effect` takes a function that runs whenever its reactive dependencies change.',
				'Inside the effect, use `console.log` and reference the `count` variable so Svelte tracks it.',
				'Add: `$effect(() => { console.log(\'Count changed to\', count); });`'
			],
			conceptsTested: ['svelte5.runes.effect']
		},
		{
			id: 'cp-2',
			description: 'Add a $effect with setInterval and a cleanup return',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'setInterval' },
						{ type: 'contains', value: 'clearInterval' },
						{ type: 'regex', value: 'return\\s*\\(\\)\\s*=>' }
					]
				}
			},
			hints: [
				'Create an effect that calls `setInterval` and stores the returned ID.',
				'Return a cleanup function that calls `clearInterval` with that ID.',
				'Add: `$effect(() => { const id = setInterval(() => { elapsed += 1; }, 1000); return () => clearInterval(id); });`'
			],
			conceptsTested: ['svelte5.runes.effect-cleanup']
		},
		{
			id: 'cp-3',
			description: 'Replace the misused $effect with $derived for the message',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'let\\s+message\\s*=\\s*\\$derived' }
					]
				}
			},
			hints: [
				'When a value is purely computed from other reactive values, use `$derived` instead of `$effect`.',
				'Remove the `$effect` that sets `message` and replace `$state(\'\')` with a `$derived` expression.',
				'Change to: `let message = $derived(count > 10 ? \'High count!\' : \'Keep clicking\');`'
			],
			conceptsTested: ['svelte5.runes.effect']
		}
	]
};
