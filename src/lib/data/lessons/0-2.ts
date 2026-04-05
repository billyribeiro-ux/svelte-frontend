import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-2',
		title: 'Your First SvelteKit Project',
		phase: 1,
		module: 0,
		lessonIndex: 2
	},
	description: `Now that your machine is set up and you can edit markup, let us see the thing that makes Svelte feel magical: **reactivity**. Reactivity is a fancy word for a simple idea — when a value changes, the parts of the page that use it update automatically, without you telling them to.

In plain HTML and JavaScript, if you want a number on the page to update when a user clicks a button, you have to manually find the element with something like \`document.getElementById\`, then manually rewrite its text. Every. Single. Time. It gets messy fast. Svelte removes that whole step.

In Svelte 5, you declare a reactive value with the **\`$state\` rune**. A rune is just a special function that starts with a \`$\`. Writing \`let count = $state(0)\` says: "I have a variable named \`count\`, it starts at 0, and Svelte should track it." Now anywhere you write \`{count}\` in your markup, the screen will re-render whenever \`count\` changes.

The second half of the puzzle is **event handlers**. These are little instructions like "when this button is clicked, run this function." In Svelte 5 they look just like HTML attributes: \`onclick={myFunction}\`. Together, \`$state\` and event handlers let you build interactive UIs with astonishingly little code.

In this lesson you will build **six small interactive widgets** — a counter, a light switch, a name greeter, a name-length meter, a mood selector, and a "my day" form — all powered by the same core ideas. Along the way you will meet the mental model: a \`$state\` variable is a box the UI is watching, while a plain \`let\` variable is just a name for a value nobody is listening to.`,
	objectives: [
		'Understand what "reactivity" means and why it is useful',
		'Declare reactive variables using the $state rune',
		'Attach event handlers with the onclick={} syntax',
		'Update state from inside a function and see the UI refresh automatically',
		'Combine multiple pieces of state in a single component',
		'Use curly braces {value} to display reactive data in markup',
		'Build a mental model of $state vs regular let variables'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // =========================================================
  // MENTAL MODEL — $state vs plain let
  // ---------------------------------------------------------
  // A plain "let x = 5" is just a variable. If you change it
  // later, nothing on the page will notice.
  //
  // "let x = $state(5)" creates a REACTIVE variable. Svelte
  // keeps a list of every spot in the markup that reads x,
  // and any time x changes, those spots re-render.
  //
  // Rule of thumb:
  //   - Value that might change while the page is open?  $state
  //   - Value that is constant for the whole component?  plain let or const
  // =========================================================

  // ===== Widget 1: Classic counter =====
  let count = $state(0);

  function increment() { count = count + 1; } // count++ works too
  function decrement() { count = count - 1; }
  function resetCount() { count = 0; }

  // ===== Widget 2: Light switch (boolean state) =====
  let lightOn = $state(false);
  function toggleLight() {
    lightOn = !lightOn; // ! flips true <-> false
  }

  // ===== Widget 3: Name greeter (string state) =====
  let userName = $state('friend');
  function greetAlice()    { userName = 'Alice'; }
  function greetBob()      { userName = 'Bob'; }
  function greetStranger() { userName = 'mysterious stranger'; }

  // ===== Widget 4: Name length meter =====
  // We bind an <input> to this variable with bind:value.
  // Whatever the user types flows straight into typed.
  // Then we can reference typed.length in the markup and
  // it updates live on every keystroke.
  let typed = $state('');

  // ===== Widget 5: Mood selector =====
  // An array of options we will loop over with {#each}.
  const moods = [
    { id: 'happy',   emoji: '😄', label: 'Happy' },
    { id: 'chill',   emoji: '😌', label: 'Chill' },
    { id: 'focused', emoji: '🎯', label: 'Focused' },
    { id: 'tired',   emoji: '😴', label: 'Tired' },
    { id: 'hyped',   emoji: '🚀', label: 'Hyped'  }
  ];
  let mood = $state('happy');
  function selectMood(id) {
    mood = id;
  }

  // ===== Widget 6: "My day" form (string concatenation) =====
  let person = $state('Sam');
  let activity = $state('learning Svelte');
  let feeling = $state('excited');
  // Notice: no $derived here — the markup just reads these
  // three state values directly, and Svelte re-runs the
  // template whenever any of them changes.
</script>

<h1>Six Tiny Reactive Widgets</h1>
<p class="intro">
  Click the buttons, type in the inputs, pick a mood. Notice how
  everything updates instantly — that is reactivity at work.
</p>

<!-- ===== Mental model callout ===== -->
<aside class="callout">
  <h2>Mental model: $state vs let</h2>
  <p>
    Think of <code>$state(0)</code> as putting your value in a
    <strong>glass box</strong> that Svelte is watching. Any time
    you reassign the variable, the watcher notices and redraws
    every part of the page that read from it.
  </p>
  <p>
    A plain <code>let x = 0</code> is just a number sitting on
    a table — if you change it, nobody is looking.
  </p>
</aside>

<!-- ===== Widget 1: Counter ===== -->
<section class="widget">
  <h2>1. Counter</h2>
  <p class="big-number">{count}</p>
  <div class="buttons">
    <button onclick={decrement}>−</button>
    <button onclick={resetCount}>Reset</button>
    <button onclick={increment}>+</button>
  </div>
</section>

<!-- ===== Widget 2: Light switch ===== -->
<section class="widget">
  <h2>2. Light Switch</h2>
  <p class="bulb">{lightOn ? '💡 The light is ON' : '🌑 The light is OFF'}</p>
  <button onclick={toggleLight}>
    {lightOn ? 'Turn off' : 'Turn on'}
  </button>
</section>

<!-- ===== Widget 3: Greeter ===== -->
<section class="widget">
  <h2>3. Greeter</h2>
  <p class="greeting">Hello, {userName}!</p>
  <div class="buttons">
    <button onclick={greetAlice}>Greet Alice</button>
    <button onclick={greetBob}>Greet Bob</button>
    <button onclick={greetStranger}>Greet a stranger</button>
  </div>
</section>

<!-- ===== Widget 4: Name length meter ===== -->
<section class="widget">
  <h2>4. Name length meter</h2>
  <p class="muted">
    Type something. We use <code>bind:value</code> to connect the
    input to our <code>typed</code> state, then read
    <code>typed.length</code> live.
  </p>
  <input class="text-input" type="text" placeholder="type your name..." bind:value={typed} />
  <p>
    You typed <strong>{typed.length}</strong>
    character{typed.length === 1 ? '' : 's'}.
  </p>
  {#if typed.length === 0}
    <p class="hint">Waiting for you to type something…</p>
  {:else if typed.length < 4}
    <p class="hint">Short and sweet!</p>
  {:else if typed.length < 10}
    <p class="hint">Nice length.</p>
  {:else}
    <p class="hint">Whoa, that is a long one!</p>
  {/if}
</section>

<!-- ===== Widget 5: Mood selector ===== -->
<section class="widget">
  <h2>5. Mood selector</h2>
  <p class="muted">Pick how you feel right now:</p>
  <div class="mood-grid">
    {#each moods as m (m.id)}
      <button
        class="mood-btn"
        class:active={mood === m.id}
        onclick={() => selectMood(m.id)}
      >
        <span class="mood-emoji">{m.emoji}</span>
        <span class="mood-label">{m.label}</span>
      </button>
    {/each}
  </div>
  <p class="mood-feedback">
    {#if mood === 'happy'}   Awesome — keep the good vibes going!   {/if}
    {#if mood === 'chill'}   Relaxed coding sessions are the best. {/if}
    {#if mood === 'focused'} Lock in — you will crush this lesson. {/if}
    {#if mood === 'tired'}   Totally fair. Take a break when ready. {/if}
    {#if mood === 'hyped'}   Let us go! 🚀                            {/if}
  </p>
</section>

<!-- ===== Widget 6: My Day form ===== -->
<section class="widget">
  <h2>6. My Day</h2>
  <p class="muted">
    Three inputs, one live sentence. Watch the bottom paragraph
    update as you type — each input is bound to its own state.
  </p>
  <label class="field">
    Name
    <input type="text" bind:value={person} />
  </label>
  <label class="field">
    What I am doing
    <input type="text" bind:value={activity} />
  </label>
  <label class="field">
    How I feel
    <input type="text" bind:value={feeling} />
  </label>
  <p class="sentence">
    Today, <strong>{person}</strong> is <strong>{activity}</strong>
    and feeling <strong>{feeling}</strong>.
  </p>
</section>

<p class="note">
  All six widgets share the same pattern:
  <strong>$state</strong> holds the value, a
  <strong>function</strong> (or a <code>bind:</code>) updates it, and
  the markup reads it with <code>{'{curly braces}'}</code>.
</p>

<style>
  h1 {
    color: #ff3e00;
    font-family: sans-serif;
    text-align: center;
    margin-bottom: 4px;
  }
  .intro {
    text-align: center;
    color: #666;
    font-family: sans-serif;
    margin-top: 0;
  }
  .callout {
    background: #f2fbff;
    border: 2px solid #bfe6ff;
    border-left: 6px solid #569cd6;
    border-radius: 10px;
    padding: 12px 16px;
    font-family: sans-serif;
    margin: 14px 0;
  }
  .callout h2 { color: #1f4e79; font-size: 15px; margin: 0 0 6px; }
  .callout p  { color: #333; font-size: 13.5px; margin: 6px 0; }
  .widget {
    background: #fff7f2;
    border: 2px solid #ffd6c2;
    border-radius: 10px;
    padding: 14px 18px;
    margin: 14px 0;
    font-family: sans-serif;
    text-align: center;
  }
  h2 {
    color: #333;
    font-size: 16px;
    margin: 0 0 8px;
  }
  .big-number {
    font-size: 48px;
    font-weight: 700;
    color: #ff3e00;
    margin: 8px 0;
  }
  .bulb { font-size: 22px; margin: 8px 0; }
  .greeting { font-size: 20px; color: #333; margin: 8px 0; }
  .buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  button {
    font-size: 15px;
    padding: 8px 16px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    border-radius: 6px;
    cursor: pointer;
    font-family: sans-serif;
  }
  button:hover { background: #ff3e00; color: white; }

  .muted { color: #777; font-size: 13px; margin: 4px 0 8px; }
  .hint  { color: #888; font-size: 13px; font-style: italic; }

  .text-input {
    font-size: 15px;
    padding: 8px 12px;
    border-radius: 6px;
    border: 2px solid #ffd6c2;
    width: 80%;
    max-width: 280px;
    font-family: sans-serif;
  }
  .text-input:focus { outline: none; border-color: #ff3e00; }

  .mood-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 8px;
    margin: 8px 0;
  }
  .mood-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 6px;
    border: 2px solid #ffd6c2;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    color: #333;
    font-size: 12px;
    transition: all 0.15s ease;
  }
  .mood-btn:hover { transform: translateY(-2px); }
  .mood-btn.active {
    background: #ff3e00;
    border-color: #ff3e00;
    color: white;
  }
  .mood-emoji { font-size: 24px; }
  .mood-label { font-weight: 600; }
  .mood-feedback {
    color: #ff3e00;
    font-weight: 600;
    font-size: 14px;
    min-height: 1.2em;
  }

  .field {
    display: block;
    text-align: left;
    font-size: 13px;
    color: #555;
    margin: 6px auto;
    max-width: 320px;
  }
  .field input {
    display: block;
    width: 100%;
    margin-top: 3px;
    padding: 7px 10px;
    border: 2px solid #ffd6c2;
    border-radius: 6px;
    font-size: 14px;
    font-family: sans-serif;
  }
  .field input:focus { outline: none; border-color: #ff3e00; }
  .sentence {
    background: #fff;
    border: 1px dashed #ff3e00;
    padding: 10px 12px;
    border-radius: 6px;
    color: #333;
    font-size: 14px;
    margin-top: 10px;
  }

  .note {
    margin-top: 20px;
    padding: 10px 14px;
    background: #f2fbff;
    border-left: 4px solid #569cd6;
    color: #333;
    font-family: sans-serif;
    font-size: 14px;
  }
  code {
    background: #f0f0f0;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 12.5px;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
