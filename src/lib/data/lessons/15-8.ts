import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-8',
		title: 'Special Elements',
		phase: 5,
		module: 15,
		lessonIndex: 8
	},
	description: `Svelte ships a handful of "special" elements for talking to the browser environment beyond the component's own DOM tree:

• <svelte:window> listens to window-level events and binds to window properties (scrollY, innerWidth, innerHeight, online, ...).
• <svelte:document> does the same for document (visibilitychange, pointerlockchange, fullscreenchange).
• <svelte:body> attaches listeners to document.body — great for global mouse tracking.
• <svelte:head> injects into <head> for titles, meta tags, and preloads.
• <svelte:element> renders a dynamic HTML tag determined at runtime.
• <svelte:options> sets compiler options per file (runes, customElement, etc).

These cover every "I need to talk to something outside my component" use case in Svelte.`,
	objectives: [
		'Bind to window properties with <svelte:window bind:scrollY>',
		'Listen for document-level events with <svelte:document>',
		'Track body-relative mouse coordinates with <svelte:body>',
		'Manage document head with <svelte:head>',
		'Render runtime-determined tags with <svelte:element>'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Window bindings
  let scrollY: number = $state(0);
  let innerWidth: number = $state(0);
  let innerHeight: number = $state(0);
  let online: boolean = $state(true);
  let lastKey: string = $state('(none)');

  // Document state
  let visible: boolean = $state(true);
  let fullscreen: boolean = $state(false);

  // Body — mouse position
  let mouseX: number = $state(0);
  let mouseY: number = $state(0);

  // Head — dynamic title
  let pageTitle: string = $state('Special Elements Demo');
  let description: string = $state('Svelte 5 special elements showcase');

  // Dynamic element
  let headingLevel: 1 | 2 | 3 | 4 | 5 | 6 = $state(2);
  let containerTag: 'div' | 'section' | 'article' | 'aside' | 'main' | 'nav' = $state('section');

  function handleKey(e: KeyboardEvent): void {
    lastKey = e.key;
  }

  function handleVisibility(): void {
    visible = document.visibilityState === 'visible';
  }

  function handleFullscreenChange(): void {
    fullscreen = Boolean(document.fullscreenElement);
  }

  function handleMouse(e: MouseEvent): void {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function toggleFullscreen(): Promise<void> {
    return document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();
  }

  let scrollPercent = $derived(
    typeof document !== 'undefined' && document.body
      ? Math.min(100, Math.max(0, Math.round((scrollY / Math.max(1, document.body.scrollHeight - innerHeight)) * 100)))
      : 0
  );

  let breakpoint = $derived(
    innerWidth < 640 ? 'Mobile' : innerWidth < 1024 ? 'Tablet' : 'Desktop'
  );
</script>

<!-- svelte:window — window-level events and bindings -->
<svelte:window
  bind:scrollY
  bind:innerWidth
  bind:innerHeight
  bind:online
  onkeydown={handleKey}
/>

<!-- svelte:document — document-level events -->
<svelte:document
  onvisibilitychange={handleVisibility}
  onfullscreenchange={handleFullscreenChange}
/>

<!-- svelte:body — body-level events -->
<svelte:body onmousemove={handleMouse} />

<!-- svelte:head — inject into <head> -->
<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={description} />
</svelte:head>

<!-- Global scroll progress indicator -->
<div class="scroll-progress" style="width: {scrollPercent}%"></div>

<!-- Mouse follower -->
<div
  class="mouse-dot"
  style="left: {mouseX}px; top: {mouseY}px"
  aria-hidden="true"
></div>

<h1>Special Elements</h1>

<section>
  <h2>&lt;svelte:window&gt;</h2>
  <div class="stats">
    <div class="stat">
      <span class="label">scroll Y</span>
      <span class="value">{Math.round(scrollY)}px</span>
    </div>
    <div class="stat">
      <span class="label">viewport</span>
      <span class="value">{innerWidth} × {innerHeight}</span>
    </div>
    <div class="stat">
      <span class="label">breakpoint</span>
      <span class="value">{breakpoint}</span>
    </div>
    <div class="stat">
      <span class="label">online</span>
      <span class="value" class:good={online} class:bad={!online}>
        {online ? 'yes' : 'no'}
      </span>
    </div>
    <div class="stat">
      <span class="label">last key</span>
      <span class="value mono">{lastKey}</span>
    </div>
  </div>
</section>

<section>
  <h2>&lt;svelte:document&gt;</h2>
  <p>
    Tab visibility:
    <span class:good={visible} class:bad={!visible}>
      {visible ? 'visible' : 'hidden (switch tabs)'}
    </span>
  </p>
  <p>
    Fullscreen:
    <span class:good={fullscreen}>{fullscreen ? 'yes' : 'no'}</span>
    <button onclick={toggleFullscreen}>
      {fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    </button>
  </p>
</section>

<section>
  <h2>&lt;svelte:body&gt;</h2>
  <p>
    Mouse position (document-relative):
    <code>({mouseX}, {mouseY})</code>
  </p>
  <p class="hint">Move your mouse anywhere on the page — the dot follows.</p>
</section>

<section>
  <h2>&lt;svelte:head&gt;</h2>
  <label>
    Tab title:
    <input type="text" bind:value={pageTitle} />
  </label>
  <label>
    Meta description:
    <input type="text" bind:value={description} />
  </label>
  <p class="hint">Look at your browser tab — the title updates live.</p>
</section>

<section>
  <h2>&lt;svelte:element&gt;</h2>
  <div class="control-row">
    <label>
      Heading level:
      <select bind:value={headingLevel}>
        {#each [1, 2, 3, 4, 5, 6] as lvl (lvl)}
          <option value={lvl}>h{lvl}</option>
        {/each}
      </select>
    </label>
    <label>
      Container tag:
      <select bind:value={containerTag}>
        {#each ['div', 'section', 'article', 'aside', 'main', 'nav'] as t (t)}
          <option value={t}>&lt;{t}&gt;</option>
        {/each}
      </select>
    </label>
  </div>

  <svelte:element this={\`h\${headingLevel}\`} class="dyn-heading">
    I am currently rendered as an h{headingLevel}
  </svelte:element>

  <svelte:element this={containerTag} class="dyn-container">
    I am a &lt;{containerTag}&gt; — inspect me with DevTools.
  </svelte:element>
</section>

<!-- Spacer content so scroll-tracking is demonstrable -->
<section class="spacer">
  <h2>Scroll tracker fodder</h2>
  <p class="hint">The strip at the very top is powered by <code>bind:scrollY</code>.</p>
  {#each Array(12) as _, i (i)}
    <div class="block">Block {i + 1}</div>
  {/each}
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 10px; }
  h2 { margin: 0 0 0.5rem; color: #00b894; font-size: 1.05rem; }
  p { font-size: 0.9rem; color: #636e72; margin: 0.35rem 0; }
  .hint { font-size: 0.82rem; color: #95a5a6; }

  .scroll-progress {
    position: fixed; top: 0; left: 0; height: 3px;
    background: linear-gradient(90deg, #00b894, #74b9ff); z-index: 1000;
    transition: width 0.05s linear;
  }
  .mouse-dot {
    position: fixed; width: 10px; height: 10px; border-radius: 50%;
    background: rgba(0, 184, 148, 0.6); pointer-events: none; z-index: 999;
    transform: translate(-50%, -50%); transition: none;
  }

  .stats { display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .stat {
    padding: 0.5rem 0.85rem; background: white; border-radius: 8px;
    border: 1px solid #dfe6e9; min-width: 110px;
  }
  .label { display: block; font-size: 0.7rem; color: #636e72; text-transform: uppercase; font-weight: 700; }
  .value { font-size: 1rem; font-weight: 700; color: #2d3436; }
  .value.mono { font-family: ui-monospace, monospace; }
  .good { color: #00b894; font-weight: 700; }
  .bad { color: #d63031; font-weight: 700; }

  button {
    padding: 0.35rem 0.8rem; border: none; border-radius: 4px;
    background: #00b894; color: white; cursor: pointer; font-weight: 600; font-size: 0.82rem;
    margin-left: 0.5rem;
  }
  button:hover { background: #00a074; }

  label { display: block; margin-bottom: 0.5rem; font-size: 0.88rem; color: #2d3436; }
  input[type="text"] { padding: 0.4rem 0.6rem; border: 1px solid #dfe6e9; border-radius: 4px; width: 300px; margin-left: 0.4rem; }
  select { padding: 0.3rem 0.5rem; border: 1px solid #dfe6e9; border-radius: 4px; margin-left: 0.4rem; }

  .control-row { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.75rem; }

  .dyn-heading { color: #00b894; margin: 0.5rem 0; }
  .dyn-container {
    display: block; padding: 1rem; border: 2px dashed #00b894;
    border-radius: 6px; margin-top: 0.5rem; color: #2d3436;
  }

  .spacer { min-height: 800px; }
  .block {
    padding: 0.75rem; margin-bottom: 0.5rem; background: #dfe6e9;
    border-radius: 4px; color: #636e72; text-align: center;
  }
  code { background: #e0f7f2; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
