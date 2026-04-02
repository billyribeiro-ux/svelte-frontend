import type { Lesson } from '$types/lesson';

export const effectBasics: Lesson = {
	id: 'svelte-core.runes.effect-basics',
	slug: 'effect-basics',
	title: 'Side Effects with $effect',
	description: 'Learn how to use $effect for side effects, cleanup, and when to choose $derived instead.',
	trackId: 'svelte-core',
	moduleId: 'runes-reactivity',
	order: 3,
	estimatedMinutes: 20,
	concepts: ['svelte5.runes.effect', 'svelte5.runes.effect-cleanup'],
	prerequisites: ['svelte5.runes.state', 'svelte5.runes.derived'],

	content: [
		{
			type: 'text',
			content: `# Side Effects with \`$effect\`

While \`$state\` and \`$derived\` handle reactive data, sometimes you need to **do something** when values change — log to the console, update the document title, start a timer, sync with localStorage, or communicate with an external system. That is what \`$effect\` is for.

\`\`\`svelte
$effect(() => {
  console.log('Count is now', count);
});
\`\`\`

The effect runs whenever any reactive value it reads changes.

## Why Effects Are Escape Hatches

This is a critical mental model shift: **effects are escape hatches, not the primary tool for reactive logic.** In the Svelte 5 reactivity hierarchy, you should reach for tools in this order:

1. **\`$state\`** — for values that change over time
2. **\`$derived\`** — for values computed from other reactive values
3. **\`$effect\`** — for side effects that synchronize with the outside world

If you find yourself writing an effect that sets a \`$state\` variable, stop and ask: "Can I express this as a \`$derived\` value instead?" In the vast majority of cases, the answer is yes, and the derived version will be simpler, more efficient, and free from timing bugs.

Effects exist for the cases where you truly need to **do something** — interact with the DOM directly, call an external API, start a timer, write to localStorage, or synchronize with a non-Svelte system. These are inherently imperative operations that cannot be expressed as pure derivations.

### When NOT to Use Effects

Here are common anti-patterns to avoid:

\`\`\`svelte
// BAD: Computing a value in an effect
let count = $state(0);
let label = $state('');
$effect(() => {
  label = count > 10 ? 'High' : 'Low';
});
// GOOD: Use $derived instead
let label = $derived(count > 10 ? 'High' : 'Low');

// BAD: Transforming data in an effect
let items = $state([1, 2, 3]);
let filtered = $state([]);
$effect(() => {
  filtered = items.filter(i => i > 1);
});
// GOOD: Use $derived.by instead
let filtered = $derived.by(() => items.filter(i => i > 1));

// BAD: Syncing two state variables
let firstName = $state('');
let lastName = $state('');
let fullName = $state('');
$effect(() => {
  fullName = firstName + ' ' + lastName;
});
// GOOD: Derive it
let fullName = $derived(firstName + ' ' + lastName);
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.effect'
		},
		{
			type: 'text',
			content: `## Effect Lifecycle: When Effects Run

Understanding the timing of effects is essential for using them correctly:

1. **Initial run:** The effect runs once after the component is first mounted and the DOM is available. This is important — by the time your effect runs, the elements are in the DOM and you can safely query or manipulate them.

2. **Re-runs:** After the initial run, the effect re-runs whenever any reactive value it read during its *previous* execution changes. Note the emphasis on "previous execution" — dependencies are tracked dynamically at runtime, not statically at compile time. This means conditional reads are handled correctly:

\`\`\`svelte
$effect(() => {
  if (showDetails) {
    // 'details' is only tracked when showDetails is true
    console.log(details);
  }
});
\`\`\`

3. **Cleanup before re-run:** If the effect returns a function, that cleanup function runs *before* each re-run and when the component is destroyed. This gives you a clean lifecycle: setup, cleanup, setup, cleanup, ..., final cleanup.

4. **Destruction:** When the component is removed from the DOM, the cleanup function (if any) runs one final time.

### \`$effect.pre\` — Running Before DOM Updates

Standard \`$effect\` runs *after* the DOM has been updated. But sometimes you need to run logic *before* the DOM updates — for example, to measure the scroll position before new content is inserted, or to capture the previous state of a DOM element.

\`\`\`svelte
$effect.pre(() => {
  // This runs BEFORE the DOM is updated
  previousScrollHeight = container.scrollHeight;
});
\`\`\`

\`$effect.pre\` is a specialized tool for these DOM measurement scenarios. You will not need it often, but when you do, it is invaluable.

## Your First Effect

Look at the starter code. There is a \`count\` state variable, but no logging when it changes.

**Task:** Add a \`$effect\` that logs the current count to the console every time it changes.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Cleanup: Preventing Memory Leaks

Effects often set up resources that need to be cleaned up — intervals, event listeners, WebSocket connections, subscriptions. Without cleanup, these resources accumulate every time the effect re-runs, causing memory leaks and bizarre behavior (imagine ten intervals all firing simultaneously).

Return a cleanup function from your effect:

\`\`\`svelte
$effect(() => {
  const id = setInterval(() => { /* ... */ }, 1000);
  return () => clearInterval(id);
});
\`\`\`

The cleanup function runs in two situations:
- **Before the effect re-runs** — ensuring the old resource is torn down before the new one is created.
- **When the component is destroyed** — ensuring no orphaned resources remain.

Here is a more realistic example — listening for a keyboard shortcut that changes based on a reactive value:

\`\`\`svelte
let shortcutKey = $state('s');

$effect(() => {
  function handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === shortcutKey) {
      save();
    }
  }
  document.addEventListener('keydown', handleKeydown);
  return () => document.removeEventListener('keydown', handleKeydown);
});
\`\`\`

When \`shortcutKey\` changes, the old event listener (bound to the old key) is removed, and a new one (bound to the new key) is added. Without the cleanup function, you would accumulate event listeners every time the key changes.

### A Real-World Pattern: Auto-Saving Form with Debounce

Here is a practical pattern that combines effects with cleanup — an auto-saving form that debounces writes to avoid flooding the server:

\`\`\`svelte
let formData = $state({ title: '', body: '' });
let saveStatus = $state<'idle' | 'saving' | 'saved'>('idle');

$effect(() => {
  // Read formData to establish dependency
  const snapshot = $state.snapshot(formData);

  const timeoutId = setTimeout(async () => {
    saveStatus = 'saving';
    await fetch('/api/drafts', {
      method: 'POST',
      body: JSON.stringify(snapshot)
    });
    saveStatus = 'saved';
  }, 1000);

  return () => clearTimeout(timeoutId);
});
\`\`\`

Every time \`formData\` changes, the previous timeout is cleared (cleanup) and a new one starts. The save only fires if the user stops typing for one second. This is a perfect use case for \`$effect\` — it involves side effects (network requests) that cannot be expressed as a derivation.

**Task:** Add an effect that starts an interval and returns a cleanup function.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode to see how Svelte tracks which reactive values an effect reads. The compiler does not statically analyze dependencies — they are tracked at runtime by the signal system, so conditional reads are handled correctly. Notice in the compiled output that `$effect` compiles to a `user_effect` call that registers a callback with the reactive system.'
		},
		{
			type: 'text',
			content: `## \`$effect\` vs \`$derived\` — Know the Difference

A common mistake is using \`$effect\` to compute values. If you find yourself setting state inside an effect, you almost certainly want \`$derived\` instead:

\`\`\`svelte
// Bad — don't do this
let doubled = $state(0);
$effect(() => { doubled = count * 2; });

// Good — use $derived
let doubled = $derived(count * 2);
\`\`\`

The \`$derived\` version is:
- **Synchronous** — the value is always up-to-date when read, with no timing gaps.
- **Lazy** — it only recomputes when actually read, saving work when the value is not used.
- **Glitch-free** — there is no moment where \`doubled\` has a stale value while \`count\` has already been updated.
- **Simpler** — one line instead of three, and no extra \`$state\` variable to manage.

The rule of thumb: **if the output is a value, use \`$derived\`. If the output is an action (a side effect), use \`$effect\`.**

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
						{ type: 'contains', value: '$effect' },
						{ type: 'contains', value: 'console.log' }
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
