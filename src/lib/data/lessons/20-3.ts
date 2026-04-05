import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '20-3',
		title: 'Core Components',
		phase: 7,
		module: 20,
		lessonIndex: 3
	},
	description: `Core components are the building blocks of your capstone — Button, Input, Card, Dialog, Nav. Each one is typed with TypeScript props, consumes design tokens from app.css, exposes variants via data attributes, and accepts snippet slots for composable content. Build these right once and every page in the application inherits consistent styling and behavior.

This lesson walks through each component with its full source — runes, typed $props, $bindable, snippets, and scoped CSS — so you can copy them straight into your own project.`,
	objectives: [
		'Build typed component APIs with $props and Svelte Snippet',
		'Accept form state through $bindable() for two-way binding',
		'Implement variants via data-variant attributes',
		'Compose slots with {#snippet} / {@render}',
		'Wire keyboard and ARIA semantics into Dialog and Nav'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Tab = 'button' | 'input' | 'card' | 'dialog' | 'nav';
  let activeTab = $state<Tab>('button');

  // Button playground state
  let btnVariant = $state<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  let btnSize = $state<'sm' | 'md' | 'lg'>('md');
  let btnLoading = $state(false);

  // Input playground state
  let email = $state('');
  let password = $state('');
  let emailError = $derived(email.length > 0 && !email.includes('@') ? 'Enter a valid email' : '');

  // Dialog state
  let dialogOpen = $state(false);
  let dialogEl: HTMLDivElement | undefined = $state();
  function openDialog() { dialogOpen = true; setTimeout(() => dialogEl?.focus(), 0); }
  function closeDialog() { dialogOpen = false; }
  function dialogKeys(e: KeyboardEvent) { if (e.key === 'Escape') closeDialog(); }

  const buttonSource = \`<!-- Button.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    onclick?: (e: MouseEvent) => void;
    children: Snippet;
  };

  let {
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    fullWidth = false,
    onclick,
    children
  }: Props = $props();
<\\/script>

<button
  {type}
  data-variant={variant}
  data-size={size}
  class:full-width={fullWidth}
  class:loading
  disabled={disabled || loading}
  {onclick}
>
  {#if loading}
    <span class="spinner" aria-hidden="true"></span>
    <span class="sr-only">Loading</span>
  {/if}
  {@render children()}
</button>

<style>
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    border: 1px solid transparent;
    font-weight: 600;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition:
      background var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);
  }
  button:hover:not(:disabled) { transform: translateY(-1px); }
  button:disabled { opacity: 0.55; cursor: not-allowed; }
  button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  button[data-size='sm'] { padding: 0.25rem 0.75rem; font-size: var(--text-sm); }
  button[data-size='md'] { padding: 0.5rem 1.25rem; font-size: var(--text-base); }
  button[data-size='lg'] { padding: 0.75rem 1.75rem; font-size: var(--text-lg); }

  button[data-variant='primary'] {
    background: var(--color-primary);
    color: var(--color-primary-fg);
  }
  button[data-variant='primary']:hover:not(:disabled) {
    background: var(--color-primary-hover);
  }
  button[data-variant='secondary'] {
    background: var(--color-surface);
    color: var(--color-text);
    border-color: var(--color-border);
  }
  button[data-variant='ghost'] {
    background: transparent;
    color: var(--color-primary);
  }
  button[data-variant='danger'] {
    background: var(--color-danger);
    color: white;
  }

  .full-width { width: 100%; }

  .spinner {
    width: 14px; height: 14px;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>\`;

  const inputSource = \`<!-- Input.svelte -->
<script lang="ts">
  type Props = {
    label: string;
    value: string;
    type?: 'text' | 'email' | 'password' | 'tel' | 'url';
    placeholder?: string;
    error?: string;
    hint?: string;
    required?: boolean;
  };

  let {
    label,
    value = $bindable(''),
    type = 'text',
    placeholder,
    error,
    hint,
    required = false
  }: Props = $props();

  const id = $props.id();
<\\/script>

<div class="field">
  <label for={id}>
    {label}
    {#if required}<span class="req" aria-label="required">*</span>{/if}
  </label>
  <input
    {id}
    {type}
    {placeholder}
    bind:value
    aria-invalid={error ? 'true' : undefined}
    aria-describedby={error ? id + '-error' : hint ? id + '-hint' : undefined}
    required={required}
  />
  {#if hint && !error}
    <p class="hint" id={id + '-hint'}>{hint}</p>
  {/if}
  {#if error}
    <p class="error" id={id + '-error'} role="alert">{error}</p>
  {/if}
</div>

<style>
  .field { display: flex; flex-direction: column; gap: var(--space-1); }
  label { font-size: var(--text-sm); font-weight: 600; }
  .req { color: var(--color-danger); margin-left: 0.2rem; }
  input {
    padding: var(--space-2) var(--space-3);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-elevate);
    color: var(--color-text);
    font-size: var(--text-base);
    transition: border-color var(--duration-fast);
  }
  input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px oklch(0.55 0.2 250 / 0.2);
  }
  input[aria-invalid='true'] { border-color: var(--color-danger); }
  .hint { font-size: var(--text-xs); color: var(--color-muted); margin: 0; }
  .error { font-size: var(--text-xs); color: var(--color-danger); margin: 0; }
</style>\`;

  const cardSource = \`<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  type Props = {
    variant?: 'flat' | 'elevated' | 'outlined';
    padding?: 'sm' | 'md' | 'lg';
    href?: string;
    header?: Snippet;
    footer?: Snippet;
    children: Snippet;
  };
  let { variant = 'elevated', padding = 'md', href, header, footer, children }: Props = $props();
<\\/script>

{#if href}
  <a class="card" data-variant={variant} data-padding={padding} {href}>
    {#if header}<div class="header">{@render header()}</div>{/if}
    <div class="body">{@render children()}</div>
    {#if footer}<div class="footer">{@render footer()}</div>{/if}
  </a>
{:else}
  <article class="card" data-variant={variant} data-padding={padding}>
    {#if header}<div class="header">{@render header()}</div>{/if}
    <div class="body">{@render children()}</div>
    {#if footer}<div class="footer">{@render footer()}</div>{/if}
  </article>
{/if}

<style>
  .card {
    display: block;
    background: var(--color-elevate);
    border-radius: var(--radius-lg);
    color: inherit;
    text-decoration: none;
    transition: transform var(--duration-fast), box-shadow var(--duration-fast);
  }
  .card[data-variant='elevated'] { box-shadow: var(--shadow-md); }
  .card[data-variant='outlined'] { border: 1px solid var(--color-border); }
  .card[data-variant='flat']     { background: var(--color-surface); }
  .card[data-padding='sm'] .body { padding: var(--space-3); }
  .card[data-padding='md'] .body { padding: var(--space-4); }
  .card[data-padding='lg'] .body { padding: var(--space-6); }
  a.card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
</style>\`;

  const dialogSource = \`<!-- Dialog.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  type Props = {
    open: boolean;
    title: string;
    onClose: () => void;
    children: Snippet;
    actions?: Snippet;
  };
  let { open = $bindable(false), title, onClose, children, actions }: Props = $props();

  let dialogEl: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (open) {
      const previous = document.activeElement as HTMLElement;
      dialogEl?.focus();
      return () => previous?.focus();
    }
  });

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
<\\/script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="backdrop"
    onclick={onClose}
    onkeydown={handleKey}
    role="presentation"
  >
    <div
      bind:this={dialogEl}
      class="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
    >
      <h2 id="dialog-title">{title}</h2>
      <div class="body">{@render children()}</div>
      {#if actions}<div class="actions">{@render actions()}</div>{/if}
    </div>
  </div>
{/if}\`;

  const navSource = \`<!-- Nav.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  type Link = { href: string; label: string };
  type Props = { links: Link[]; brand: string };
  let { links, brand }: Props = $props();
<\\/script>

<nav aria-label="Primary">
  <a class="brand" href="/">{brand}</a>
  <ul>
    {#each links as link (link.href)}
      <li>
        <a
          href={link.href}
          aria-current={page.url.pathname === link.href ? 'page' : undefined}
        >{link.label}</a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  nav {
    display: flex;
    gap: var(--space-6);
    align-items: center;
    padding: var(--space-4) var(--space-6);
    background: var(--color-elevate);
    border-bottom: 1px solid var(--color-border);
  }
  .brand { font-weight: 800; font-size: var(--text-lg); }
  ul { display: flex; gap: var(--space-4); list-style: none; padding: 0; margin: 0; }
  a { color: var(--color-muted); }
  a[aria-current='page'] { color: var(--color-primary); font-weight: 600; }
</style>\`;
</script>

<main>
  <h1>Core Components</h1>
  <p class="subtitle">The building blocks of your capstone</p>

  <nav class="tabs" aria-label="Components">
    <button class:active={activeTab === 'button'} onclick={() => (activeTab = 'button')}>Button</button>
    <button class:active={activeTab === 'input'} onclick={() => (activeTab = 'input')}>Input</button>
    <button class:active={activeTab === 'card'} onclick={() => (activeTab = 'card')}>Card</button>
    <button class:active={activeTab === 'dialog'} onclick={() => (activeTab = 'dialog')}>Dialog</button>
    <button class:active={activeTab === 'nav'} onclick={() => (activeTab = 'nav')}>Nav</button>
  </nav>

  {#if activeTab === 'button'}
    <section>
      <h2>Button</h2>
      <div class="demo">
        <div class="controls">
          <label>
            Variant
            <select bind:value={btnVariant}>
              <option value="primary">primary</option>
              <option value="secondary">secondary</option>
              <option value="ghost">ghost</option>
              <option value="danger">danger</option>
            </select>
          </label>
          <label>
            Size
            <select bind:value={btnSize}>
              <option value="sm">sm</option>
              <option value="md">md</option>
              <option value="lg">lg</option>
            </select>
          </label>
          <label><input type="checkbox" bind:checked={btnLoading} /> Loading</label>
        </div>
        <div class="preview">
          <button class="demo-btn" data-variant={btnVariant} data-size={btnSize} class:loading={btnLoading}>
            {btnLoading ? 'Loading…' : 'Click me'}
          </button>
        </div>
      </div>
      <pre><code>{buttonSource}</code></pre>
    </section>
  {:else if activeTab === 'input'}
    <section>
      <h2>Input</h2>
      <div class="demo">
        <div class="form-preview">
          <div class="field">
            <label for="demo-email">Email <span class="req">*</span></label>
            <input id="demo-email" type="email" bind:value={email} placeholder="you@example.com" aria-invalid={emailError ? 'true' : undefined} />
            {#if emailError}<p class="error">{emailError}</p>{/if}
          </div>
          <div class="field">
            <label for="demo-pw">Password</label>
            <input id="demo-pw" type="password" bind:value={password} />
            <p class="hint">At least 8 characters</p>
          </div>
        </div>
      </div>
      <pre><code>{inputSource}</code></pre>
    </section>
  {:else if activeTab === 'card'}
    <section>
      <h2>Card</h2>
      <div class="card-grid">
        <article class="demo-card flat">
          <h3>Flat</h3>
          <p>Minimal surface on a tinted background.</p>
        </article>
        <article class="demo-card elevated">
          <h3>Elevated</h3>
          <p>Shadow lifts the card off the page.</p>
        </article>
        <article class="demo-card outlined">
          <h3>Outlined</h3>
          <p>Clean 1px border, no shadow.</p>
        </article>
      </div>
      <pre><code>{cardSource}</code></pre>
    </section>
  {:else if activeTab === 'dialog'}
    <section>
      <h2>Dialog</h2>
      <button class="demo-btn" data-variant="primary" data-size="md" onclick={openDialog}>Open dialog</button>

      {#if dialogOpen}
        <div
          class="backdrop"
          onclick={closeDialog}
          onkeydown={dialogKeys}
          role="presentation"
        >
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            bind:this={dialogEl}
            class="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dlg-title"
            tabindex="-1"
            onclick={(e) => e.stopPropagation()}
          >
            <h3 id="dlg-title">Confirm action</h3>
            <p>Are you sure you want to continue?</p>
            <div class="actions">
              <button class="demo-btn" data-variant="secondary" data-size="md" onclick={closeDialog}>Cancel</button>
              <button class="demo-btn" data-variant="primary" data-size="md" onclick={closeDialog}>Confirm</button>
            </div>
          </div>
        </div>
      {/if}

      <pre><code>{dialogSource}</code></pre>
    </section>
  {:else}
    <section>
      <h2>Nav</h2>
      <nav class="demo-nav" aria-label="Primary">
        <a class="brand" href="#!">Acme</a>
        <ul>
          <li><a href="#!" aria-current="page">Home</a></li>
          <li><a href="#!">Features</a></li>
          <li><a href="#!">Pricing</a></li>
          <li><a href="#!">Blog</a></li>
        </ul>
      </nav>
      <pre><code>{navSource}</code></pre>
    </section>
  {/if}
</main>

<style>
  main { max-width: 920px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  .subtitle { color: #666; margin-bottom: 1.5rem; }

  .tabs { display: flex; gap: 0.35rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e0e0e0; flex-wrap: wrap; }
  .tabs button { padding: 0.55rem 1rem; border: none; background: transparent; border-radius: 6px 6px 0 0; font-weight: 500; cursor: pointer; }
  .tabs button.active { background: #eef4fb; color: #1e40af; }

  section { margin-bottom: 2rem; }
  h2 { margin-top: 0; }

  .demo {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 10px;
    margin-bottom: 1rem;
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 1rem;
  }
  @media (max-width: 700px) { .demo { grid-template-columns: 1fr; } }
  .controls { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.88rem; }
  .controls label { display: flex; flex-direction: column; gap: 0.25rem; }
  .controls select { padding: 0.4rem; border: 1px solid #ccc; border-radius: 6px; }
  .preview { display: grid; place-items: center; }

  .demo-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: 150ms;
    color: white;
    border-radius: 8px;
  }
  .demo-btn[data-variant='primary'] { background: oklch(0.55 0.2 250); }
  .demo-btn[data-variant='secondary'] { background: #e5e7eb; color: #111; border: 1px solid #ccc; }
  .demo-btn[data-variant='ghost'] { background: transparent; color: oklch(0.55 0.2 250); }
  .demo-btn[data-variant='danger'] { background: oklch(0.6 0.22 25); }
  .demo-btn[data-size='sm'] { padding: 0.25rem 0.75rem; font-size: 0.8rem; }
  .demo-btn[data-size='md'] { padding: 0.5rem 1.25rem; font-size: 0.95rem; }
  .demo-btn[data-size='lg'] { padding: 0.75rem 1.75rem; font-size: 1.1rem; }

  .form-preview { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; }
  .field { display: flex; flex-direction: column; gap: 0.25rem; }
  .field label { font-size: 0.82rem; font-weight: 600; }
  .field input {
    padding: 0.5rem 0.75rem;
    border: 2px solid #ccc;
    border-radius: 6px;
    font-size: 0.9rem;
  }
  .field input[aria-invalid='true'] { border-color: oklch(0.6 0.22 25); }
  .req { color: oklch(0.6 0.22 25); }
  .hint { font-size: 0.75rem; color: #666; margin: 0; }
  .error { font-size: 0.75rem; color: oklch(0.6 0.22 25); margin: 0; }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  .demo-card {
    padding: 1rem;
    border-radius: 12px;
  }
  .demo-card h3 { margin: 0 0 0.35rem; font-size: 0.95rem; }
  .demo-card p { margin: 0; font-size: 0.85rem; color: #555; }
  .demo-card.flat { background: #f8f9fa; }
  .demo-card.elevated { background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04); }
  .demo-card.outlined { background: white; border: 1px solid #e0e0e0; }

  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: grid;
    place-items: center;
    z-index: 100;
  }
  .dialog {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
  }
  .dialog h3 { margin-top: 0; }
  .actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }

  .demo-nav {
    display: flex;
    gap: 2rem;
    align-items: center;
    padding: 1rem 1.5rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    margin-bottom: 1rem;
  }
  .demo-nav .brand { font-weight: 800; font-size: 1.1rem; text-decoration: none; color: #111; }
  .demo-nav ul { display: flex; gap: 1rem; list-style: none; padding: 0; margin: 0; }
  .demo-nav ul a { color: #666; text-decoration: none; font-size: 0.9rem; }
  .demo-nav ul a[aria-current='page'] { color: oklch(0.55 0.2 250); font-weight: 600; }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.72rem;
    line-height: 1.45;
    max-height: 600px;
  }
  pre code { background: none; padding: 0; }
  code { background: #f0f0f0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
