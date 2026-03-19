import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-8',
		title: 'Special Elements',
		phase: 5,
		module: 15,
		lessonIndex: 8
	},
	description: `Svelte provides special elements that interact with the browser environment beyond the component's own DOM. <svelte:window> lets you listen to window events and bind to window properties like scrollY or innerWidth. <svelte:document> does the same for document-level events like visibilitychange.

<svelte:element> renders a dynamic HTML tag determined at runtime — useful when you need the tag to change based on props (heading levels, semantic elements). <svelte:body> attaches event listeners to document.body, and <svelte:head> adds elements to the document <head>.`,
	objectives: [
		'Bind to window properties with <svelte:window bind:scrollY>',
		'Render dynamic HTML tags with <svelte:element this={tag}>',
		'Listen to document events with <svelte:document>',
		'Use <svelte:head> to manage document head content'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let scrollY: number = $state(0);
  let innerWidth: number = $state(0);
  let innerHeight: number = $state(0);
  let online: boolean = $state(true);
  let visible: boolean = $state(true);
  let headingLevel: number = $state(2);
  let dynamicTag: string = $state('div');
  let pageTitle: string = $state('Special Elements Demo');
  let keyPressed: string = $state('');

  function handleKeyDown(e: KeyboardEvent): void {
    keyPressed = e.key;
  }

  function handleVisibility(): void {
    visible = document.visibilityState === 'visible';
  }

  const tagOptions = ['div', 'section', 'article', 'aside', 'main', 'span'];

  let scrollPercent = $derived(
    typeof document !== 'undefined'
      ? Math.round((scrollY / (document.body.scrollHeight - innerHeight)) * 100) || 0
      : 0
  );

  let sizeLabel = $derived(
    innerWidth < 640 ? 'Mobile' : innerWidth < 1024 ? 'Tablet' : 'Desktop'
  );
</script>

<!-- svelte:window — bind to window properties and events -->
<svelte:window
  bind:scrollY
  bind:innerWidth
  bind:innerHeight
  bind:online
  onkeydown={handleKeyDown}
/>

<!-- svelte:document — listen for document-level events -->
<svelte:document onvisibilitychange={handleVisibility} />

<!-- svelte:head — inject into document head -->
<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content="Svelte special elements demo" />
</svelte:head>

<div class="scroll-indicator" style="width: {scrollPercent}%"></div>

<h1>Special Elements</h1>

<section>
  <h2>&lt;svelte:window&gt;</h2>
  <div class="stats">
    <div class="stat">
      <span class="label">Scroll Y</span>
      <span class="value">{Math.round(scrollY)}px</span>
    </div>
    <div class="stat">
      <span class="label">Viewport</span>
      <span class="value">{innerWidth} x {innerHeight}</span>
    </div>
    <div class="stat">
      <span class="label">Breakpoint</span>
      <span class="value">{sizeLabel}</span>
    </div>
    <div class="stat">
      <span class="label">Online</span>
      <span class="value" class:success={online} class:error={!online}>
        {online ? 'Yes' : 'No'}
      </span>
    </div>
    <div class="stat">
      <span class="label">Last Key</span>
      <span class="value">{keyPressed || '(none)'}</span>
    </div>
  </div>
</section>

<section>
  <h2>&lt;svelte:document&gt;</h2>
  <p>
    Tab visibility:
    <span class:success={visible} class:error={!visible}>
      {visible ? 'Visible' : 'Hidden'}
    </span>
    — try switching tabs!
  </p>
</section>

<section>
  <h2>&lt;svelte:element&gt; — Dynamic Tag</h2>
  <div class="controls">
    <label>
      Heading level:
      <select bind:value={headingLevel}>
        {#each [1, 2, 3, 4, 5, 6] as level}
          <option value={level}>h{level}</option>
        {/each}
      </select>
    </label>
    <label>
      Container tag:
      <select bind:value={dynamicTag}>
        {#each tagOptions as tag}
          <option value={tag}>&lt;{tag}&gt;</option>
        {/each}
      </select>
    </label>
  </div>

  <svelte:element this="h{headingLevel}" class="dynamic-heading">
    I'm an h{headingLevel} element
  </svelte:element>

  <svelte:element this={dynamicTag} class="dynamic-container">
    I'm rendered as a &lt;{dynamicTag}&gt; element.
    Inspect me in DevTools!
  </svelte:element>
</section>

<section>
  <h2>&lt;svelte:head&gt;</h2>
  <label>
    Page title:
    <input type="text" bind:value={pageTitle} />
  </label>
  <p class="hint">Check your browser tab — the title updates live!</p>
</section>

<!-- Extra content to enable scrolling -->
<div class="spacer">
  <p>Scroll down to see scroll tracking in action.</p>
  {#each Array(20) as _, i}
    <div class="scroll-block">Block {i + 1}</div>
  {/each}
</div>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #00b894; font-size: 1.1rem; }
  .scroll-indicator {
    position: fixed; top: 0; left: 0; height: 3px;
    background: #00b894; z-index: 100; transition: width 0.1s;
  }
  .stats { display: flex; gap: 1rem; flex-wrap: wrap; }
  .stat {
    padding: 0.5rem 1rem; background: white; border-radius: 6px;
    border: 1px solid #dfe6e9;
  }
  .label { display: block; font-size: 0.75rem; color: #636e72; text-transform: uppercase; }
  .value { font-weight: 700; font-size: 1.1rem; }
  .success { color: #00b894; }
  .error { color: #d63031; }
  .controls { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
  select { padding: 0.4rem; border-radius: 4px; border: 1px solid #ddd; }
  input { padding: 0.4rem; border-radius: 4px; border: 1px solid #ddd; width: 250px; }
  .dynamic-heading { color: #00b894; }
  .dynamic-container {
    padding: 1rem; border: 2px dashed #00b894; border-radius: 6px;
    margin-top: 0.5rem;
  }
  .hint { font-size: 0.85rem; color: #636e72; }
  .spacer { margin-top: 2rem; }
  .scroll-block {
    padding: 1rem; margin-bottom: 0.5rem; background: #dfe6e9;
    border-radius: 4px; text-align: center; color: #636e72;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
