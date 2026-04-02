import type { Lesson } from '$types/lesson';

export const styleDirective: Lesson = {
	id: 'svelte-core.events-and-bindings.style-directive',
	slug: 'style-directive',
	title: 'Dynamic Styles & Custom Properties',
	description:
		'Use the style: directive for reactive inline styles, CSS custom properties for theming, and component style props for powerful design APIs.',
	trackId: 'svelte-core',
	moduleId: 'events-and-bindings',
	order: 5,
	estimatedMinutes: 15,
	concepts: ['svelte5.style.directive', 'svelte5.style.custom-properties', 'svelte5.style.component-props'],
	prerequisites: ['svelte5.events.element', 'svelte5.runes.state'],

	content: [
		{
			type: 'text',
			content: `# Dynamic Styles & Custom Properties

## WHY style: Over Inline Style Strings

Before the \`style:\` directive, dynamic styles in Svelte looked like this:

\`\`\`svelte
<div style="color: {textColor}; font-size: {fontSize}px; background: {bg}">
\`\`\`

This works, but it has real problems. The entire style string is rebuilt whenever any of the interpolated values change. If \`textColor\` changes but \`fontSize\` and \`bg\` do not, Svelte still reconstructs the full string and applies it. There is no granularity -- it is all or nothing.

Worse, the string approach is error-prone. Missing semicolons, typos in property names, and incorrect units are all invisible to the compiler and to TypeScript. You get no autocompletion, no type checking, and no compile-time validation. A typo like \`fontt-size\` silently produces broken CSS.

### The style: Directive

Svelte's \`style:\` directive solves these problems:

\`\`\`svelte
<div style:color={textColor} style:font-size="{fontSize}px" style:background={bg}>
\`\`\`

Each property is declared independently. When \`textColor\` changes, only the \`color\` property is updated on the DOM element. The other properties are left untouched. This is more efficient because Svelte can call \`element.style.setProperty('color', newValue)\` instead of replacing the entire \`style\` attribute.

### Key Benefits

**Reactive granularity.** Each \`style:\` directive is its own reactive dependency. Only the properties whose values actually change are updated in the DOM.

**Type safety.** The Svelte compiler understands CSS property names. While it does not yet provide full autocompletion for every CSS property, the structure is explicit enough that typos are easier to spot in code review.

**Composable with static styles.** You can mix \`style:\` directives with a static \`style\` attribute or \`<style>\` block without conflicts. The directive takes precedence over the static style for the same property.

**Null/undefined handling.** If the value passed to a \`style:\` directive is \`null\` or \`undefined\`, the property is removed from the element. This is useful for conditional styling without ternary expressions.

\`\`\`svelte
<div style:color={isHighlighted ? 'red' : undefined}>
\`\`\`

When \`isHighlighted\` is false, the \`color\` property is removed entirely, falling back to whatever the CSS cascade provides. With inline strings, you would need to conditionally include or exclude the property, leading to messy template logic.

### Shorthand Syntax

When the variable name matches the CSS property name, you can use the shorthand:

\`\`\`svelte
<script lang="ts">
  let color = $state('blue');
  let opacity = $state(1);
</script>

<!-- These are equivalent -->
<div style:color={color}>
<div style:color>

<!-- Works for any matching name -->
<div style:opacity>
\`\`\`

This mirrors how attribute shorthand works in Svelte (\`<input {value}>\` instead of \`<input value={value}>\`).`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.style.directive'
		},
		{
			type: 'text',
			content: `## CSS Custom Properties (CSS Variables)

CSS custom properties (variables starting with \`--\`) are one of the most powerful features of modern CSS, and Svelte's \`style:\` directive supports them directly:

\`\`\`svelte
<div style:--primary-color={theme.primary} style:--spacing="{gap}px">
  <p>This paragraph inherits the custom properties.</p>
</div>
\`\`\`

Custom properties cascade through the DOM tree. Any child element can reference them with \`var()\`:

\`\`\`svelte
<div style:--card-bg={cardBackground}>
  <div class="card">Content inherits --card-bg</div>
</div>

<style>
  .card {
    background: var(--card-bg, white); /* fallback to white */
  }
</style>
\`\`\`

### Why Custom Properties Matter for Components

Custom properties are the bridge between JavaScript state and CSS. Instead of computing style strings in JavaScript, you set a custom property once and let CSS handle the rest. This is especially powerful with complex calculations:

\`\`\`svelte
<script lang="ts">
  let progress = $state(0.65);
</script>

<div class="progress-bar" style:--progress={progress}>
  <div class="fill"></div>
</div>

<style>
  .fill {
    width: calc(var(--progress) * 100%);
    background: hsl(calc(var(--progress) * 120), 70%, 50%);
    /* Color shifts from red (0) to green (1) based on progress */
  }
</style>
\`\`\`

A single custom property drives both the width and the color. The CSS does the heavy lifting, and JavaScript only manages the single source of truth.

**Task:** Create a box element where the user can control the background color and border radius using reactive state variables and the \`style:\` directive. Include at least one CSS custom property.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Component Style Props for Theming

Svelte has a dedicated syntax for passing CSS custom properties to components. When you write:

\`\`\`svelte
<Card --card-bg="navy" --card-text="white" --card-radius="12px" />
\`\`\`

Svelte wraps the component in a \`<div style="display: contents">\` element that sets those custom properties. Inside the \`Card\` component, you reference them in the \`<style>\` block:

\`\`\`svelte
<!-- Card.svelte -->
<div class="card">
  <slot />
</div>

<style>
  .card {
    background: var(--card-bg, #ffffff);
    color: var(--card-text, #000000);
    border-radius: var(--card-radius, 8px);
    padding: 1rem;
  }
</style>
\`\`\`

### Why This Pattern Exists

This pattern solves the "CSS API" problem. Components need a way to expose styling customization points without exposing their internal DOM structure. Traditional approaches have significant drawbacks:

**Prop-based styling** (\`<Card bg="navy">\`) requires the component to map props to inline styles. Every new customization point needs a new prop, a new line in the script block, and inline style logic. The component becomes a CSS-to-prop translator.

**Class-based styling** (\`<Card class="dark-card">\`) leaks styling responsibility to the parent. The parent must know the internal structure of the component to write effective CSS. Svelte's scoped styles make this even harder because parent styles are scoped to the parent, not the child.

**CSS custom properties** are the right abstraction. The component declares which properties it responds to (via \`var()\` references in its \`<style>\` block), and the parent sets those properties. The component retains control over how the properties are used, and the parent retains control over what values to provide.

### Dynamic Component Style Props

Component style props can be dynamic, responding to reactive state:

\`\`\`svelte
<script lang="ts">
  let isDark = $state(false);
</script>

<Card
  --card-bg={isDark ? '#1a1a2e' : '#ffffff'}
  --card-text={isDark ? '#e0e0e0' : '#1a1a1a'}
/>

<button onclick={() => isDark = !isDark}>Toggle Theme</button>
\`\`\`

When \`isDark\` changes, Svelte updates the custom properties on the wrapper element, and the component re-renders with the new values. No prop drilling, no context, no stores -- just CSS cascade.

### display: contents Caveat

The wrapper \`<div style="display: contents">\` is mostly invisible to layout. \`display: contents\` removes the element from the box model, so its children participate in the parent's layout as if the wrapper did not exist. However, there are edge cases:

- Some CSS properties do not work on \`display: contents\` elements (e.g., \`position\`, \`overflow\`)
- Accessibility tools may handle \`display: contents\` inconsistently on certain elements
- CSS grid/flex direct-child selectors may be affected

In practice, these edge cases rarely cause problems. If they do, you can use the \`style:\` directive on a visible wrapper element instead of component style props.`
		},
		{
			type: 'xray-prompt',
			content: 'Inspect the DOM when you pass --custom-property to a Svelte component. Find the wrapper div with display: contents. How does this affect CSS selectors like :first-child or > .card? Consider: if Svelte did not use a wrapper, how else could it set custom properties on a component that might render multiple root elements?'
		},
		{
			type: 'text',
			content: `## style: vs class: -- When to Use Each

Svelte provides both \`style:\` and \`class:\` directives. They serve different purposes, and choosing correctly matters for maintainability and performance.

### class: Directive Recap

\`\`\`svelte
<div class:active={isActive} class:highlighted={isHighlighted}>
\`\`\`

This adds or removes the class name based on the boolean expression. The actual CSS rules live in the \`<style>\` block.

### Decision Framework

| Situation | Use | Why |
|---|---|---|
| Predefined visual states (active, disabled, error) | \`class:\` | States are known at build time; CSS handles the rules |
| User-controlled colors or sizes | \`style:\` | Values are dynamic and not from a fixed set |
| Theming with a known set of themes | \`class:\` | Each theme is a CSS class with defined rules |
| Theming with arbitrary user values | \`style:\` with custom properties | Values cannot be predefined in CSS |
| Animation keyframe values | \`style:\` | Interpolated values change continuously |
| Responsive breakpoint-based changes | Neither -- use CSS media queries | CSS handles responsive layout natively |
| Hover/focus/active states | Neither -- use CSS pseudo-classes | These are pure CSS concerns |

### The Key Principle

**Use \`class:\` when the styling is categorical** (the element is in one of a known set of visual states). **Use \`style:\` when the styling is continuous** (the value comes from a range like a color picker, slider, or calculation).

\`\`\`svelte
<!-- Categorical: the button is either primary or not -->
<button class:primary={variant === 'primary'}>

<!-- Continuous: the progress width could be any value -->
<div class="bar" style:width="{progress}%">

<!-- Categorical: the message is one of a known set of types -->
<p class:error={type === 'error'} class:success={type === 'success'}>

<!-- Continuous: the color comes from user input -->
<div style:background-color={userColor}>
\`\`\`

### Combining Both

You can and should combine \`class:\` and \`style:\` on the same element when appropriate:

\`\`\`svelte
<div
  class="card"
  class:elevated={isElevated}
  style:--card-accent={accentColor}
>
\`\`\`

The class handles the structural styling change (adding a shadow for elevated cards), while the custom property handles the dynamic accent color.`
		},
		{
			type: 'text',
			content: `## Real-World Exercise: Theme-able Card Component

Build a card component that accepts CSS custom properties for theming. The card should support:

1. \`--card-bg\` for background color
2. \`--card-text\` for text color
3. \`--card-radius\` for border radius
4. \`--card-shadow\` for box shadow color

The parent component should provide controls (color inputs and a range slider) that dynamically change the card's appearance via these custom properties.

### Requirements

- The \`Card.svelte\` component uses \`var()\` to reference custom properties with sensible defaults
- The parent \`App.svelte\` passes custom properties using the \`style:\` directive on a wrapper element
- Include at least three cards with different themes controlled by the same reactive state
- Add a "Reset to defaults" button that clears the custom properties (sets them to undefined)

This exercise demonstrates the full power of the pattern: a component with a CSS API, a parent that controls the theme, and reactive state that flows through CSS custom properties rather than JavaScript props.

**Task:** Complete the App component by wiring up the color inputs and range slider to the card wrapper's \`style:\` directives. The cards should update in real time as you adjust the controls.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Important Caveats and Edge Cases

### Units and Values

The \`style:\` directive passes values as strings to \`element.style.setProperty()\`. For properties that require units, you must include them:

\`\`\`svelte
<!-- WRONG: missing unit -->
<div style:width={100}>

<!-- RIGHT: include the unit -->
<div style:width="{100}px">
<div style:width="{widthValue}rem">
\`\`\`

For unitless properties like \`opacity\` or \`z-index\`, a bare number works because CSS accepts it:

\`\`\`svelte
<div style:opacity={0.5} style:z-index={10}>
\`\`\`

### The !important Modifier

Svelte supports the \`|important\` modifier on style directives:

\`\`\`svelte
<div style:color|important={overrideColor}>
\`\`\`

This compiles to \`element.style.setProperty('color', value, 'important')\`. Use this sparingly -- if you need \`!important\`, it often indicates a specificity problem that should be solved differently. But for overriding third-party CSS or working within constraint systems, it is available.

### Interaction with Svelte Scoped Styles

Svelte scopes component styles by adding a unique hash class to elements. The \`style:\` directive does not interfere with this scoping. You can have scoped CSS rules for a class and use \`style:\` to override specific properties:

\`\`\`svelte
<div class="box" style:background={dynamicBg}>

<style>
  .box {
    background: white; /* default, overridden by style: directive */
    padding: 1rem;
    border: 1px solid #ccc;
  }
</style>
\`\`\`

The inline style from the directive has higher specificity than the scoped class style, so the dynamic background takes effect. The other properties (\`padding\`, \`border\`) remain from the scoped style.

### Performance Characteristics

Each \`style:\` directive creates a minimal reactive update. When the value changes, Svelte calls \`element.style.setProperty(prop, newValue)\` -- a single DOM API call. This is more efficient than setting the entire \`style\` attribute string, especially when multiple style properties exist but only one changes.

For animations where values change on every frame, \`style:\` directives work well because each update is a single property set. However, for complex animations, consider using CSS animations or the Web Animations API instead, as they run on the compositor thread and do not block the main thread.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.style.custom-properties'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let bgColor = $state('#ffffff');
  let textColor = $state('#1a1a1a');
  let radius = $state(8);
  let shadowColor = $state('#00000033');

  function resetDefaults() {
    bgColor = '#ffffff';
    textColor = '#1a1a1a';
    radius = 8;
    shadowColor = '#00000033';
  }
</script>

<div class="app">
  <h1>Theme-able Cards</h1>

  <div class="controls">
    <label>
      Background:
      <input type="color" bind:value={bgColor} />
    </label>
    <label>
      Text Color:
      <input type="color" bind:value={textColor} />
    </label>
    <label>
      Border Radius: {radius}px
      <input type="range" min="0" max="32" bind:value={radius} />
    </label>
    <button onclick={resetDefaults}>Reset to Defaults</button>
  </div>

  <div class="cards">
    <!-- TODO: Add style: directives for --card-bg, --card-text, --card-radius, --card-shadow -->
    <div class="card-wrapper">
      <div class="card">
        <h2>Basic Plan</h2>
        <p class="price">$9/mo</p>
        <p>Perfect for getting started with essential features.</p>
      </div>
    </div>

    <div class="card-wrapper">
      <div class="card">
        <h2>Pro Plan</h2>
        <p class="price">$29/mo</p>
        <p>Advanced features for growing teams and projects.</p>
      </div>
    </div>

    <div class="card-wrapper">
      <div class="card">
        <h2>Enterprise</h2>
        <p class="price">$99/mo</p>
        <p>Full platform access with priority support.</p>
      </div>
    </div>
  </div>
</div>

<style>
  .app {
    font-family: system-ui, sans-serif;
    padding: 2rem;
    max-width: 900px;
    margin: 0 auto;
  }

  .controls {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
  }

  .controls label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .controls button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
  }

  .card {
    background: var(--card-bg, #ffffff);
    color: var(--card-text, #1a1a1a);
    border-radius: var(--card-radius, 8px);
    box-shadow: 0 4px 12px var(--card-shadow, #00000033);
    padding: 1.5rem;
    transition: all 0.2s ease;
  }

  .price {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--card-text, #6366f1);
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
  let bgColor = $state('#ffffff');
  let textColor = $state('#1a1a1a');
  let radius = $state(8);
  let shadowColor = $state('#00000033');

  function resetDefaults() {
    bgColor = '#ffffff';
    textColor = '#1a1a1a';
    radius = 8;
    shadowColor = '#00000033';
  }
</script>

<div class="app">
  <h1>Theme-able Cards</h1>

  <div class="controls">
    <label>
      Background:
      <input type="color" bind:value={bgColor} />
    </label>
    <label>
      Text Color:
      <input type="color" bind:value={textColor} />
    </label>
    <label>
      Border Radius: {radius}px
      <input type="range" min="0" max="32" bind:value={radius} />
    </label>
    <button onclick={resetDefaults}>Reset to Defaults</button>
  </div>

  <div
    class="cards"
    style:--card-bg={bgColor}
    style:--card-text={textColor}
    style:--card-radius="{radius}px"
    style:--card-shadow={shadowColor}
  >
    <div class="card-wrapper">
      <div class="card">
        <h2>Basic Plan</h2>
        <p class="price">$9/mo</p>
        <p>Perfect for getting started with essential features.</p>
      </div>
    </div>

    <div class="card-wrapper">
      <div class="card">
        <h2>Pro Plan</h2>
        <p class="price">$29/mo</p>
        <p>Advanced features for growing teams and projects.</p>
      </div>
    </div>

    <div class="card-wrapper">
      <div class="card">
        <h2>Enterprise</h2>
        <p class="price">$99/mo</p>
        <p>Full platform access with priority support.</p>
      </div>
    </div>
  </div>
</div>

<style>
  .app {
    font-family: system-ui, sans-serif;
    padding: 2rem;
    max-width: 900px;
    margin: 0 auto;
  }

  .controls {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
  }

  .controls label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .controls button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
  }

  .card {
    background: var(--card-bg, #ffffff);
    color: var(--card-text, #1a1a1a);
    border-radius: var(--card-radius, 8px);
    box-shadow: 0 4px 12px var(--card-shadow, #00000033);
    padding: 1.5rem;
    transition: all 0.2s ease;
  }

  .price {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--card-text, #6366f1);
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use style: directive with CSS custom properties on an element',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'style:--card-bg' },
						{ type: 'contains', value: 'style:--card-text' }
					]
				}
			},
			hints: [
				'Add `style:--card-bg={bgColor}` to a wrapper element around the cards so the custom properties cascade to all cards.',
				'Add `style:--card-text={textColor}` and `style:--card-radius="{radius}px"` to the same wrapper element.',
				'Add all four style directives to the `.cards` div: `style:--card-bg={bgColor} style:--card-text={textColor} style:--card-radius="{radius}px" style:--card-shadow={shadowColor}`.'
			],
			conceptsTested: ['svelte5.style.directive', 'svelte5.style.custom-properties']
		},
		{
			id: 'cp-2',
			description: 'Cards visually update when controls change values',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'style:--card-radius' },
						{ type: 'contains', value: 'style:--card-shadow' }
					]
				}
			},
			hints: [
				'Make sure the radius value includes the px unit: `style:--card-radius="{radius}px"`.',
				'Pass the shadowColor state directly: `style:--card-shadow={shadowColor}`.',
				'All four custom properties should be on the same parent element so they cascade down via CSS inheritance to the `.card` elements that use `var(--card-bg)` etc.'
			],
			conceptsTested: ['svelte5.style.custom-properties', 'svelte5.style.component-props']
		}
	]
};
