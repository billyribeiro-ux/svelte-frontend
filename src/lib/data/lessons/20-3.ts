import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '20-3',
		title: 'Core Components',
		phase: 7,
		module: 20,
		lessonIndex: 3
	},
	description: `Core components are the building blocks of your design system — Button, Card, Input — built with typed props, design tokens, and variant support. Each component consumes CSS custom properties from app.css, uses data-variant attributes for visual variants, and exports typed $props for a safe, predictable API.

These components are reusable, composable, and self-documenting through TypeScript. Building them right once means every page in your application inherits consistent styling and behavior.`,
	objectives: [
		'Build typed, variant-driven components with Svelte 5 $props',
		'Consume design tokens (CSS custom properties) in component styles',
		'Implement Button, Card, and Input components with multiple variants',
		'Use Snippets for flexible component composition'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ===== Button Component Logic =====
  type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
  type ButtonSize = 'sm' | 'md' | 'lg';

  let selectedVariant = $state<ButtonVariant>('primary');
  let selectedSize = $state<ButtonSize>('md');
  let buttonDisabled = $state(false);
  let buttonLoading = $state(false);

  const buttonVariants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
  const buttonSizes: ButtonSize[] = ['sm', 'md', 'lg'];

  // ===== Input Component Logic =====
  type InputType = 'text' | 'email' | 'password' | 'search';

  let inputValue = $state('');
  let inputType = $state<InputType>('text');
  let inputError = $state('');
  let inputDisabled = $state(false);

  // ===== Card Component Logic =====
  type CardVariant = 'default' | 'outlined' | 'elevated';

  let cardVariant = $state<CardVariant>('default');

  // Component source code examples
  const buttonCode = \`<!-- Button.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
  type Size = 'sm' | 'md' | 'lg';

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    type = 'button',
    onclick,
    children
  }: {
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (e: MouseEvent) => void;
    children: Snippet;
  } = $props();
<\\/script>

<button
  data-variant={variant}
  data-size={size}
  {type}
  disabled={disabled || loading}
  {onclick}
>
  {#if loading}
    <span class="spinner" aria-hidden="true"></span>
  {/if}
  {@render children()}
</button>\`;

  const inputCode = \`<!-- Input.svelte -->
<script lang="ts">
  let {
    label,
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    error = '',
    disabled = false,
    required = false
  }: {
    label: string;
    type?: 'text' | 'email' | 'password' | 'search';
    value?: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
  } = $props();

  const id = crypto.randomUUID();
<\\/script>

<div class="input-group" class:has-error={!!error}>
  <label for={id}>
    {label}
    {#if required}<span class="required">*</span>{/if}
  </label>
  <input
    {id}
    {type}
    bind:value
    {placeholder}
    {disabled}
    aria-required={required}
    aria-invalid={!!error}
    aria-describedby={error ? \\\`\\\${id}-error\\\` : undefined}
  />
  {#if error}
    <p id="{id}-error" class="error-text" role="alert">{error}</p>
  {/if}
</div>\`;

  const cardCode = \`<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Variant = 'default' | 'outlined' | 'elevated';

  let {
    variant = 'default',
    padding = 'md',
    header,
    children,
    footer
  }: {
    variant?: Variant;
    padding?: 'sm' | 'md' | 'lg';
    header?: Snippet;
    children: Snippet;
    footer?: Snippet;
  } = $props();
<\\/script>

<div class="card" data-variant={variant} data-padding={padding}>
  {#if header}
    <div class="card-header">
      {@render header()}
    </div>
  {/if}
  <div class="card-body">
    {@render children()}
  </div>
  {#if footer}
    <div class="card-footer">
      {@render footer()}
    </div>
  {/if}
</div>\`;

  let activeComponent = $state<'button' | 'input' | 'card'>('button');
</script>

<main>
  <h1>Core Components</h1>
  <p class="subtitle">Typed, tokenized, variant-driven building blocks</p>

  <div class="component-tabs">
    <button class:active={activeComponent === 'button'} onclick={() => activeComponent = 'button'}>Button</button>
    <button class:active={activeComponent === 'input'} onclick={() => activeComponent = 'input'}>Input</button>
    <button class:active={activeComponent === 'card'} onclick={() => activeComponent = 'card'}>Card</button>
  </div>

  {#if activeComponent === 'button'}
    <section>
      <h2>Button Component</h2>
      <div class="playground">
        <div class="controls">
          <div class="control-row">
            <span>Variant:</span>
            {#each buttonVariants as v}
              <button class="chip" class:selected={selectedVariant === v} onclick={() => selectedVariant = v}>{v}</button>
            {/each}
          </div>
          <div class="control-row">
            <span>Size:</span>
            {#each buttonSizes as s}
              <button class="chip" class:selected={selectedSize === s} onclick={() => selectedSize = s}>{s}</button>
            {/each}
          </div>
          <div class="control-row">
            <label><input type="checkbox" bind:checked={buttonDisabled} /> Disabled</label>
            <label><input type="checkbox" bind:checked={buttonLoading} /> Loading</label>
          </div>
        </div>

        <div class="preview">
          <button
            class="demo-button"
            data-variant={selectedVariant}
            data-size={selectedSize}
            disabled={buttonDisabled || buttonLoading}
          >
            {#if buttonLoading}<span class="spinner"></span>{/if}
            Click Me
          </button>
        </div>
      </div>
      <pre><code>{buttonCode}</code></pre>
    </section>

  {:else if activeComponent === 'input'}
    <section>
      <h2>Input Component</h2>
      <div class="playground">
        <div class="controls">
          <div class="control-row">
            <span>Type:</span>
            {#each ['text', 'email', 'password', 'search'] as t}
              <button class="chip" class:selected={inputType === t} onclick={() => inputType = t as InputType}>{t}</button>
            {/each}
          </div>
          <div class="control-row">
            <label><input type="checkbox" bind:checked={inputDisabled} /> Disabled</label>
            <label>
              Error:
              <input type="text" bind:value={inputError} placeholder="Error message" class="inline-input" />
            </label>
          </div>
        </div>

        <div class="preview">
          <div class="input-demo" class:has-error={!!inputError}>
            <label for="demo-input">Email Address <span class="required-star">*</span></label>
            <input
              id="demo-input"
              type={inputType}
              bind:value={inputValue}
              placeholder="Enter your email..."
              disabled={inputDisabled}
              aria-invalid={!!inputError}
            />
            {#if inputError}
              <p class="error-msg" role="alert">{inputError}</p>
            {/if}
          </div>
        </div>
      </div>
      <pre><code>{inputCode}</code></pre>
    </section>

  {:else}
    <section>
      <h2>Card Component</h2>
      <div class="playground">
        <div class="controls">
          <div class="control-row">
            <span>Variant:</span>
            {#each ['default', 'outlined', 'elevated'] as v}
              <button class="chip" class:selected={cardVariant === v} onclick={() => cardVariant = v as CardVariant}>{v}</button>
            {/each}
          </div>
        </div>

        <div class="preview card-preview">
          <div class="demo-card" data-variant={cardVariant}>
            <div class="card-header-demo">
              <h3>Card Title</h3>
            </div>
            <div class="card-body-demo">
              <p>Card content using the <code>{cardVariant}</code> variant. Built with design tokens and Snippets for flexible composition.</p>
            </div>
            <div class="card-footer-demo">
              <button class="demo-button" data-variant="primary" data-size="sm">Action</button>
            </div>
          </div>
        </div>
      </div>
      <pre><code>{cardCode}</code></pre>
    </section>
  {/if}
</main>

<style>
  main {
    max-width: 850px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .subtitle { color: #666; margin-bottom: 2rem; }

  .component-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  .component-tabs > button {
    flex: 1;
    padding: 0.7rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
  }

  .component-tabs > button.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .playground {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
  }

  .controls {
    margin-bottom: 1.5rem;
  }

  .control-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
    flex-wrap: wrap;
  }

  .chip {
    padding: 0.25rem 0.6rem;
    border: 1px solid #ccc;
    border-radius: 20px;
    background: white;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .chip.selected {
    background: #4a90d9;
    color: white;
    border-color: #4a90d9;
  }

  .preview {
    display: flex;
    justify-content: center;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    border: 1px dashed #ddd;
  }

  /* Demo Button styles */
  .demo-button {
    border: none;
    cursor: pointer;
    font-weight: 600;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.15s;
  }

  .demo-button[data-size="sm"] { padding: 0.35rem 0.9rem; font-size: 0.85rem; }
  .demo-button[data-size="md"] { padding: 0.55rem 1.3rem; font-size: 1rem; }
  .demo-button[data-size="lg"] { padding: 0.75rem 1.8rem; font-size: 1.1rem; }

  .demo-button[data-variant="primary"] { background: #4a90d9; color: white; }
  .demo-button[data-variant="secondary"] { background: #6c757d; color: white; }
  .demo-button[data-variant="ghost"] { background: transparent; border: 2px solid #333; color: #333; }
  .demo-button[data-variant="danger"] { background: #dc2626; color: white; }

  .demo-button:disabled { opacity: 0.5; cursor: not-allowed; }
  .demo-button:hover:not(:disabled) { opacity: 0.85; }

  .spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Input demo */
  .input-demo { width: 100%; max-width: 350px; }
  .input-demo label { display: block; font-weight: 600; margin-bottom: 0.25rem; font-size: 0.9rem; }
  .required-star { color: #dc2626; }

  .input-demo input {
    width: 100%;
    padding: 0.55rem 0.75rem;
    border: 2px solid #ccc;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: border-color 0.15s;
  }

  .input-demo input:focus { outline: none; border-color: #4a90d9; box-shadow: 0 0 0 3px rgba(74,144,217,0.15); }
  .has-error input { border-color: #dc2626; }
  .error-msg { color: #dc2626; font-size: 0.82rem; margin: 0.25rem 0 0; }

  .inline-input {
    padding: 0.2rem 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.85rem;
    width: 150px;
  }

  /* Card demo */
  .card-preview { flex-direction: column; }

  .demo-card {
    width: 100%;
    max-width: 400px;
    border-radius: 12px;
    overflow: hidden;
  }

  .demo-card[data-variant="default"] { background: #f8f9fa; border: 1px solid #e0e0e0; }
  .demo-card[data-variant="outlined"] { background: white; border: 2px solid #4a90d9; }
  .demo-card[data-variant="elevated"] { background: white; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }

  .card-header-demo { padding: 1rem 1.25rem; border-bottom: 1px solid #e0e0e0; }
  .card-header-demo h3 { margin: 0; }
  .card-body-demo { padding: 1.25rem; }
  .card-body-demo p { margin: 0; color: #555; }
  .card-footer-demo { padding: 0.75rem 1.25rem; border-top: 1px solid #e0e0e0; display: flex; justify-content: flex-end; }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  code {
    background: #f0f0f0;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.85rem;
  }

  pre code { background: none; padding: 0; }

  section { margin-bottom: 2rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
