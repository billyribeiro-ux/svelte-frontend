import type { Lesson } from '$types/lesson';

export const componentTesting: Lesson = {
	id: 'sveltekit.testing.component-testing',
	slug: 'component-testing',
	title: 'Testing Svelte Components',
	description: 'Write robust component tests with Vitest and @testing-library/svelte for Svelte 5 components in SvelteKit.',
	trackId: 'sveltekit',
	moduleId: 'testing',
	order: 1,
	estimatedMinutes: 20,
	concepts: ['sveltekit.testing.component-testing', 'sveltekit.testing.vitest-setup'],
	prerequisites: ['sveltekit.loading.server'],

	content: [
		{
			type: 'text',
			content: `# Testing Svelte Components

## Why Component Testing Matters

You have built a Svelte 5 component. It renders correctly when you look at it in the browser. You click around, everything works. Ship it?

Not yet. Manual testing catches what you think to test. It misses everything else. It does not catch regressions -- when a change in one part of the codebase breaks another. It does not catch edge cases -- when the component receives unexpected props, when a network request fails, when the user double-clicks a submit button.

Component testing automates the verification of your UI. You write code that renders a component, simulates user interactions, and asserts that the output matches expectations. These tests run in milliseconds, can be executed on every commit, and catch regressions before they reach users.

For SvelteKit applications, component testing verifies that:
- Components render correctly with given props
- User interactions (clicks, typing, form submissions) produce the expected results
- Reactive state updates ($state, $derived) propagate correctly to the DOM
- Components integrate properly with SvelteKit's context (navigation, page data)

## Setting Up Vitest for Svelte 5

SvelteKit projects created with \`npx sv create\` can include Vitest automatically. If you need to add it manually:

\`\`\`bash
npm install -D vitest @testing-library/svelte @testing-library/jest-dom jsdom
\`\`\`

Configure Vitest in your \`vite.config.ts\`:

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts']
  }
});
\`\`\`

Create the setup file to extend Vitest with DOM matchers:

\`\`\`typescript
// src/tests/setup.ts
import '@testing-library/jest-dom/vitest';
\`\`\`

This adds matchers like \`toBeInTheDocument()\`, \`toHaveTextContent()\`, \`toBeVisible()\`, and \`toBeDisabled()\` to your test assertions.

## The Testing Library Philosophy

\`@testing-library/svelte\` follows a principle: **test the component the way a user would use it.** This means:

- Query elements by their accessible role, label text, or visible text -- not by CSS classes, IDs, or component internals
- Interact with elements through user-facing APIs (click, type, select) -- not by directly mutating state
- Assert on visible output -- not on internal state variables

This approach produces tests that are resilient to refactoring. If you rename a CSS class, restructure your markup, or change internal state names, the tests still pass as long as the user-facing behavior is unchanged.

## render() -- Mounting Components

The \`render\` function mounts a Svelte component into a test DOM:

\`\`\`typescript
import { render } from '@testing-library/svelte';
import Counter from './Counter.svelte';

test('renders with initial count', () => {
  const { getByText } = render(Counter, { props: { initialCount: 5 } });
  expect(getByText('Count: 5')).toBeInTheDocument();
});
\`\`\`

\`render\` returns an object with query functions bound to the rendered component's container. You can also use the global \`screen\` object, which queries the entire document:

\`\`\`typescript
import { render, screen } from '@testing-library/svelte';
import Counter from './Counter.svelte';

test('renders with initial count', () => {
  render(Counter, { props: { initialCount: 5 } });
  expect(screen.getByText('Count: 5')).toBeInTheDocument();
});
\`\`\`

For Svelte 5 components that use \`$props()\`, pass props in the \`props\` key:

\`\`\`typescript
// Component: let { name, age } = $props();
render(UserCard, { props: { name: 'Alice', age: 30 } });
\`\`\`

## Screen Queries -- Finding Elements

Testing Library provides several query types, each with different behavior when the element is not found:

**\`getBy*\`** -- Returns the element or throws immediately if not found. Use for elements that should be present.
\`\`\`typescript
screen.getByRole('button', { name: 'Submit' });  // Throws if missing
screen.getByText('Welcome');                       // Throws if missing
screen.getByLabelText('Email');                    // Throws if missing
\`\`\`

**\`queryBy*\`** -- Returns the element or \`null\` if not found. Use when asserting an element is NOT present.
\`\`\`typescript
expect(screen.queryByText('Error')).not.toBeInTheDocument();
\`\`\`

**\`findBy*\`** -- Returns a Promise that resolves when the element appears (with a timeout). Use for elements that appear asynchronously.
\`\`\`typescript
const message = await screen.findByText('Data loaded');
expect(message).toBeInTheDocument();
\`\`\`

The query suffix determines what you search by:

| Suffix | Searches by | Example |
|---|---|---|
| \`ByRole\` | ARIA role | \`getByRole('button')\` |
| \`ByText\` | Visible text content | \`getByText('Submit')\` |
| \`ByLabelText\` | Form label text | \`getByLabelText('Email')\` |
| \`ByPlaceholderText\` | Input placeholder | \`getByPlaceholderText('Search...')\` |
| \`ByAltText\` | Image alt text | \`getByAltText('Profile photo')\` |
| \`ByTestId\` | data-testid attribute | \`getByTestId('custom-element')\` |

**Priority order:** Prefer \`ByRole\` > \`ByLabelText\` > \`ByText\` > \`ByTestId\`. The more accessible the query, the better the test.

## fireEvent and User Interactions

\`fireEvent\` dispatches DOM events to simulate user interaction:

\`\`\`typescript
import { render, screen, fireEvent } from '@testing-library/svelte';
import Counter from './Counter.svelte';

test('increments count on button click', async () => {
  render(Counter, { props: { initialCount: 0 } });

  const button = screen.getByRole('button', { name: 'Increment' });
  await fireEvent.click(button);

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
\`\`\`

Common events:

\`\`\`typescript
await fireEvent.click(element);                    // Mouse click
await fireEvent.input(input, { target: { value: 'hello' } }); // Input change
await fireEvent.submit(form);                      // Form submission
await fireEvent.keyDown(element, { key: 'Enter' }); // Keyboard
await fireEvent.change(select, { target: { value: 'option2' } }); // Select
\`\`\`

**Important for Svelte 5:** After firing events that trigger reactive state updates, the DOM updates asynchronously. Use \`await\` with \`fireEvent\` or use \`waitFor\` to wait for the DOM to reflect changes:

\`\`\`typescript
import { waitFor } from '@testing-library/svelte';

await fireEvent.click(button);
await waitFor(() => {
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
\`\`\`

## Testing Reactive State Changes

Svelte 5's reactivity system (\`$state\`, \`$derived\`) means that state changes propagate asynchronously to the DOM. Your tests must account for this:

\`\`\`typescript
test('derived state updates when input changes', async () => {
  render(TemperatureConverter);

  const celsiusInput = screen.getByLabelText('Celsius');
  await fireEvent.input(celsiusInput, { target: { value: '100' } });

  await waitFor(() => {
    expect(screen.getByText('212°F')).toBeInTheDocument();
  });
});
\`\`\`

For components that use \`$effect\` to perform side effects, you may need to wait for those effects to complete:

\`\`\`typescript
test('effect runs after state change', async () => {
  render(AutoSaveForm);

  const input = screen.getByLabelText('Title');
  await fireEvent.input(input, { target: { value: 'New title' } });

  // Wait for the $effect that shows a "Saved" indicator
  const saved = await screen.findByText('Saved');
  expect(saved).toBeInTheDocument();
});
\`\`\`

## Testing Component Props and Events

Test that components respond correctly to different prop values:

\`\`\`typescript
test('renders disabled state', () => {
  render(Button, { props: { disabled: true, label: 'Submit' } });
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
});

test('renders enabled state', () => {
  render(Button, { props: { disabled: false, label: 'Submit' } });
  expect(screen.getByRole('button', { name: 'Submit' })).not.toBeDisabled();
});
\`\`\`

For testing callback props (the Svelte 5 pattern of passing functions as props instead of dispatching events):

\`\`\`typescript
import { vi } from 'vitest';

test('calls onclick callback when clicked', async () => {
  const handleClick = vi.fn();
  render(Button, { props: { label: 'Click me', onclick: handleClick } });

  await fireEvent.click(screen.getByRole('button', { name: 'Click me' }));

  expect(handleClick).toHaveBeenCalledOnce();
});
\`\`\`

## Mocking $app/navigation and $app/state

SvelteKit modules like \`$app/navigation\` and \`$app/state\` are not available in the test environment. You must mock them:

\`\`\`typescript
import { vi } from 'vitest';

// Mock $app/navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  invalidate: vi.fn(),
  invalidateAll: vi.fn(),
  preloadData: vi.fn(),
  preloadCode: vi.fn(),
  pushState: vi.fn(),
  replaceState: vi.fn()
}));

// Mock $app/state
vi.mock('$app/state', () => ({
  page: {
    url: new URL('http://localhost/test'),
    params: {},
    route: { id: '/test' },
    status: 200,
    error: null,
    data: {},
    state: {}
  }
}));
\`\`\`

Then in your tests, you can assert that navigation functions were called:

\`\`\`typescript
import { goto } from '$app/navigation';

test('navigates to dashboard after login', async () => {
  render(LoginForm);

  await fireEvent.input(screen.getByLabelText('Email'), {
    target: { value: 'user@example.com' }
  });
  await fireEvent.input(screen.getByLabelText('Password'), {
    target: { value: 'password123' }
  });
  await fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

  expect(goto).toHaveBeenCalledWith('/dashboard');
});
\`\`\`

## Testing with Context

Some Svelte components rely on Svelte's \`getContext\` / \`setContext\`. To provide context in tests, wrap the component:

\`\`\`typescript
import { render } from '@testing-library/svelte';
import { setContext } from 'svelte';

// Create a wrapper component that provides context
// TestWrapper.svelte:
// <script>
//   import { setContext } from 'svelte';
//   let { children, contextValue } = $props();
//   setContext('myKey', contextValue);
// </script>
// {@render children()}

import TestWrapper from './TestWrapper.svelte';

test('component uses context', () => {
  render(TestWrapper, {
    props: {
      contextValue: { user: { name: 'Alice' } },
      // Pass the target component as a snippet or child
    }
  });
});
\`\`\`

Alternatively, mock \`getContext\` directly using Vitest:

\`\`\`typescript
vi.mock('svelte', async () => {
  const actual = await vi.importActual('svelte');
  return {
    ...actual,
    getContext: vi.fn((key: string) => {
      if (key === 'user') return { name: 'Alice', role: 'admin' };
      return undefined;
    })
  };
});
\`\`\`

## Structuring Test Files

Place test files alongside the components they test:

\`\`\`
src/lib/components/
  Counter.svelte
  Counter.test.ts
  Button.svelte
  Button.test.ts
\`\`\`

Or in a parallel \`__tests__\` directory:

\`\`\`
src/lib/components/
  Counter.svelte
  Button.svelte
  __tests__/
    Counter.test.ts
    Button.test.ts
\`\`\`

Both patterns work. Co-location (first pattern) is more common in the Svelte ecosystem because it keeps related files together and is easier to maintain.

Run tests with:

\`\`\`bash
npx vitest         # Watch mode (re-runs on changes)
npx vitest run     # Single run (CI/CD)
npx vitest --ui    # Visual UI
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.testing.component-testing'
		},
		{
			type: 'text',
			content: `## Exercise: Test a Counter Component

You are given a Counter component with increment, decrement, and reset functionality. Write tests to verify its behavior using Vitest and Testing Library.

**Your task:**
1. Test that the counter renders with the initial count
2. Test that clicking increment increases the count
3. Test that clicking decrement decreases the count`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Testing Edge Cases and Callbacks

Now test the counter's edge cases: the reset button and the \`onchange\` callback prop.

**Task:** Write tests for the reset button returning to the initial count, and verify that the \`onchange\` callback is called with the new count value after each interaction.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: `Why does Testing Library recommend querying by role instead of by test ID or CSS class? How does this approach improve both test quality and component accessibility? What are the tradeoffs of testing user-facing behavior vs internal state in Svelte 5 components?`
		},
		{
			type: 'text',
			content: `## Summary

Component testing with Vitest and \`@testing-library/svelte\` verifies that your Svelte 5 components behave correctly from a user's perspective. Use \`render\` to mount components, \`screen\` queries to find elements by accessible roles and text, \`fireEvent\` to simulate interactions, and \`waitFor\` to handle asynchronous reactivity updates. Mock SvelteKit modules (\`$app/navigation\`, \`$app/state\`) to test components that depend on the framework. Structure tests alongside components, prefer accessible queries, and test behavior rather than implementation details. The result is a test suite that catches regressions, survives refactoring, and runs in milliseconds.`
		}
	],

	starterFiles: [
		{
			name: 'Counter.svelte',
			path: '/src/lib/components/Counter.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { initialCount = 0, onchange }: {
    initialCount?: number;
    onchange?: (count: number) => void;
  } = $props();

  let count = $state(initialCount);

  function increment() {
    count++;
    onchange?.(count);
  }

  function decrement() {
    count--;
    onchange?.(count);
  }

  function reset() {
    count = initialCount;
    onchange?.(count);
  }
</script>

<div class="counter">
  <p>Count: {count}</p>
  <button onclick={decrement}>Decrement</button>
  <button onclick={increment}>Increment</button>
  <button onclick={reset}>Reset</button>
</div>`
		},
		{
			name: 'Counter.test.ts',
			path: '/src/lib/components/Counter.test.ts',
			language: 'typescript',
			content: `import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Counter from './Counter.svelte';

describe('Counter', () => {
  // TODO: Test that counter renders with initial count
  test('renders with default initial count of 0', () => {
    // render(Counter);
    // expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });

  // TODO: Test that clicking increment increases the count
  test('increments count on button click', async () => {
    // render(Counter);
    // const button = screen.getByRole('button', { name: 'Increment' });
    // await fireEvent.click(button);
    // expect ...
  });

  // TODO: Test that clicking decrement decreases the count
  test('decrements count on button click', async () => {

  });

  // TODO: Test that reset returns to initial count
  test('resets to initial count', async () => {

  });

  // TODO: Test that onchange callback is called
  test('calls onchange with new count', async () => {

  });
});`
		}
	],

	solutionFiles: [
		{
			name: 'Counter.svelte',
			path: '/src/lib/components/Counter.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { initialCount = 0, onchange }: {
    initialCount?: number;
    onchange?: (count: number) => void;
  } = $props();

  let count = $state(initialCount);

  function increment() {
    count++;
    onchange?.(count);
  }

  function decrement() {
    count--;
    onchange?.(count);
  }

  function reset() {
    count = initialCount;
    onchange?.(count);
  }
</script>

<div class="counter">
  <p>Count: {count}</p>
  <button onclick={decrement}>Decrement</button>
  <button onclick={increment}>Increment</button>
  <button onclick={reset}>Reset</button>
</div>`
		},
		{
			name: 'Counter.test.ts',
			path: '/src/lib/components/Counter.test.ts',
			language: 'typescript',
			content: `import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import Counter from './Counter.svelte';

describe('Counter', () => {
  test('renders with default initial count of 0', () => {
    render(Counter);
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });

  test('renders with custom initial count', () => {
    render(Counter, { props: { initialCount: 10 } });
    expect(screen.getByText('Count: 10')).toBeInTheDocument();
  });

  test('increments count on button click', async () => {
    render(Counter, { props: { initialCount: 0 } });
    const button = screen.getByRole('button', { name: 'Increment' });

    await fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Count: 1')).toBeInTheDocument();
    });
  });

  test('decrements count on button click', async () => {
    render(Counter, { props: { initialCount: 5 } });
    const button = screen.getByRole('button', { name: 'Decrement' });

    await fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Count: 4')).toBeInTheDocument();
    });
  });

  test('resets to initial count', async () => {
    render(Counter, { props: { initialCount: 3 } });

    const increment = screen.getByRole('button', { name: 'Increment' });
    await fireEvent.click(increment);
    await fireEvent.click(increment);

    await waitFor(() => {
      expect(screen.getByText('Count: 5')).toBeInTheDocument();
    });

    const reset = screen.getByRole('button', { name: 'Reset' });
    await fireEvent.click(reset);

    await waitFor(() => {
      expect(screen.getByText('Count: 3')).toBeInTheDocument();
    });
  });

  test('calls onchange with new count on increment', async () => {
    const handleChange = vi.fn();
    render(Counter, { props: { initialCount: 0, onchange: handleChange } });

    await fireEvent.click(screen.getByRole('button', { name: 'Increment' }));
    expect(handleChange).toHaveBeenCalledWith(1);

    await fireEvent.click(screen.getByRole('button', { name: 'Increment' }));
    expect(handleChange).toHaveBeenCalledWith(2);

    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  test('calls onchange with new count on decrement', async () => {
    const handleChange = vi.fn();
    render(Counter, { props: { initialCount: 5, onchange: handleChange } });

    await fireEvent.click(screen.getByRole('button', { name: 'Decrement' }));
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  test('calls onchange with initial count on reset', async () => {
    const handleChange = vi.fn();
    render(Counter, { props: { initialCount: 3, onchange: handleChange } });

    await fireEvent.click(screen.getByRole('button', { name: 'Increment' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(handleChange).toHaveBeenLastCalledWith(3);
  });
});`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Write tests for render, increment, and decrement',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'render(Counter' },
						{ type: 'contains', value: 'fireEvent.click' },
						{ type: 'contains', value: 'toBeInTheDocument' }
					]
				}
			},
			hints: [
				'Use `render(Counter)` or `render(Counter, { props: { initialCount: 5 } })` to mount the component.',
				'Find the increment button with `screen.getByRole("button", { name: "Increment" })` and click it with `await fireEvent.click(button)`.',
				'After clicking, use `await waitFor(() => { expect(screen.getByText("Count: 1")).toBeInTheDocument(); })` to verify the DOM updated.'
			],
			conceptsTested: ['sveltekit.testing.component-testing']
		},
		{
			id: 'cp-2',
			description: 'Test reset functionality and onchange callback',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'vi.fn()' },
						{ type: 'contains', value: 'toHaveBeenCalledWith' },
						{ type: 'contains', value: 'Reset' }
					]
				}
			},
			hints: [
				'Create a mock function with `const handleChange = vi.fn()` and pass it as the `onchange` prop.',
				'After clicking increment, assert `expect(handleChange).toHaveBeenCalledWith(1)` to verify the callback received the new count.',
				'For reset, first increment a few times, then click Reset and verify the count text shows the initial value again.'
			],
			conceptsTested: ['sveltekit.testing.vitest-setup']
		}
	]
};
