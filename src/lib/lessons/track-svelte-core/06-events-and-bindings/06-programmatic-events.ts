import type { Lesson } from '$types/lesson';

export const programmaticEvents: Lesson = {
	id: 'svelte-core.events-and-bindings.programmatic-events',
	slug: 'programmatic-events',
	title: 'Programmatic Events with svelte/events',
	description:
		'Use the on() function from svelte/events for programmatic event listeners with automatic cleanup, perfect for $effect blocks and third-party integrations.',
	trackId: 'svelte-core',
	moduleId: 'events-and-bindings',
	order: 6,
	estimatedMinutes: 16,
	concepts: ['svelte5.events.programmatic', 'svelte5.events.on-function', 'svelte5.events.effect-cleanup'],
	prerequisites: ['svelte5.events.element', 'svelte5.runes.effect'],

	content: [
		{
			type: 'text',
			content: `# Programmatic Events with svelte/events

## WHY Programmatic Event Listeners

Template event handlers (\`onclick\`, \`oninput\`, etc.) cover the majority of event handling needs in Svelte 5. But some scenarios require attaching event listeners programmatically -- that is, from JavaScript code rather than from the template. These scenarios include:

**Third-party library integration.** When you use a library that creates its own DOM elements (maps, charts, rich text editors), you cannot add \`onclick\` to those elements because they are not in your Svelte template. You need to call \`addEventListener\` on the DOM nodes the library creates.

**Window, document, and body events.** While Svelte provides \`<svelte:window>\` and \`<svelte:document>\` for common cases, sometimes you need more control -- like attaching a listener during a specific lifecycle phase, or conditionally based on state.

**Dynamic element references.** When you get a reference to a DOM element via \`bind:this\` or through a third-party API, and you need to listen for events on it, template handlers are not an option.

**Non-standard events.** Custom events from Web Components, \`ResizeObserver\` callbacks, \`IntersectionObserver\` entries -- these do not map to standard \`on*\` attributes and require programmatic attachment.

### The Problem with Raw addEventListener

You can always use \`addEventListener\` directly:

\`\`\`typescript
$effect(() => {
  const el = document.querySelector('.target');
  el?.addEventListener('click', handler);
  return () => el?.removeEventListener('click', handler);
});
\`\`\`

This works but has a boilerplate problem. Every listener needs a matching cleanup. If you forget the cleanup, you leak memory. If you add multiple listeners, the cleanup code doubles in size. The pattern is repetitive and error-prone.

### The on() Function

Svelte 5 provides a dedicated utility for this:

\`\`\`typescript
import { on } from 'svelte/events';
\`\`\`

The \`on()\` function wraps \`addEventListener\` and returns a cleanup function:

\`\`\`typescript
const off = on(element, 'click', handler);
// later...
off(); // removes the listener
\`\`\`

This is a simple API with significant ergonomic benefits. The cleanup function captures everything needed to remove the listener -- the element, the event name, and the handler reference. You do not need to keep all three in scope for later cleanup.

### Signature

\`\`\`typescript
function on<E extends Event>(
  element: EventTarget,
  event: string,
  handler: (event: E) => void,
  options?: AddEventListenerOptions
): () => void;
\`\`\`

The fourth parameter accepts the same options as \`addEventListener\`: \`capture\`, \`once\`, \`passive\`, and \`signal\`. The return value is always a function that removes the listener.

\`\`\`typescript
// With options
const off = on(element, 'scroll', handleScroll, { passive: true });

// Capture phase listener
const off = on(element, 'focus', handleFocus, { capture: true });

// One-time listener
const off = on(element, 'animationend', handleEnd, { once: true });
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'svelte5.events.programmatic'
		},
		{
			type: 'text',
			content: `## Using on() with $effect

The most common pattern is using \`on()\` inside a \`$effect\` block. When the effect re-runs or the component is destroyed, Svelte calls the effect's cleanup function. By returning the \`off()\` function from the effect, the listener is automatically removed:

\`\`\`svelte
<script lang="ts">
  import { on } from 'svelte/events';

  let container: HTMLDivElement;
  let scrollY = $state(0);

  $effect(() => {
    return on(container, 'scroll', (e) => {
      scrollY = container.scrollTop;
    }, { passive: true });
  });
</script>

<div bind:this={container} class="scrollable">
  <!-- content -->
</div>
<p>Scroll position: {scrollY}px</p>
\`\`\`

The effect runs once after mount (when \`container\` is available). It attaches a scroll listener and returns the cleanup function. When the component is destroyed, the effect cleanup runs and the listener is removed. Zero boilerplate beyond the \`on()\` call itself.

### Multiple Listeners in One Effect

You can attach multiple listeners in a single effect and combine their cleanup:

\`\`\`svelte
<script lang="ts">
  import { on } from 'svelte/events';

  let el: HTMLDivElement;

  $effect(() => {
    const offClick = on(el, 'click', handleClick);
    const offKeydown = on(el, 'keydown', handleKeydown);
    const offMouseenter = on(el, 'mouseenter', handleHover);

    return () => {
      offClick();
      offKeydown();
      offMouseenter();
    };
  });
</script>
\`\`\`

Each \`on()\` call returns its own cleanup function. The effect's return function calls all of them. This pattern scales cleanly to any number of listeners.

### Conditional Listeners

Because \`on()\` is just a function call, you can attach listeners conditionally:

\`\`\`svelte
<script lang="ts">
  import { on } from 'svelte/events';

  let isEnabled = $state(true);
  let el: HTMLDivElement;

  $effect(() => {
    if (isEnabled) {
      return on(el, 'click', handleClick);
    }
  });
</script>
\`\`\`

When \`isEnabled\` changes from true to false, the effect re-runs. The previous effect's cleanup removes the listener. The new effect execution skips the \`on()\` call because the condition is false. When \`isEnabled\` changes back to true, the effect re-runs and reattaches the listener.

This reactive conditional attachment is impossible with template event handlers -- \`onclick\` on an element is always active. With \`on()\` and \`$effect\`, you get fine-grained control over when listeners are active.

### on() with AbortController Pattern

For scenarios where you need to manage multiple event listeners as a group and tear them all down at once, you can combine \`on()\` with the \`AbortController\` pattern via the \`signal\` option:

\`\`\`svelte
<script lang="ts">
  import { on } from 'svelte/events';

  let container: HTMLDivElement;

  $effect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // All listeners share the same abort signal
    on(container, 'pointerdown', handlePointerDown, { signal });
    on(container, 'pointermove', handlePointerMove, { signal });
    on(container, 'pointerup', handlePointerUp, { signal });
    on(document, 'keydown', handleKeydown, { signal });
    on(window, 'blur', handleBlur, { signal });

    // Single abort tears down ALL listeners
    return () => controller.abort();
  });
</script>
\`\`\`

This pattern is especially valuable for complex interaction systems like drag-and-drop, drawing canvases, or multi-touch gesture handlers where you need five or more coordinated listeners. Instead of tracking five separate cleanup functions, one \`controller.abort()\` call removes everything.

Note that when you pass \`signal\` to \`on()\`, the \`signal\` is forwarded to the underlying \`addEventListener\` call. When the signal aborts, the browser automatically removes the listener. The cleanup function returned by \`on()\` still works independently, giving you two ways to remove the same listener.

**Task:** Create a component with a \`bind:this\` reference to a div. Use \`on()\` inside a \`$effect\` to attach a click listener that increments a counter. The listener should be automatically cleaned up.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Delegated vs Direct Event Listeners

Svelte 5 uses event delegation for template event handlers. Understanding the difference between delegated and direct listeners helps you make informed decisions about when to use \`on()\` vs template handlers.

### How Event Delegation Works in Svelte 5

When you write \`<button onclick={handleClick}>\`, Svelte does NOT attach a listener to the button element. Instead, it attaches a single listener to the document root that handles all click events via event bubbling. When any click occurs, the document-level listener checks which element was clicked and calls the appropriate handler.

This is a performance optimization. Instead of 1,000 \`addEventListener\` calls for 1,000 list items, Svelte makes one call on the document. This reduces memory usage and speeds up initial rendering.

### When on() Bypasses Delegation

The \`on()\` function from \`svelte/events\` always creates a direct \`addEventListener\` call on the specified element. It does NOT use delegation. This means:

1. **The listener fires in the correct order.** Delegated listeners fire during the bubbling phase after all direct listeners. If event ordering matters (e.g., you need to call \`stopPropagation()\` before a delegated handler runs), a direct listener via \`on()\` gives you control.

2. **\`stopPropagation()\` works as expected.** A direct listener that calls \`event.stopPropagation()\` prevents the event from reaching the delegated document listener. But a delegated handler calling \`stopPropagation()\` cannot prevent another delegated handler from firing because they both run at the document level.

3. **Non-bubbling events work.** Events like \`focus\`, \`blur\`, \`scroll\`, \`load\`, and \`error\` do not bubble. Svelte handles \`focus\` and \`blur\` template handlers via \`focusin\` and \`focusout\` (which do bubble), but for \`scroll\` on a specific element, you need \`on()\` or the \`{ capture: true }\` option.

### Comparison with Template Event Handlers

Template handlers should be your default. They are:
- **Declarative**: the event is visible in the template where the element is defined
- **Optimized**: the compiler uses event delegation for common events
- **Type-safe**: TypeScript infers the event type from the element type
- **Zero-boilerplate**: no imports, no effect wrappers, no cleanup

### on(): The Escape Hatch

\`\`\`typescript
import { on } from 'svelte/events';

$effect(() => {
  return on(thirdPartyElement, 'custom-event', handler);
});
\`\`\`

Use \`on()\` when:
- The target element is not in your template (third-party DOM)
- You need \`addEventListener\` options (\`capture\`, \`passive\`, \`once\`)
- You need conditional listener attachment based on reactive state
- You are listening on \`window\` or \`document\` from an effect
- The event is a non-standard or custom event
- You need precise control over event phase ordering

### Decision Tree

1. Is the element in your Svelte template? Use template handler (\`onclick\`).
2. Do you need \`{ passive: true }\` or \`{ capture: true }\`? Use \`on()\`.
3. Is the element created by a third-party library? Use \`on()\`.
4. Do you need to conditionally attach/detach the listener? Use \`on()\` in \`$effect\`.
5. Is it a custom event name? Use \`on()\`.
6. Otherwise, use the template handler.

### Performance Implications

Template handlers benefit from Svelte's event delegation system. A single document-level listener handles all click events, for example. The \`on()\` function creates a real \`addEventListener\` call per invocation -- no delegation. For most applications this difference is negligible, but in a list of 10,000 items, using template handlers is noticeably more efficient than calling \`on()\` for each item.`
		},
		{
			type: 'xray-prompt',
			content: 'Import { on } from "svelte/events" and look at its implementation. How does it handle the cleanup function? Compare the generated code for an onclick template handler with an on() call inside $effect. Which one produces more runtime code? What happens when you pass { once: true } to on() -- does the off() function still work after the event fires once?'
		},
		{
			type: 'text',
			content: `## Real-World Pattern: IntersectionObserver with on()

A practical use of \`on()\` is building a lazy-loading image component that uses the Intersection Observer API. While Intersection Observer is not strictly an event listener, the pattern of setup-and-cleanup is identical, and \`on()\` can be combined with observer patterns in an effect.

Here is the approach:

1. Create an \`$effect\` that sets up an \`IntersectionObserver\`
2. Use \`on()\` to listen for the \`load\` event on the image once it enters the viewport
3. Clean up both the observer and the event listener when the component is destroyed

\`\`\`svelte
<script lang="ts">
  import { on } from 'svelte/events';

  interface Props {
    src: string;
    alt: string;
    placeholder?: string;
  }

  let { src, alt, placeholder = '/placeholder.svg' }: Props = $props();

  let imgEl: HTMLImageElement;
  let isLoaded = $state(false);
  let isInView = $state(false);

  $effect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          isInView = true;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imgEl);
    return () => observer.disconnect();
  });

  $effect(() => {
    if (isInView && imgEl) {
      return on(imgEl, 'load', () => {
        isLoaded = true;
      }, { once: true });
    }
  });
</script>

<img
  bind:this={imgEl}
  src={isInView ? src : placeholder}
  {alt}
  class:loaded={isLoaded}
/>

<style>
  img {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  img.loaded {
    opacity: 1;
  }
</style>
\`\`\`

### Why on() Matters Here

The \`load\` event on an image fires once. Using \`on()\` with \`{ once: true }\` ensures the listener is automatically removed after firing. But more importantly, if the component is destroyed before the image loads (the user scrolls away quickly), the effect cleanup calls \`off()\`, preventing a state update on an unmounted component.

Without \`on()\`, you would need:

\`\`\`typescript
$effect(() => {
  if (isInView && imgEl) {
    const handler = () => { isLoaded = true; };
    imgEl.addEventListener('load', handler, { once: true });
    return () => imgEl.removeEventListener('load', handler);
  }
});
\`\`\`

The \`on()\` version is shorter and communicates intent more clearly.

### Extended IntersectionObserver: Infinite Scroll

Here is a more complete real-world example -- an infinite scroll component that loads more items when a sentinel element enters the viewport, combining \`IntersectionObserver\` with \`on()\` for scroll position tracking:

\`\`\`svelte
<script lang="ts">
  import { on } from 'svelte/events';

  interface Props {
    onLoadMore: () => Promise<void>;
    threshold?: number;
  }

  let { onLoadMore, threshold = 0.5 }: Props = $props();

  let sentinel: HTMLDivElement;
  let scrollContainer: HTMLDivElement;
  let isLoading = $state(false);
  let scrollPosition = $state(0);

  // Track scroll position with on() for passive listening
  $effect(() => {
    return on(scrollContainer, 'scroll', () => {
      scrollPosition = scrollContainer.scrollTop;
    }, { passive: true });
  });

  // Observe sentinel for triggering loads
  $effect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          isLoading = true;
          try {
            await onLoadMore();
          } finally {
            isLoading = false;
          }
        }
      },
      { root: scrollContainer, threshold }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  });
</script>

<div bind:this={scrollContainer} class="scroll-container">
  <slot />
  <div bind:this={sentinel} class="sentinel">
    {#if isLoading}
      <p>Loading more...</p>
    {/if}
  </div>
</div>
\`\`\`

This pattern separates concerns cleanly: \`IntersectionObserver\` handles the "when to load" logic, while \`on()\` handles the scroll position tracking with \`{ passive: true }\` for optimal scroll performance.

**Task:** Build a lazy-loading component using \`IntersectionObserver\` and \`on()\` from \`svelte/events\`. The component should display a placeholder until the element enters the viewport, then load the real content and listen for the load event using \`on()\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Advanced: Combining on() with Third-Party Libraries

When integrating third-party libraries that create their own DOM, \`on()\` is indispensable. Consider a map library integration:

\`\`\`svelte
<script lang="ts">
  import { on } from 'svelte/events';

  let mapContainer: HTMLDivElement;

  $effect(() => {
    // Third-party library creates its own DOM inside the container
    const map = new MapLibrary(mapContainer, { zoom: 12 });

    // The map library creates a canvas element we need to listen to
    const canvas = mapContainer.querySelector('canvas');
    if (canvas) {
      const offClick = on(canvas, 'click', (e: MouseEvent) => {
        const coords = map.pixelToLatLng(e.offsetX, e.offsetY);
        console.log('Clicked at:', coords);
      });

      const offWheel = on(canvas, 'wheel', (e) => {
        e.preventDefault();
        map.zoom(e.deltaY > 0 ? -1 : 1);
      }, { passive: false });

      return () => {
        offClick();
        offWheel();
        map.destroy();
      };
    }

    return () => map.destroy();
  });
</script>

<div bind:this={mapContainer} class="map"></div>
\`\`\`

Notice the \`{ passive: false }\` option on the wheel listener. This is necessary because we call \`preventDefault()\` on the wheel event. Passive listeners cannot call \`preventDefault()\` -- the browser ignores the call and logs a warning. This is one of those cases where the \`options\` parameter on \`on()\` is essential and template handlers cannot help you.

### Window and Document Events

For global events, \`on()\` provides a clean alternative to \`<svelte:window>\`:

\`\`\`svelte
<script lang="ts">
  import { on } from 'svelte/events';

  let isOnline = $state(navigator.onLine);

  $effect(() => {
    const offOnline = on(window, 'online', () => { isOnline = true; });
    const offOffline = on(window, 'offline', () => { isOnline = false; });

    return () => {
      offOnline();
      offOffline();
    };
  });
</script>
\`\`\`

While \`<svelte:window on:online>\` would work in Svelte 4, the Svelte 5 template equivalent is \`<svelte:window ononline={...}>\`. But \`on()\` is preferable when you want the listener scoped to a specific effect lifecycle or when you need the options parameter.

### Keyboard Shortcuts

A common pattern is implementing keyboard shortcuts that only activate when a certain condition is met:

\`\`\`svelte
<script lang="ts">
  import { on } from 'svelte/events';

  let isModalOpen = $state(false);

  $effect(() => {
    if (isModalOpen) {
      return on(document, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          isModalOpen = false;
        }
      });
    }
  });
</script>
\`\`\`

The keydown listener is only active when the modal is open. When \`isModalOpen\` becomes false, the effect re-runs and the previous cleanup removes the listener. This prevents keyboard shortcuts from firing when they should not be active.

### Integration with {@attach} Actions

Svelte 5 introduces the \`{@attach}\` directive (replacing Svelte 4's \`use:\`) for reusable element behaviors. Actions and \`on()\` serve complementary roles:

\`\`\`svelte
<script lang="ts">
  import { on } from 'svelte/events';
  import type { Action } from 'svelte/action';

  // An action that uses on() internally
  const longpress: Action<HTMLElement, number> = (node, duration = 500) => {
    let timer: ReturnType<typeof setTimeout>;

    const offPointerDown = on(node, 'pointerdown', () => {
      timer = setTimeout(() => {
        node.dispatchEvent(new CustomEvent('longpress'));
      }, duration);
    });

    const offPointerUp = on(node, 'pointerup', () => {
      clearTimeout(timer);
    });

    return {
      destroy() {
        offPointerDown();
        offPointerUp();
        clearTimeout(timer);
      }
    };
  };
</script>

<button use:longpress={800} onlongpress={() => alert('Long pressed!')}>
  Hold me
</button>
\`\`\`

Inside an action, \`on()\` is the natural choice for attaching listeners because you have a reference to the DOM node but no template syntax available. The action's \`destroy\` callback calls the cleanup functions returned by \`on()\`.

This pattern -- using \`on()\` inside actions and \`$effect\` blocks while using template handlers for everything else -- gives you the best of both worlds: declarative template handlers for simple cases and programmatic \`on()\` for complex integration scenarios.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.events.on-function'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { on } from 'svelte/events';

  let box: HTMLDivElement;
  let clickCount = $state(0);
  let isInView = $state(false);
  let imageLoaded = $state(false);

  let imgSrc = 'https://picsum.photos/400/300';
  let placeholderSrc = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23e5e7eb" width="400" height="300"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="system-ui" font-size="18">Loading...</text></svg>';

  // TODO: Use $effect with on() to:
  // 1. Attach a click listener to the box div that increments clickCount
  // 2. Set up an IntersectionObserver for lazy loading
  // 3. Listen for the image 'load' event using on() when isInView becomes true
</script>

<div class="container">
  <section>
    <h2>Programmatic Click Counter</h2>
    <div bind:this={box} class="click-box">
      Click this box! Count: {clickCount}
    </div>
  </section>

  <div class="spacer">
    <p>Scroll down to see lazy loading in action</p>
  </div>

  <section>
    <h2>Lazy Loaded Image</h2>
    <img
      src={isInView ? imgSrc : placeholderSrc}
      alt="Random landscape"
      class:loaded={imageLoaded}
    />
    <p>
      {#if !isInView}
        Image not yet in viewport
      {:else if !imageLoaded}
        Loading image...
      {:else}
        Image loaded!
      {/if}
    </p>
  </section>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .click-box {
    padding: 2rem;
    background: #eef2ff;
    border: 2px dashed #6366f1;
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    user-select: none;
    font-size: 1.125rem;
  }

  .click-box:active {
    background: #c7d2fe;
  }

  .spacer {
    height: 120vh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
  }

  img {
    width: 100%;
    max-width: 400px;
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  img.loaded {
    opacity: 1;
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
  import { on } from 'svelte/events';

  let box: HTMLDivElement;
  let clickCount = $state(0);
  let isInView = $state(false);
  let imageLoaded = $state(false);

  let imgEl: HTMLImageElement;
  let imgSrc = 'https://picsum.photos/400/300';
  let placeholderSrc = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23e5e7eb" width="400" height="300"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="system-ui" font-size="18">Loading...</text></svg>';

  $effect(() => {
    return on(box, 'click', () => {
      clickCount += 1;
    });
  });

  $effect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          isInView = true;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(imgEl);
    return () => observer.disconnect();
  });

  $effect(() => {
    if (isInView && imgEl) {
      return on(imgEl, 'load', () => {
        imageLoaded = true;
      }, { once: true });
    }
  });
</script>

<div class="container">
  <section>
    <h2>Programmatic Click Counter</h2>
    <div bind:this={box} class="click-box">
      Click this box! Count: {clickCount}
    </div>
  </section>

  <div class="spacer">
    <p>Scroll down to see lazy loading in action</p>
  </div>

  <section>
    <h2>Lazy Loaded Image</h2>
    <img
      bind:this={imgEl}
      src={isInView ? imgSrc : placeholderSrc}
      alt="Random landscape"
      class:loaded={imageLoaded}
    />
    <p>
      {#if !isInView}
        Image not yet in viewport
      {:else if !imageLoaded}
        Loading image...
      {:else}
        Image loaded!
      {/if}
    </p>
  </section>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .click-box {
    padding: 2rem;
    background: #eef2ff;
    border: 2px dashed #6366f1;
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    user-select: none;
    font-size: 1.125rem;
  }

  .click-box:active {
    background: #c7d2fe;
  }

  .spacer {
    height: 120vh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
  }

  img {
    width: 100%;
    max-width: 400px;
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  img.loaded {
    opacity: 1;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use on() from svelte/events inside $effect to attach a click listener to the box',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: "import { on } from 'svelte/events'" },
						{ type: 'contains', value: "on(box, 'click'" }
					]
				}
			},
			hints: [
				'Import `on` from `svelte/events` at the top of your script block.',
				'Inside a `$effect(() => { ... })`, call `on(box, \'click\', () => { clickCount += 1; })` and return its result for automatic cleanup.',
				'The full pattern is: `$effect(() => { return on(box, \'click\', () => { clickCount += 1; }); });` -- returning the off() function ensures the listener is removed when the effect cleans up.'
			],
			conceptsTested: ['svelte5.events.programmatic', 'svelte5.events.on-function']
		},
		{
			id: 'cp-2',
			description: 'Implement lazy loading with IntersectionObserver and on() for the load event',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'IntersectionObserver' },
						{ type: 'contains', value: "'load'" }
					]
				}
			},
			hints: [
				'Create an `$effect` that sets up `new IntersectionObserver(...)`, observes the image element, and returns a cleanup function that calls `observer.disconnect()`.',
				'Add `bind:this={imgEl}` to the img element and create a second `$effect` that runs `on(imgEl, \'load\', ...)` when `isInView` is true.',
				'Use two effects: one for the IntersectionObserver (`observer.observe(imgEl); return () => observer.disconnect();`) and one for the load event (`if (isInView && imgEl) { return on(imgEl, \'load\', () => { imageLoaded = true; }, { once: true }); }`).'
			],
			conceptsTested: ['svelte5.events.programmatic', 'svelte5.events.effect-cleanup']
		}
	]
};
