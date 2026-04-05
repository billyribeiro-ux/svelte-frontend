import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '2-1',
		title: 'Your First Component',
		phase: 1,
		module: 2,
		lessonIndex: 1
	},
	description: `Components are the **heart** of Svelte. Every \`.svelte\` file is a self-contained component — its own little world with markup (HTML), logic (JavaScript), and styles (CSS) living together in one file. This co-location is what makes Svelte so pleasant: no jumping between three files to understand one piece of UI.

Think of components as **reusable LEGO blocks** for your UI. Instead of writing a hundred-line \`App.svelte\` with every button, card, and form mixed together, you extract a \`Button.svelte\`, a \`Card.svelte\`, a \`Badge.svelte\`. Then you compose your app by dropping those components in wherever you need them. The same Card can appear ten times on a page — and each instance has its own independent state.

Every component has a clear structure: \`<script>\` for logic at the top, then markup, then \`<style>\` for CSS. Styles are **scoped** automatically — a \`.title\` class in one component will not leak out and affect \`.title\` classes in other components. That removes a huge class of bugs from traditional CSS.

In this lesson you will build a small UI kit made of three reusable components — \`Card.svelte\`, \`Button.svelte\`, and \`Badge.svelte\` — and compose them together in \`App.svelte\`. Along the way you will see naming conventions (PascalCase filenames, one component per file), file-organization tips, and why each instance keeping its own state is the secret behind the whole "reusable LEGO block" idea.`,
	objectives: [
		'Create .svelte component files with script, markup, and styles',
		'Import and render multiple components from separate files',
		'Understand that each component instance has its own independent state',
		'Recognize that component styles are scoped by default',
		'Follow naming conventions: PascalCase filenames, one component per file',
		'Compose a page from multiple small, focused components'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ============================================================
  // Importing components — just like any JS module
  // ------------------------------------------------------------
  // Naming conventions to remember:
  //   1. File names are PascalCase:   Card.svelte  (not card.svelte)
  //   2. The imported local name matches the file name.
  //   3. One component per file. Keeps things easy to find.
  //   4. Use the .svelte extension in the import path.
  // ============================================================
  import Card from './Card.svelte';
  import Button from './Button.svelte';
  import Badge from './Badge.svelte';
  import Greeting from './Greeting.svelte';

  let appTitle = $state('Welcome to Components!');
  let likesTotal = $state(0);

  function shout() {
    appTitle = appTitle.toUpperCase() + '!';
  }
  function reset() {
    appTitle = 'Welcome to Components!';
    likesTotal = 0;
  }
  function bumpTotal() {
    likesTotal += 1;
  }
</script>

<h1>{appTitle}</h1>

<Greeting />

<!-- ===== File organization tips ===== -->
<section class="tips">
  <h2>Naming &amp; file-organization tips</h2>
  <ul>
    <li><strong>PascalCase filenames</strong>: <code>Card.svelte</code>, not <code>card.svelte</code>.</li>
    <li><strong>One component per file</strong>: keeps git diffs clean and search fast.</li>
    <li><strong>Group by feature</strong>: <code>src/lib/components/cards/</code> is better than one giant folder.</li>
    <li><strong>Components start with a capital letter</strong> in markup — that is how Svelte tells a component apart from a plain HTML element.</li>
    <li><strong>Co-locate tiny helpers</strong>: if <code>CardHeader.svelte</code> is only used inside <code>Card.svelte</code>, put them next to each other.</li>
  </ul>
</section>

<!-- ===== Composition: parent using all three children ===== -->
<p class="intro">
  Each card below mixes three small components: a
  <code>Card</code> wrapper, a <code>Badge</code>, and a
  <code>Button</code>. Click the likes — notice each card's
  counter is <strong>completely independent</strong>, because
  every instance has its own state.
</p>

<div class="grid">
  <Card />
  <Card />
  <Card />
  <Card />
</div>

<!-- ===== Standalone usage of each child component ===== -->
<section class="kit">
  <h2>The UI kit on its own</h2>
  <p class="muted">
    The same components used above, shown one by one so you can
    see them in isolation:
  </p>

  <div class="row">
    <Badge />
    <Badge />
    <Badge />
  </div>

  <div class="row">
    <Button />
    <Button />
    <Button />
  </div>
</section>

<!-- ===== Top-level app state + actions ===== -->
<section class="actions-box">
  <h2>Shout &amp; reset</h2>
  <p class="muted">
    These buttons change state on the parent (the App itself),
    not on any child card. That is another thing components are
    great at: isolating concerns.
  </p>
  <div class="actions">
    <button onclick={shout}>SHOUT the title</button>
    <button onclick={reset}>Reset everything</button>
    <button onclick={bumpTotal}>+1 to global total</button>
  </div>
  <p>Global total (just on App): <strong>{likesTotal}</strong></p>
</section>

<p class="note">
  Try editing <code>Card.svelte</code> — change the background
  color, or the button label. All four cards update together
  because they all come from the same component definition.
</p>

<style>
  h1 {
    color: #ff3e00;
    font-family: sans-serif;
    margin-bottom: 8px;
  }
  h2 {
    color: #333;
    font-family: sans-serif;
    font-size: 15px;
    margin: 0 0 6px;
  }
  .intro, .muted {
    color: #555;
    font-family: sans-serif;
    font-size: 13.5px;
    margin: 10px 0;
    line-height: 1.5;
  }
  .muted { color: #888; font-size: 12.5px; }
  code {
    background: #f0f0f0;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 12px;
  }
  strong { color: #ff3e00; }

  .tips {
    background: #f2fbff;
    border: 2px solid #bfe6ff;
    border-left: 6px solid #569cd6;
    border-radius: 8px;
    padding: 10px 14px;
    font-family: sans-serif;
    margin: 12px 0;
  }
  .tips ul { margin: 4px 0 0; padding-left: 20px; color: #333; font-size: 13px; }
  .tips li { margin: 3px 0; }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 14px;
    margin: 16px 0;
  }

  .kit, .actions-box {
    background: #fff7f2;
    border: 2px solid #ffd6c2;
    border-radius: 10px;
    padding: 12px 14px;
    margin: 12px 0;
    font-family: sans-serif;
  }
  .row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 8px 0;
  }

  .actions { display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0; }
  .actions button {
    padding: 6px 14px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-family: sans-serif;
  }
  .actions button:hover { background: #ff3e00; color: white; }

  .note {
    color: #999;
    font-size: 12px;
    font-style: italic;
    padding: 8px;
    background: #fafafa;
    border-left: 3px solid #ff3e00;
    border-radius: 4px;
    margin-top: 12px;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Card.svelte',
			content: `<script>
  // ============================================================
  // Card.svelte
  // ------------------------------------------------------------
  // A reusable card. Every instance has its OWN 'likes' counter,
  // so clicking one card does NOT change any of the others.
  //
  // This Card also COMPOSES two smaller components:
  //   - Badge (a little status pill at the top)
  //   - Button (its own styled button)
  // That is the whole idea of components: small pieces combine
  // into bigger pieces, which combine into pages.
  // ============================================================
  import Badge from './Badge.svelte';
  import Button from './Button.svelte';

  let likes = $state(0);
  let liked = $state(false);

  function toggleLike() {
    if (liked) {
      likes -= 1;
      liked = false;
    } else {
      likes += 1;
      liked = true;
    }
  }
</script>

<div class="card" class:liked>
  <Badge />
  <div class="avatar">C</div>
  <h3>My Card</h3>
  <p>A reusable card with its own local state.</p>
  <button class="heart" onclick={toggleLike}>
    {liked ? '♥' : '♡'} {likes}
  </button>
  <Button />
</div>

<style>
  /* Scoped to this component only — a .card here will NOT
     collide with a .card class inside App.svelte or anywhere
     else in the project. */
  .card {
    border: 2px solid #eee;
    border-radius: 10px;
    padding: 14px;
    background: white;
    text-align: center;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-family: sans-serif;
  }
  .card:hover {
    border-color: #ff3e00;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 62, 0, 0.15);
  }
  .card.liked {
    background: #fff7f3;
    border-color: #ff3e00;
  }
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #ff3e00;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }
  h3 { margin: 0; color: #333; font-size: 15px; }
  p  { color: #666; font-size: 12px; margin: 0; }
  .heart {
    padding: 4px 12px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    border-radius: 16px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
  }
  .heart:hover { background: #ff3e00; color: white; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Button.svelte',
			content: `<script>
  // ============================================================
  // Button.svelte
  // ------------------------------------------------------------
  // A tiny button component with its own click counter. Later
  // lessons will show how to pass in a label and an onclick via
  // PROPS — for now, every Button is self-contained so we can
  // focus on the idea of "a component is a small isolated unit".
  // ============================================================
  let clicks = $state(0);

  function handleClick() {
    clicks += 1;
  }
</script>

<button class="btn" onclick={handleClick}>
  Clicked {clicks} time{clicks === 1 ? '' : 's'}
</button>

<style>
  .btn {
    padding: 6px 14px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12.5px;
    font-family: sans-serif;
    font-weight: 600;
    transition: all 0.15s ease;
  }
  .btn:hover {
    background: #ff3e00;
    color: white;
    transform: translateY(-1px);
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Badge.svelte',
			content: `<script>
  // ============================================================
  // Badge.svelte
  // ------------------------------------------------------------
  // A minimal presentational component. It has almost no logic —
  // just markup + scoped styles. Components can be this small!
  // Extracting tiny pieces like this makes your UI consistent
  // because every "NEW" label in the app will look identical.
  // ============================================================
</script>

<span class="badge">NEW</span>

<style>
  .badge {
    display: inline-block;
    padding: 2px 10px;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: white;
    background: linear-gradient(135deg, #ff3e00, #ff8a50);
    border-radius: 999px;
    font-family: sans-serif;
    text-transform: uppercase;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Greeting.svelte',
			content: `<script>
  // A tiny component — it is totally fine to make components
  // this small. Small pieces compose into bigger ones.
  const hours = new Date().getHours();
  const timeOfDay =
    hours < 12 ? 'morning' :
    hours < 18 ? 'afternoon' : 'evening';
</script>

<div class="greeting">
  Good {timeOfDay}! Ready to learn Svelte components?
</div>

<style>
  .greeting {
    padding: 10px 14px;
    background: linear-gradient(135deg, #ff3e00, #ff8a50);
    color: white;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    margin: 8px 0 12px;
    font-family: sans-serif;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
