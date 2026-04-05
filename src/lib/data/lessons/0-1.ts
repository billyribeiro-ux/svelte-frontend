import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-1',
		title: 'Set Up Your Machine',
		phase: 1,
		module: 0,
		lessonIndex: 1
	},
	description: `Welcome to Svelte PE7 Mastery! Before we write any JavaScript, we need to make sure your computer is ready to build real web applications. This lesson is about setting the stage — nothing fancy yet, just a friendly checklist so you know your tools work.

Why do we need special tools at all? A modern website is more than a single HTML file. It is assembled from many smaller pieces by programs that run on your computer. Those programs need a runtime called **Node.js**. Think of Node.js like the engine under the hood of a car: you do not look at it every day, but nothing moves without it. We will also use a **code editor** (VS Code, Cursor, or similar) where we actually type our code.

In a real project on your own machine you would run a command like \`npx sv create my-app\` to scaffold a brand new SvelteKit project. In this course, we have already done that for you: every lesson gives you a live preview on the right side of the screen, so you can focus purely on learning the language and the framework. Edit the file, save, and the preview updates instantly.

A quick note for AI-tooling fans: if you use Cursor, Claude Code, or OpenCode, the modern Svelte CLI (sv 0.12.6+) can scaffold MCP integration files into an \`.opencode/\` folder for you — that lets the AI "see" the official Svelte docs while it codes with you. Not required for this course, just a nice-to-have.

Do not worry if this all feels very new. Every expert started exactly where you are. The only goal of Lesson 1 is: **see your changes appear in the preview panel.** That is it. Let us make the page say hello.`,
	objectives: [
		'Understand what Node.js is and why Svelte projects need it',
		'Recognize the basic anatomy of a .svelte file (markup + optional style)',
		'Know the core tools: Node, pnpm, VS Code, Svelte extension, browser devtools',
		'Spot and fix a small intentional bug in the markup',
		'Preview the Phase 1 learning roadmap',
		'Experiment with a live colour-customization playground powered by CSS variables'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // =====================================================
  // Lesson 0-1 — Set Up Your Machine
  // -----------------------------------------------------
  // You do not need to understand every line in this
  // <script> block yet. We will unpack each idea in the
  // lessons ahead. For now: just run it, read the notes,
  // and play with the colour picker at the bottom.
  // =====================================================

  // A small piece of reactive state that holds our
  // current accent colour. "Reactive" means: whenever we
  // assign a new value to it, every place in the markup
  // that uses it will update automatically. Magic!
  let accent = $state('#ff3e00');

  // A handful of preset colours the user can pick from.
  // Each preset has a friendly name and a hex value.
  const presets = [
    { name: 'Svelte Orange', hex: '#ff3e00' },
    { name: 'Ocean Blue',    hex: '#0ea5e9' },
    { name: 'Forest Green',  hex: '#16a34a' },
    { name: 'Royal Purple',  hex: '#7c3aed' },
    { name: 'Rose Pink',     hex: '#ec4899' },
    { name: 'Sunny Yellow',  hex: '#eab308' }
  ];

  function pick(hex) {
    accent = hex;
  }

  // ------------------------------------------------------
  // Spot the bug!
  // ------------------------------------------------------
  // The greeting below has an intentional typo: "Helo"
  // (one L) instead of "Hello". Find it in the markup
  // a little further down and fix it. When the string
  // equals "Hello" exactly, the badge will flip to a
  // happy green "yes".
  let greeting = $state('Helo'); // <-- FIX ME (add the missing L)
  let bugFixed = $derived(greeting === 'Hello');
</script>

<!--
  ===== A .svelte file has three sections =====
    1. <script>   JavaScript / state / functions
    2. markup     HTML-like tags (this middle part)
    3. <style>    CSS scoped to THIS component only

  Try editing any text below and watch the preview refresh.
-->

<!-- The style="--accent: {accent}" line sets a CSS custom
     property on this element. Every CSS rule below that
     reads var(--accent) will pick up whatever colour we
     currently have in state. This is how we make the whole
     page theme-able with ONE reactive variable. -->
<div class="page" style="--accent: {accent}">

  <h1>Hello, World!</h1>
  <p class="lead">Welcome to Svelte PE7 Mastery.</p>
  <p>This is your very first Svelte component.</p>

  <!-- ===== Tool checklist ===== -->
  <section class="card">
    <h2>Your Toolbox</h2>
    <p class="muted">
      The course preview runs everything for you, but on your own
      machine you will want these installed:
    </p>
    <ul class="tools">
      <li><strong>Node.js</strong> (v20 or newer) — the JavaScript runtime that powers the build</li>
      <li><strong>pnpm</strong> — a fast, disk-friendly package manager (npm and yarn also work)</li>
      <li><strong>VS Code</strong> or <strong>Cursor</strong> — a modern code editor</li>
      <li><strong>Svelte for VS Code</strong> extension — syntax highlighting, errors, autocomplete</li>
      <li><strong>Browser devtools</strong> — right-click the page → Inspect, for the console and element inspector</li>
      <li><em>Optional:</em> the <strong>Svelte DevTools</strong> browser extension for inspecting components</li>
    </ul>
  </section>

  <!-- ===== About Me card — edit your own info! ===== -->
  <section class="card">
    <h2>About Me</h2>
    <p><strong>Name:</strong> Future Svelte Developer</p>
    <p><strong>Learning:</strong> Svelte 5, SvelteKit, JavaScript</p>
    <p><strong>Goal:</strong> Build awesome web apps</p>
  </section>

  <!-- ===== Spot-the-bug mini exercise ===== -->
  <section class="card">
    <h2>Spot the bug</h2>
    <p class="muted">
      There is an intentional typo in the line marked
      <code>// FIX ME</code> at the top of the script. The
      greeting is missing a letter. Fix the spelling and the
      badge below will flip to green.
    </p>
    <p>Current greeting: <strong>"{greeting}"</strong></p>
    <p>
      Bug fixed?
      <span class="badge" class:ok={bugFixed}>
        {bugFixed ? 'yes — nicely done!' : 'no, still broken'}
      </span>
    </p>
    <p class="tiny">
      Hint: "Helo" is missing a letter. The correct English word
      has two of the same letter in a row.
    </p>
  </section>

  <!-- ===== Phase 1 progress tracker ===== -->
  <section class="card">
    <h2>What you will learn in Phase 1</h2>
    <p class="muted">
      Here is the road ahead. Every lesson is a small step —
      you do not have to master everything at once.
    </p>
    <ol class="roadmap">
      <li><strong>Set up your machine</strong> (you are here!)</li>
      <li>Your first SvelteKit project &amp; reactivity with <code>$state</code></li>
      <li>console.log and leaving helpful comments</li>
      <li>Variables, numbers, strings, booleans</li>
      <li>if / else and conditional markup</li>
      <li>Loops with <code>{'{#each}'}</code></li>
      <li>Functions and event handlers</li>
      <li>Components, props, and composition</li>
    </ol>
  </section>

  <!-- ===== Colour playground ===== -->
  <section class="card playground">
    <h2>Colour playground</h2>
    <p class="muted">
      Click a preset or drag the picker — the accent colour for
      this whole page is stored in <code>$state</code> and applied
      via a CSS custom property. Watch the headings, borders and
      buttons all update together.
    </p>

    <div class="swatches">
      {#each presets as preset (preset.hex)}
        <button
          class="swatch"
          style="background: {preset.hex}"
          onclick={() => pick(preset.hex)}
          aria-label={preset.name}
          title={preset.name}
        ></button>
      {/each}
    </div>

    <label class="picker">
      Or pick any colour:
      <input type="color" bind:value={accent} />
      <code>{accent}</code>
    </label>
  </section>

  <p class="hint">
    Tip: save, look, tweak, repeat. That tight loop is where
    all the learning happens.
  </p>
</div>

<style>
  /*
    Styles inside a .svelte file are scoped — they only
    affect THIS component. var(--accent) reads the custom
    property we set inline on .page up above, so every
    orange-ish thing on this page is driven by one variable.
  */
  .page {
    font-family: system-ui, sans-serif;
    color: #333;
    padding: 4px;
  }
  h1 {
    color: var(--accent);
    margin-bottom: 4px;
    transition: color 0.25s ease;
  }
  .lead {
    color: #555;
    margin-top: 0;
  }
  h2 {
    color: #222;
    font-size: 17px;
    margin: 0 0 8px;
  }
  p {
    color: #444;
    font-size: 14px;
    line-height: 1.55;
    margin: 6px 0;
  }
  code {
    background: #f2f2f2;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 12.5px;
  }
  .muted  { color: #777; font-size: 13px; }
  .tiny   { color: #999; font-size: 12px; font-style: italic; }
  .card {
    background: #fff;
    border: 2px solid color-mix(in srgb, var(--accent) 30%, #e5e5e5);
    border-left: 6px solid var(--accent);
    border-radius: 10px;
    padding: 14px 18px;
    margin: 14px 0;
    transition: border-color 0.25s ease;
  }
  .tools { padding-left: 20px; margin: 6px 0; }
  .tools li { margin: 6px 0; color: #444; font-size: 14px; }

  .badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 999px;
    background: #fde2e2;
    color: #a33;
    font-weight: 600;
    font-size: 12px;
  }
  .badge.ok {
    background: #dff5e0;
    color: #1e7a2e;
  }

  .roadmap { padding-left: 22px; }
  .roadmap li { margin: 6px 0; font-size: 14px; color: #444; }
  .roadmap li strong { color: var(--accent); }

  .playground .swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 10px 0;
  }
  .swatch {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 3px solid #fff;
    box-shadow: 0 0 0 1px #ccc;
    cursor: pointer;
    transition: transform 0.15s ease;
  }
  .swatch:hover { transform: scale(1.12); }

  .picker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #555;
    margin-top: 6px;
  }
  .picker input[type='color'] {
    width: 36px;
    height: 28px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: none;
    cursor: pointer;
  }

  .hint {
    color: #888;
    font-style: italic;
    font-size: 13px;
    margin-top: 20px;
    text-align: center;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
