import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '5-2',
		title: 'The DOM & Hydration',
		phase: 2,
		module: 5,
		lessonIndex: 2
	},
	description: `The DOM (Document Object Model) is the browser's live representation of your HTML as a tree of JavaScript objects. Every element you see on screen is a node in this tree, and every node has parents, children, and siblings — just like a family tree.

When Svelte renders your component, it doesn't hand you a string of HTML — it creates real DOM nodes and keeps a reference to them. You write declarative templates and Svelte surgically updates only the parts that change. But sometimes you need direct access to a DOM element (for measuring size, focusing inputs, scrolling, or integrating third-party libraries). That's where **bind:this** comes in.

**Hydration** is what happens when a server-rendered page "wakes up" in the browser. The server sends fully formed HTML for fast first paint, and then Svelte attaches event listeners and reactivity to the *existing* nodes instead of re-creating them from scratch. Same DOM, plus interactivity.`,
	objectives: [
		'Understand the DOM as a live tree of JavaScript objects the browser builds from your HTML',
		'Use bind:this to get a reference to a real DOM element',
		'Measure elements with getBoundingClientRect and react to size changes',
		'Explain server-side rendering and hydration, and why Svelte separates them',
		'Know common DOM traversal and inspection APIs: children, parentNode, tagName, etc.'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === Measured box ===
  // bind:this stores the actual DOM element in this variable.
  // It's null on first render (the element doesn't exist yet),
  // so any code that reads it must guard for null.
  let boxElement = $state(null);
  let boxWidth = $state(0);
  let boxHeight = $state(0);
  let boxTop = $state(0);
  let boxLeft = $state(0);

  let boxColor = $state('#ff3e00');
  let boxSize = $state(220);
  let boxPadding = $state(16);

  // An effect re-runs whenever any state it reads changes.
  // We read boxSize and boxPadding here, so every time they change,
  // the effect fires and re-measures the DOM.
  $effect(() => {
    // Track the dependencies explicitly so the effect re-runs.
    boxSize;
    boxPadding;

    if (!boxElement) return;

    // requestAnimationFrame waits until the browser has applied
    // the style changes to the DOM, so our measurement is accurate.
    const id = requestAnimationFrame(() => {
      if (!boxElement) return;
      const rect = boxElement.getBoundingClientRect();
      boxWidth = Math.round(rect.width);
      boxHeight = Math.round(rect.height);
      boxTop = Math.round(rect.top);
      boxLeft = Math.round(rect.left);
    });

    return () => cancelAnimationFrame(id);
  });

  // === Inspect a paragraph's DOM properties ===
  let para = $state(null);
  let paraInfo = $state({ tag: '', childCount: 0, textLength: 0, className: '' });

  function inspectParagraph() {
    if (!para) return;
    paraInfo = {
      tag: para.tagName,
      childCount: para.childNodes.length,
      textLength: (para.textContent || '').length,
      className: para.className
    };
  }

  // === Focus example ===
  let nameInput = $state(null);
  function focusInput() {
    nameInput?.focus();
    nameInput?.select();
  }

  // === Hydration explainer toggle ===
  let hydrationStep = $state(0);
  const hydrationSteps = [
    {
      title: 'Step 1 — Server renders HTML',
      body: 'Your Svelte component is rendered to a plain HTML string on the server. No JavaScript yet.',
      code: '<button class="counter">Count: 0</button>'
    },
    {
      title: 'Step 2 — Browser receives HTML',
      body: 'The browser parses the HTML and paints it. The user sees something immediately — but buttons do nothing yet.',
      code: '<!-- visible but inert -->\\n<button class="counter">Count: 0</button>'
    },
    {
      title: 'Step 3 — JavaScript downloads',
      body: 'In parallel, the JS bundle (Svelte runtime + your components) downloads and parses.',
      code: '// app.js arrives\\nimport { hydrate } from "svelte";'
    },
    {
      title: 'Step 4 — Hydration',
      body: 'Svelte walks the existing DOM and attaches event listeners and reactivity. Same nodes — now alive.',
      code: 'hydrate(App, { target: document.body });'
    },
    {
      title: 'Step 5 — Interactive',
      body: 'The button now works. Click it and Svelte updates just the text node inside, not the whole button.',
      code: '<button onclick={() => count++}>Count: {count}</button>'
    }
  ];
  let currentStep = $derived(hydrationSteps[hydrationStep]);
</script>

<h1>The DOM &amp; Hydration</h1>

<p class="lead">
  The <strong>DOM</strong> is the browser's living, breathing copy of your HTML.
  Every tag you write becomes a JavaScript object with properties, methods, and
  connections to its parent and children. Svelte manages it for you — but you can
  still reach in with <code>bind:this</code> when you need to.
</p>

<section>
  <h2>bind:this — Grab a Real DOM Element</h2>

  <div class="controls">
    <label>
      Size: {boxSize}px
      <input type="range" min="80" max="400" bind:value={boxSize} />
    </label>
    <label>
      Padding: {boxPadding}px
      <input type="range" min="0" max="60" bind:value={boxPadding} />
    </label>
    <label>
      Color:
      <input type="color" bind:value={boxColor} />
    </label>
  </div>

  <div
    class="measured-box"
    bind:this={boxElement}
    style="width: {boxSize}px; height: {boxSize}px; padding: {boxPadding}px; background: {boxColor};"
  >
    <span>{boxWidth} &times; {boxHeight}</span>
  </div>

  <div class="measurements">
    <div><span class="m-label">width</span><span class="m-val">{boxWidth}px</span></div>
    <div><span class="m-label">height</span><span class="m-val">{boxHeight}px</span></div>
    <div><span class="m-label">top</span><span class="m-val">{boxTop}px</span></div>
    <div><span class="m-label">left</span><span class="m-val">{boxLeft}px</span></div>
  </div>

  <p class="note">
    We <code>bind:this={'{boxElement}'}</code> and then call
    <code>getBoundingClientRect()</code> inside an <code>$effect</code>.
    The effect re-runs whenever <code>boxSize</code> or <code>boxPadding</code> change.
  </p>
</section>

<section>
  <h2>DOM Tree Visualisation</h2>
  <p>The browser stores your HTML as a tree. Every element is a node.</p>
  <pre class="tree">
document
 &#9492;&#9472; html
     &#9500;&#9472; head
     &#9474;   &#9492;&#9472; title
     &#9492;&#9472; body
         &#9492;&#9472; div.app
             &#9500;&#9472; h1
             &#9500;&#9472; section
             &#9474;   &#9492;&#9472; div.measured-box    &larr; bind:this targets this node
             &#9474;       &#9492;&#9472; span             &larr; text: "{boxWidth} x {boxHeight}"
             &#9492;&#9472; section
  </pre>
</section>

<section>
  <h2>Inspect a Node</h2>
  <p bind:this={para} class="demo-para" id="demo-para">
    This paragraph is a real DOM element. Click the button to inspect its properties.
  </p>
  <button onclick={inspectParagraph}>Inspect this paragraph</button>
  {#if paraInfo.tag}
    <table class="inspect">
      <tbody>
        <tr><td>tagName</td><td><code>{paraInfo.tag}</code></td></tr>
        <tr><td>childNodes.length</td><td><code>{paraInfo.childCount}</code></td></tr>
        <tr><td>textContent.length</td><td><code>{paraInfo.textLength}</code></td></tr>
        <tr><td>className</td><td><code>{paraInfo.className || '(none)'}</code></td></tr>
      </tbody>
    </table>
  {/if}
</section>

<section>
  <h2>Imperative DOM Access: Focus</h2>
  <input bind:this={nameInput} type="text" placeholder="Click the button ->" class="focus-input" />
  <button onclick={focusInput}>Focus &amp; select</button>
  <p class="note">
    <code>input.focus()</code> is an imperative DOM method — you can't do it declaratively.
    <code>bind:this</code> lets you reach the underlying element to call it.
  </p>
</section>

<section class="hydration">
  <h2>What Is Hydration?</h2>
  <p>
    SvelteKit can render your component on the <strong>server</strong> into a string of HTML,
    send it to the browser, and then <strong>re-attach</strong> Svelte's reactivity to that
    already-existing markup. Step through the process:
  </p>

  <div class="steps">
    {#each hydrationSteps as step, i (i)}
      <button
        class="step-btn"
        class:active={hydrationStep === i}
        onclick={() => (hydrationStep = i)}
      >{i + 1}</button>
    {/each}
  </div>

  <div class="step-card">
    <h3>{currentStep.title}</h3>
    <p>{currentStep.body}</p>
    <pre class="code">{currentStep.code}</pre>
  </div>

  <div class="concept">
    <strong>Why do this?</strong>
    <ul>
      <li><strong>Fast first paint:</strong> users see content even before JS loads.</li>
      <li><strong>SEO:</strong> crawlers read real HTML, not an empty <code>&lt;div&gt;</code>.</li>
      <li><strong>Full interactivity:</strong> once JS runs, the page becomes a SPA.</li>
    </ul>
  </div>
</section>

<style>
  h1 { color: #333; }
  .lead { max-width: 720px; color: #444; }
  code {
    background: #f0f0f0;
    padding: 0.15rem 0.4rem;
    border-radius: 3px;
    font-size: 0.9em;
  }
  section {
    margin: 1.5rem 0;
    padding: 1rem;
    background: #fafafa;
    border-radius: 10px;
  }
  section h2 { margin-top: 0; }

  .controls {
    display: flex;
    gap: 1.25rem;
    margin: 0.5rem 0 0.75rem;
    flex-wrap: wrap;
  }
  .controls label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }

  .measured-box {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: background 0.2s;
    margin: 0.75rem 0;
    box-sizing: border-box;
  }
  .measured-box span {
    color: white;
    font-weight: bold;
    font-size: 1.1rem;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }

  .measurements {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 0.5rem;
    margin: 0.5rem 0;
  }
  .measurements > div {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 0.5rem;
    text-align: center;
  }
  .m-label {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    color: #888;
  }
  .m-val {
    font-weight: bold;
    font-family: monospace;
    font-size: 1rem;
    color: #333;
  }

  .tree {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 6px;
    font-size: 0.85rem;
    line-height: 1.5;
    white-space: pre;
    overflow-x: auto;
    margin: 0;
  }

  .demo-para {
    background: #eef2ff;
    padding: 0.75rem;
    border-radius: 6px;
    border-left: 4px solid #4f46e5;
  }
  .inspect { border-collapse: collapse; margin-top: 0.75rem; }
  .inspect td {
    padding: 0.3rem 0.75rem;
    border-bottom: 1px solid #eee;
    font-size: 0.85rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  button:hover { background: #4338ca; }

  .focus-input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    margin-right: 0.5rem;
    font-size: 0.9rem;
  }

  .note { font-size: 0.85rem; color: #666; font-style: italic; }

  .steps { display: flex; gap: 0.4rem; margin: 0.75rem 0; flex-wrap: wrap; }
  .step-btn {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 50%;
    background: #e5e7eb;
    color: #333;
    font-weight: bold;
  }
  .step-btn.active { background: #4f46e5; color: white; }
  .step-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
  }
  .step-card h3 { margin: 0 0 0.5rem; color: #4f46e5; }
  .code {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.6rem 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    overflow-x: auto;
    white-space: pre;
    margin: 0.5rem 0 0;
  }

  .concept {
    margin-top: 1rem;
    background: #e8f4fd;
    border-left: 4px solid #61affe;
    padding: 0.75rem 1rem;
    border-radius: 0 8px 8px 0;
  }
  .concept ul { margin: 0.4rem 0 0; padding-left: 1.2rem; }
  .concept li { margin: 0.2rem 0; font-size: 0.9rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
