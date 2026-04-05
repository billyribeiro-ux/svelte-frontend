import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-9',
		title: 'Dynamic Classes & Styles',
		phase: 5,
		module: 15,
		lessonIndex: 9
	},
	description: `Svelte 5 offers expressive ways to apply dynamic classes and styles to elements. The class={[...]} array syntax lets you conditionally include class names by mixing strings, booleans, and expressions — falsy values are automatically filtered out. This is the April 2026 best practice and fully replaces the older class:directive={condition} form, which is now considered legacy.

The style: directive applies individual CSS properties reactively, and you can pass CSS custom properties to child components using --prop syntax directly on the component tag. Together, these features eliminate the need for class name utility libraries and make component theming straightforward.`,
	objectives: [
		'Use the class={[...]} array syntax for conditional class application',
		'Apply individual CSS properties reactively with style:property',
		'Pass CSS custom properties to child components with --prop syntax',
		'Build themeable components using CSS custom properties'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let size: 'small' | 'medium' | 'large' = $state('medium');
  let variant: 'primary' | 'secondary' | 'danger' = $state('primary');
  let rounded: boolean = $state(true);
  let outlined: boolean = $state(false);
  let disabled: boolean = $state(false);

  let brandColor: string = $state('#6c5ce7');
  let textColor: string = $state('#ffffff');
  let fontSize: number = $state(16);
  let padding: number = $state(12);

  let items = $state([
    { id: 1, label: 'Dashboard', active: true },
    { id: 2, label: 'Profile', active: false },
    { id: 3, label: 'Settings', active: false },
    { id: 4, label: 'Logout', active: false },
  ]);

  function setActive(id: number): void {
    items = items.map((item) => ({ ...item, active: item.id === id }));
  }
</script>

<h1>Dynamic Classes & Styles</h1>

<div class="best-practice">
  <strong>Best practice (April 2026):</strong> Prefer
  <code>class=&#123;[cond1 &amp;&amp; 'a', cond2 &amp;&amp; 'b']&#125;</code> arrays over the
  legacy <code>class:a=&#123;cond1&#125; class:b=&#123;cond2&#125;</code> directive.
  The array form composes with props, supports spread, and matches the
  standard clsx pattern developers already know.
</div>

<section>
  <h2>class=&#123;[...]&#125; Array Syntax</h2>
  <div class="controls">
    <label>Size:
      <select bind:value={size}>
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>
    </label>
    <label>Variant:
      <select bind:value={variant}>
        <option value="primary">Primary</option>
        <option value="secondary">Secondary</option>
        <option value="danger">Danger</option>
      </select>
    </label>
    <label><input type="checkbox" bind:checked={rounded} /> Rounded</label>
    <label><input type="checkbox" bind:checked={outlined} /> Outlined</label>
    <label><input type="checkbox" bind:checked={disabled} /> Disabled</label>
  </div>

  <!-- class={[...]} — falsy values are filtered out automatically -->
  <button
    class={[
      'btn',
      size,
      variant,
      rounded && 'rounded',
      outlined && 'outlined',
      disabled && 'disabled'
    ]}
    {disabled}
  >
    Dynamic Button
  </button>

  <pre class="code">class=&#123;['btn', '{size}', '{variant}'{rounded ? ", 'rounded'" : ''}{outlined ? ", 'outlined'" : ''}{disabled ? ", 'disabled'" : ''}]&#125;</pre>
</section>

<section>
  <h2>style: Directive</h2>
  <div class="controls">
    <label>Brand Color: <input type="color" bind:value={brandColor} /></label>
    <label>Text Color: <input type="color" bind:value={textColor} /></label>
    <label>Font Size: <input type="range" min="12" max="28" bind:value={fontSize} /> {fontSize}px</label>
    <label>Padding: <input type="range" min="4" max="32" bind:value={padding} /> {padding}px</label>
  </div>

  <div
    class="styled-box"
    style:background-color={brandColor}
    style:color={textColor}
    style:font-size="{fontSize}px"
    style:padding="{padding}px"
    style:border-radius="{padding / 2}px"
  >
    Styled with style: directives
  </div>
</section>

<section>
  <h2>--css-prop on Components (theming)</h2>
  <div
    class="themed-nav"
    style="--brand: {brandColor}; --text: {textColor}; --nav-radius: {rounded ? '8px' : '0px'}"
  >
    {#each items as item (item.id)}
      <button
        class={['nav-item', item.active && 'active']}
        onclick={() => setActive(item.id)}
      >
        {item.label}
      </button>
    {/each}
  </div>
  <p class="hint">The navigation uses --brand and --text CSS custom properties for theming.</p>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #6c5ce7; font-size: 1.1rem; }
  .controls { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; align-items: center; }
  label { display: flex; align-items: center; gap: 0.3rem; font-size: 0.9rem; }
  select, input[type="color"] { padding: 0.3rem; border-radius: 4px; border: 1px solid #ddd; }

  .btn {
    border: 2px solid transparent; cursor: pointer; font-weight: 600;
    transition: all 0.2s;
  }
  .btn.small { padding: 0.3rem 0.6rem; font-size: 0.8rem; }
  .btn.medium { padding: 0.5rem 1rem; font-size: 1rem; }
  .btn.large { padding: 0.75rem 1.5rem; font-size: 1.2rem; }
  .btn.primary { background: #6c5ce7; color: white; }
  .btn.secondary { background: #636e72; color: white; }
  .btn.danger { background: #d63031; color: white; }
  .btn.rounded { border-radius: 20px; }
  .btn.outlined { background: transparent; border-color: currentColor; }
  .btn.outlined.primary { color: #6c5ce7; }
  .btn.outlined.secondary { color: #636e72; }
  .btn.outlined.danger { color: #d63031; }
  .btn.disabled { opacity: 0.5; cursor: not-allowed; }

  .code {
    margin-top: 0.75rem; padding: 0.5rem; background: #2d3436; color: #dfe6e9;
    border-radius: 4px; font-size: 0.8rem; overflow-x: auto;
  }

  .styled-box {
    text-align: center; font-weight: 600; transition: all 0.3s;
    margin-top: 0.5rem;
  }

  .themed-nav {
    display: flex; gap: 2px; border-radius: var(--nav-radius, 8px);
    overflow: hidden; border: 1px solid var(--brand, #6c5ce7);
  }
  .nav-item {
    flex: 1; padding: 0.6rem; border: none; background: transparent;
    color: var(--brand, #6c5ce7); cursor: pointer; font-weight: 600;
    transition: all 0.2s;
  }
  .nav-item.active {
    background: var(--brand, #6c5ce7); color: var(--text, white);
  }
  .nav-item:hover:not(.active) { background: #f0f0f0; }
  .hint { font-size: 0.85rem; color: #636e72; margin-top: 0.5rem; }
  .best-practice {
    margin: 0 0 1rem;
    padding: 0.75rem 0.9rem;
    background: #f0fdf4;
    border-left: 3px solid #16a34a;
    border-radius: 6px;
    font-size: 0.88rem;
    color: #14532d;
  }
  .best-practice code { background: #bbf7d0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
