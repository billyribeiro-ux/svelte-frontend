import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '16-5',
		title: 'Component Type & Wrappers',
		phase: 5,
		module: 16,
		lessonIndex: 5
	},
	description: `When building component libraries or higher-order components in Svelte 5, you need precise TypeScript types for components and their props. The Component type represents any Svelte component with specific props, while ComponentProps<T> extracts the props type from a component.

HTMLButtonAttributes and other HTML attribute types from svelte/elements let you build wrapper components that accept all native HTML attributes plus custom ones. This pattern is essential for design systems where Button, Input, and other primitives need to forward all standard attributes.`,
	objectives: [
		'Type component references using Component<Props> from svelte',
		'Extract props types with ComponentProps<typeof MyComponent>',
		'Build wrapper components that extend HTMLButtonAttributes',
		'Forward rest props to underlying HTML elements with {...rest}'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import type { Component, ComponentProps } from 'svelte';
  import type { HTMLButtonAttributes, HTMLInputAttributes } from 'svelte/elements';

  // Wrapper component pattern — a Button that extends HTML button attrs
  // In a real project, this would be Button.svelte:
  //
  // <script lang="ts">
  //   import type { HTMLButtonAttributes } from 'svelte/elements';
  //   import type { Snippet } from 'svelte';
  //
  //   let {
  //     variant = 'primary',
  //     size = 'medium',
  //     children,
  //     ...rest  // forward all HTML button attributes
  //   }: HTMLButtonAttributes & {
  //     variant?: 'primary' | 'secondary' | 'danger';
  //     size?: 'small' | 'medium' | 'large';
  //     children: Snippet;
  //   } = $props();
  // </script>
  //
  // <button class="btn {variant} {size}" {...rest}>
  //   {@render children()}
  // </button>

  // Demonstrate Component type usage
  type ButtonProps = {
    variant: 'primary' | 'secondary' | 'danger';
    size: 'small' | 'medium' | 'large';
    label: string;
  };

  // ComponentProps extracts the type
  // type Extracted = ComponentProps<typeof Button>;
  // Extracted === ButtonProps

  let selectedVariant: 'primary' | 'secondary' | 'danger' = $state('primary');
  let selectedSize: 'small' | 'medium' | 'large' = $state('medium');
  let isDisabled: boolean = $state(false);
  let buttonText: string = $state('Click Me');
  let clickLog: string[] = $state([]);

  function handleClick(): void {
    clickLog = [
      \`[\${new Date().toLocaleTimeString()}] \${selectedVariant}/\${selectedSize} clicked\`,
      ...clickLog,
    ].slice(0, 5);
  }

  // Dynamic component rendering concept
  type CardVariant = 'info' | 'warning' | 'error';
  let cardType: CardVariant = $state('info');

  const cardConfig: Record<CardVariant, { color: string; icon: string; title: string }> = {
    info: { color: '#0984e3', icon: 'i', title: 'Information' },
    warning: { color: '#fdcb6e', icon: '!', title: 'Warning' },
    error: { color: '#d63031', icon: 'x', title: 'Error' },
  };

  let currentCard = $derived(cardConfig[cardType]);
</script>

<h1>Component Types & Wrappers</h1>

<section>
  <h2>Button Wrapper (extends HTMLButtonAttributes)</h2>
  <div class="controls">
    <label>
      Variant:
      <select bind:value={selectedVariant}>
        <option value="primary">Primary</option>
        <option value="secondary">Secondary</option>
        <option value="danger">Danger</option>
      </select>
    </label>
    <label>
      Size:
      <select bind:value={selectedSize}>
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>
    </label>
    <label><input type="checkbox" bind:checked={isDisabled} /> Disabled</label>
    <label>Text: <input type="text" bind:value={buttonText} /></label>
  </div>

  <!-- Simulated wrapper component output -->
  <button
    class="btn {selectedVariant} {selectedSize}"
    disabled={isDisabled}
    onclick={handleClick}
  >
    {buttonText}
  </button>

  {#if clickLog.length > 0}
    <div class="log">
      {#each clickLog as entry}
        <div>{entry}</div>
      {/each}
    </div>
  {/if}
</section>

<section>
  <h2>Component&lt;Props&gt; & ComponentProps</h2>
  <div class="type-demo">
    <pre><code>import type &#123; Component, ComponentProps &#125; from 'svelte';

// Type a component reference
let ButtonComponent: Component&lt;ButtonProps&gt;;

// Extract props from a component type
type Props = ComponentProps&lt;typeof Button&gt;;
// Props = &#123; variant: ...; size: ...; label: ...; &#125;

// Use in a dynamic renderer
function render(
  comp: Component&lt;any&gt;,
  props: ComponentProps&lt;typeof comp&gt;
) &#123;
  mount(comp, &#123; target: el, props &#125;);
&#125;</code></pre>
  </div>
</section>

<section>
  <h2>Dynamic Card Component</h2>
  <div class="card-controls">
    {#each Object.keys(cardConfig) as type}
      <button
        class:active={cardType === type}
        onclick={() => cardType = type as CardVariant}
      >
        {type}
      </button>
    {/each}
  </div>

  <div class="card" style="border-color: {currentCard.color}">
    <div class="card-icon" style="background: {currentCard.color}">
      {currentCard.icon}
    </div>
    <div class="card-content">
      <h3>{currentCard.title}</h3>
      <p>This card renders different content based on the component variant prop.</p>
    </div>
  </div>
</section>

<section>
  <h2>HTML Attribute Types</h2>
  <div class="type-list">
    <div class="type-item"><code>HTMLButtonAttributes</code> — button props</div>
    <div class="type-item"><code>HTMLInputAttributes</code> — input props</div>
    <div class="type-item"><code>HTMLAnchorAttributes</code> — anchor props</div>
    <div class="type-item"><code>HTMLAttributes&lt;HTMLDivElement&gt;</code> — div props</div>
    <div class="type-item"><code>SVGAttributes&lt;SVGSVGElement&gt;</code> — SVG props</div>
  </div>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #e17055; font-size: 1.1rem; }
  .controls {
    display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;
    align-items: center;
  }
  label { font-size: 0.9rem; display: flex; align-items: center; gap: 0.3rem; }
  select, input[type="text"] {
    padding: 0.3rem; border: 1px solid #ddd; border-radius: 4px;
  }
  .btn {
    border: none; cursor: pointer; font-weight: 600; border-radius: 6px;
    transition: all 0.2s;
  }
  .btn.small { padding: 0.3rem 0.6rem; font-size: 0.8rem; }
  .btn.medium { padding: 0.5rem 1rem; font-size: 1rem; }
  .btn.large { padding: 0.75rem 1.5rem; font-size: 1.2rem; }
  .btn.primary { background: #0984e3; color: white; }
  .btn.secondary { background: #636e72; color: white; }
  .btn.danger { background: #d63031; color: white; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .log {
    margin-top: 0.75rem; padding: 0.5rem; background: #2d3436;
    border-radius: 4px; font-family: monospace; font-size: 0.8rem; color: #dfe6e9;
  }
  .type-demo {
    background: #2d3436; padding: 1rem; border-radius: 6px;
  }
  pre { margin: 0; overflow-x: auto; }
  code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; }
  .card-controls { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .card-controls button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #dfe6e9; cursor: pointer; font-weight: 600;
    text-transform: capitalize;
  }
  .card-controls button.active { background: #e17055; color: white; }
  .card {
    display: flex; gap: 1rem; padding: 1rem; background: white;
    border-radius: 8px; border-left: 4px solid;
  }
  .card-icon {
    width: 36px; height: 36px; border-radius: 50%; color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: bold; font-size: 1.2rem; flex-shrink: 0;
  }
  .card h3 { margin: 0 0 0.25rem; }
  .card p { margin: 0; color: #636e72; font-size: 0.9rem; }
  .type-list { display: flex; flex-direction: column; gap: 0.4rem; }
  .type-item {
    padding: 0.4rem 0.6rem; background: white; border-radius: 4px;
    font-size: 0.9rem;
  }
  .type-item code { color: #e17055; background: transparent; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
