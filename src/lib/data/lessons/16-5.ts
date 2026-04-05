import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '16-5',
		title: 'Component Type & Wrappers',
		phase: 5,
		module: 16,
		lessonIndex: 5
	},
	description: `When building component libraries or higher-order components in Svelte 5, you need precise TypeScript types for components and their props. The Component<Props> type represents any Svelte component whose props match Props. ComponentProps<T> extracts the props type from a component, letting you build generic renderers and HOCs.

HTMLButtonAttributes, HTMLInputAttributes, and other HTML attribute types from svelte/elements let you build wrapper components that accept all native HTML attributes plus your custom ones. This pattern is essential for design systems: a Button component should accept \`aria-label\`, \`disabled\`, \`type\`, \`formaction\`, etc., without re-declaring every attribute.

The idiomatic recipe is: destructure your custom props out of $props(), gather the rest with \`...rest\`, and spread them onto the underlying element with \`{...rest}\`. TypeScript will check that every attribute you forward is valid for the element.`,
	objectives: [
		'Type component references using Component<Props> from svelte',
		'Extract props types with ComponentProps<typeof MyComponent>',
		'Build a Button wrapper that extends HTMLButtonAttributes',
		'Build an Input wrapper that extends HTMLInputAttributes',
		'Forward rest props to underlying HTML elements with {...rest}',
		'Render dynamic components with <svelte:component> equivalents'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Button from './Button.svelte';
  import Input from './Input.svelte';

  // ComponentProps extracts the prop type from a component.
  // Useful for generic wrappers, mocks, or HOCs.
  type BtnProps = ComponentProps<typeof Button>;

  let clickLog: string[] = $state([]);
  function log(msg: string): void {
    clickLog = [
      \`[\${new Date().toLocaleTimeString()}] \${msg}\`,
      ...clickLog
    ].slice(0, 6);
  }

  // Controlled form bound to our Input wrapper
  let email: string = $state('');
  let password: string = $state('');
  let agreed: boolean = $state(false);

  let emailError = $derived(
    email && !email.includes('@') ? 'Enter a valid email' : ''
  );
  let passwordError = $derived(
    password && password.length < 8 ? 'Min 8 characters' : ''
  );
  let canSubmit = $derived(
    email.includes('@') && password.length >= 8 && agreed
  );

  function submit(): void {
    log(\`Submitted: \${email}\`);
    email = '';
    password = '';
    agreed = false;
  }

  // Demo: a small "preset" config driven by a typed record
  const presets: Record<string, BtnProps> = {
    save: { variant: 'primary', size: 'medium', children: (() => {}) as never },
    cancel: { variant: 'secondary', size: 'medium', children: (() => {}) as never },
    delete: { variant: 'danger', size: 'small', children: (() => {}) as never }
  };
  // Note: in real code the children snippet would be provided at render site.
  // This record demonstrates that BtnProps was successfully extracted.
  void presets;
</script>

<h1>Component Types &amp; Wrappers</h1>

<section>
  <h2>Button wrapper — extends HTMLButtonAttributes</h2>
  <p class="note">
    Accepts every native button attribute (type, disabled, form, aria-*, onclick...)
    plus our custom <code>variant</code> and <code>size</code>.
  </p>

  <div class="btn-row">
    <Button variant="primary" size="small" onclick={() => log('primary/small')}>
      Small Primary
    </Button>
    <Button variant="primary" size="medium" onclick={() => log('primary/medium')}>
      Medium Primary
    </Button>
    <Button variant="primary" size="large" onclick={() => log('primary/large')}>
      Large Primary
    </Button>
  </div>

  <div class="btn-row">
    <Button variant="secondary" onclick={() => log('secondary')}>
      Secondary
    </Button>
    <Button variant="danger" onclick={() => log('danger')}>
      Delete
    </Button>
    <Button variant="primary" disabled onclick={() => log('this should not fire')}>
      Disabled
    </Button>
    <Button
      variant="primary"
      type="submit"
      aria-label="Submit form"
      onclick={() => log('native HTML attrs forwarded')}
    >
      Submit
    </Button>
  </div>

  {#if clickLog.length > 0}
    <div class="log">
      {#each clickLog as entry, i (i)}
        <div>{entry}</div>
      {/each}
    </div>
  {/if}
</section>

<section>
  <h2>Input wrapper — extends HTMLInputAttributes</h2>
  <p class="note">
    Forwards every native input attribute; adds <code>label</code> and <code>error</code>
    decoration on top. Supports bind:value via $bindable.
  </p>

  <form onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <Input
      label="Email"
      type="email"
      placeholder="you@example.com"
      autocomplete="email"
      bind:value={email}
      error={emailError}
    />
    <Input
      label="Password"
      type="password"
      placeholder="At least 8 characters"
      autocomplete="new-password"
      bind:value={password}
      error={passwordError}
    />
    <label class="checkbox">
      <input type="checkbox" bind:checked={agreed} />
      I agree to the terms
    </label>
    <Button variant="primary" type="submit" disabled={!canSubmit}>
      Create Account
    </Button>
  </form>
</section>

<section>
  <h2>Component&lt;Props&gt; &amp; ComponentProps — reference</h2>
  <pre class="code"><code>{\`import type { Component, ComponentProps } from 'svelte';
import Button from './Button.svelte';

// Type a component reference (for stores of components, HOCs, etc.)
let current: Component<ButtonProps>;

// Extract props from a component type — no duplication
type Props = ComponentProps<typeof Button>;
// Props = HTMLButtonAttributes & { variant?: ...; size?: ...; children: Snippet }

// Use ComponentProps for typed factories
function makeButton(props: ComponentProps<typeof Button>) {
  return { component: Button, props };
}
\`}</code></pre>
</section>

<style>
  h1 { color: #2d3436; }
  section {
    margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa;
    border-radius: 8px;
  }
  h2 { margin-top: 0; color: #e17055; font-size: 1.1rem; }
  .note {
    margin: 0 0 0.75rem; font-size: 0.85rem; color: #636e72;
  }
  .note code {
    background: #dfe6e9; padding: 0.1rem 0.3rem; border-radius: 3px;
    font-size: 0.8rem;
  }
  .btn-row {
    display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;
    margin-bottom: 0.75rem;
  }
  .log {
    margin-top: 0.75rem; padding: 0.5rem; background: #2d3436;
    border-radius: 4px; font-family: monospace; font-size: 0.8rem;
    color: #dfe6e9;
  }
  form {
    display: flex; flex-direction: column; gap: 0.75rem;
    max-width: 400px;
  }
  .checkbox {
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 0.9rem; color: #2d3436;
  }
  .code {
    padding: 1rem; background: #2d3436; border-radius: 6px;
    overflow-x: auto; margin: 0;
  }
  .code code {
    color: #dfe6e9; font-size: 0.8rem; line-height: 1.5;
    font-family: monospace;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Button.svelte',
			content: `<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  // Intersection type: all native button attrs + our custom props.
  // rest will contain every native attribute we didn't destructure.
  type Props = HTMLButtonAttributes & {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    children: Snippet;
  };

  let {
    variant = 'primary',
    size = 'medium',
    children,
    class: className = '',
    ...rest
  }: Props = $props();
</script>

<button class="btn {variant} {size} {className}" {...rest}>
  {@render children()}
</button>

<style>
  .btn {
    border: none; cursor: pointer; font-weight: 600;
    border-radius: 6px; transition: all 0.15s;
    font-family: inherit;
  }
  .btn.small { padding: 0.3rem 0.7rem; font-size: 0.8rem; }
  .btn.medium { padding: 0.5rem 1rem; font-size: 0.95rem; }
  .btn.large { padding: 0.75rem 1.5rem; font-size: 1.1rem; }
  .btn.primary { background: #0984e3; color: white; }
  .btn.secondary { background: #636e72; color: white; }
  .btn.danger { background: #d63031; color: white; }
  .btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .btn:active:not(:disabled) { transform: translateY(0); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Input.svelte',
			content: `<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  // Extend native input attrs. value is $bindable so parents can use bind:value.
  type Props = HTMLInputAttributes & {
    label?: string;
    error?: string;
    value?: string;
  };

  let {
    label,
    error,
    value = $bindable(''),
    class: className = '',
    ...rest
  }: Props = $props();

  const inputId = $props.id();
</script>

<div class="field {className}">
  {#if label}
    <label for={inputId}>{label}</label>
  {/if}
  <input
    id={inputId}
    bind:value
    class:has-error={!!error}
    aria-invalid={!!error}
    {...rest}
  />
  {#if error}
    <span class="error" role="alert">{error}</span>
  {/if}
</div>

<style>
  .field {
    display: flex; flex-direction: column; gap: 0.25rem;
  }
  label {
    font-size: 0.8rem; font-weight: 600; color: #2d3436;
    text-transform: uppercase; letter-spacing: 0.04em;
  }
  input {
    padding: 0.5rem 0.7rem; border: 1px solid #dfe6e9;
    border-radius: 6px; font-size: 0.95rem; font-family: inherit;
    transition: border-color 0.15s;
  }
  input:focus {
    outline: none; border-color: #0984e3;
  }
  input.has-error {
    border-color: #d63031;
  }
  .error {
    font-size: 0.75rem; color: #d63031;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
