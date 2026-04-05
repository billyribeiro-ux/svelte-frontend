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

  // ─── Additional dynamic examples ────────────────────────────
  // Progress ring driven by style:--progress
  let progress: number = $state(65);

  // Status list — each row computes classes from its state
  interface Status {
    id: number;
    label: string;
    level: 'ok' | 'warn' | 'error' | 'idle';
    pinned: boolean;
  }
  let statuses: Status[] = $state([
    { id: 1, label: 'Database', level: 'ok', pinned: true },
    { id: 2, label: 'Cache', level: 'warn', pinned: false },
    { id: 3, label: 'Queue worker', level: 'error', pinned: false },
    { id: 4, label: 'Cron jobs', level: 'idle', pinned: false },
    { id: 5, label: 'Web tier', level: 'ok', pinned: true }
  ]);

  function cycleLevel(id: number): void {
    const order: Status['level'][] = ['ok', 'warn', 'error', 'idle'];
    statuses = statuses.map((s) =>
      s.id === id
        ? { ...s, level: order[(order.indexOf(s.level) + 1) % order.length] }
        : s
    );
  }

  function togglePin(id: number): void {
    statuses = statuses.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s));
  }

  // Card that reacts to hover via class and inline CSS vars
  let hoveredCard: number | null = $state(null);
  const cards = [
    { id: 1, name: 'Starter', price: 9, color: '#0984e3' },
    { id: 2, name: 'Pro', price: 29, color: '#6c5ce7' },
    { id: 3, name: 'Enterprise', price: 99, color: '#e17055' }
  ];
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

<section>
  <h2>Progress ring — style:--progress drives everything</h2>
  <label>
    Progress: <input type="range" min="0" max="100" bind:value={progress} /> {progress}%
  </label>
  <div
    class="ring"
    style:--progress="{progress}%"
    style:--ring-color={progress < 30 ? '#d63031' : progress < 70 ? '#fdcb6e' : '#00b894'}
  >
    <span>{progress}%</span>
  </div>
</section>

<section>
  <h2>Status list — class arrays per-row</h2>
  <ul class="status-list">
    {#each statuses as s (s.id)}
      <li class={['status', s.level, s.pinned && 'pinned']}>
        <span class={['dot', s.level]}></span>
        <span class="name">{s.label}</span>
        <span class={['chip', s.level]}>{s.level.toUpperCase()}</span>
        <button onclick={() => togglePin(s.id)}>{s.pinned ? 'unpin' : 'pin'}</button>
        <button onclick={() => cycleLevel(s.id)}>cycle</button>
      </li>
    {/each}
  </ul>
</section>

<section>
  <h2>Price cards — hover drives CSS vars</h2>
  <div class="cards">
    {#each cards as card (card.id)}
      <div
        class={['pc', hoveredCard === card.id && 'hover']}
        style:--accent={card.color}
        onmouseenter={() => hoveredCard = card.id}
        onmouseleave={() => hoveredCard = null}
        role="button"
        tabindex="0"
      >
        <h3>{card.name}</h3>
        <p class="price">\${card.price}<span>/mo</span></p>
        <button class="cta">Choose</button>
      </div>
    {/each}
  </div>
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

  /* Progress ring */
  .ring {
    width: 140px; height: 140px; border-radius: 50%;
    background: conic-gradient(var(--ring-color, #6c5ce7) var(--progress, 0%), #dfe6e9 0);
    display: flex; align-items: center; justify-content: center;
    margin-top: 0.5rem; transition: background 0.2s;
  }
  .ring span {
    width: 110px; height: 110px; border-radius: 50%;
    background: white; display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 1.3rem; color: #2d3436;
  }

  /* Status list */
  .status-list { list-style: none; padding: 0; margin: 0; }
  .status {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.55rem 0.8rem; margin-bottom: 0.35rem;
    background: white; border-radius: 8px; border: 1px solid #dfe6e9;
  }
  .status.pinned { border-color: #6c5ce7; box-shadow: 0 0 0 2px rgba(108,92,231,0.1); }
  .dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot.ok { background: #00b894; }
  .dot.warn { background: #fdcb6e; }
  .dot.error { background: #d63031; }
  .dot.idle { background: #b2bec3; }
  .name { flex: 1; font-size: 0.9rem; color: #2d3436; }
  .chip { font-size: 0.68rem; padding: 0.15rem 0.5rem; border-radius: 999px; color: white; font-weight: 700; }
  .chip.ok { background: #00b894; }
  .chip.warn { background: #fdcb6e; color: #7c5a00; }
  .chip.error { background: #d63031; }
  .chip.idle { background: #b2bec3; }
  .status button {
    padding: 0.25rem 0.55rem; font-size: 0.72rem; background: #dfe6e9; color: #2d3436;
  }

  /* Price cards */
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; }
  .pc {
    padding: 1rem; background: white; border-radius: 10px;
    border: 2px solid #dfe6e9; text-align: center;
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }
  .pc.hover {
    transform: translateY(-4px);
    border-color: var(--accent);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--accent) 25%, transparent);
  }
  .pc h3 { margin: 0 0 0.25rem; color: var(--accent); }
  .pc .price { font-size: 1.5rem; font-weight: 800; color: #2d3436; margin: 0.25rem 0; }
  .pc .price span { font-size: 0.8rem; color: #636e72; font-weight: 400; }
  .pc .cta {
    background: var(--accent); color: white; padding: 0.45rem 1rem;
    border-radius: 6px; width: 100%; margin-top: 0.5rem;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
