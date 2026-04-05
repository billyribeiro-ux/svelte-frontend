import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-8',
		title: 'Git & Prettier: Save Your Work',
		phase: 1,
		module: 0,
		lessonIndex: 8
	},
	description: `Before we leave Module 0, we need to meet two tools that every professional developer uses every single day: **Git** and **Prettier**. They are not glamorous. They will not make your app look prettier in the browser. But they will save you from the two most common sources of pain in a beginner's life: **losing work** and **arguing about formatting**.

**Git** is a *version control system*. In plain English, it is a "time machine" for your project. Every time you hit "commit," Git takes a snapshot of every file and remembers it forever. You can go back to any snapshot if something breaks, compare two snapshots to see what changed, or share your whole history with a teammate. Without Git, your only tool is Ctrl+Z and crossed fingers. With Git, you can experiment fearlessly: "let me try a wild refactor — if it explodes I can just go back."

The workflow you will use 95% of the time is three commands: **\`git add\`** (tell Git which files to include in the next snapshot), **\`git commit -m "message"\`** (take the snapshot with a short description), and **\`git status\`** (see what has changed). That is really it. Plus \`git init\` once at the very beginning to turn a folder into a Git repository.

**Prettier** is a *code formatter*. It automatically enforces one consistent style for every line you write: where to put spaces, how long a line can be, which kind of quotes to use, where to put semicolons. Why care? Because the moment you work with another human, style arguments waste hours of everyone's time. Prettier ends the argument by formatting the code the same way for everyone. You write sloppy code; you save; Prettier cleans it up. Done.

Combined, Git + Prettier give you superpowers: you can experiment without fear (Git) and never worry about formatting again (Prettier). In this lesson you will not actually run these commands inside the preview — they need a real terminal — but you will see exactly what each command does, what Prettier fixes, and practice building a mental model with an interactive walkthrough.`,
	objectives: [
		'Explain what a Git repository is and why version control matters',
		'Use the core Git commands: init, status, add, commit, log',
		'Write good commit messages that describe the "why"',
		'Install and configure Prettier with a .prettierrc file',
		'Recognize the difference between unformatted and formatted code',
		'Understand why teams use Prettier to eliminate style debates'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ======================================================
  // Interactive walkthrough state
  // ======================================================
  let currentStep = $state(0);

  // The core Git commands, in the order you use them.
  const gitSteps = [
    {
      command: 'git init',
      description:
        'Turn the current folder into a Git repository. You only run this once, at the very start of a project.',
      example: '$ git init\\nInitialized empty Git repository in /my-app/.git/'
    },
    {
      command: 'git status',
      description:
        'Show which files have been changed, added, or deleted since the last commit. Run this as often as you like — it changes nothing.',
      example:
        '$ git status\\nOn branch main\\nChanges not staged for commit:\\n  modified: src/App.svelte'
    },
    {
      command: 'git add .',
      description:
        'Stage every changed file so it is included in the next commit. The dot means "everything in this folder".',
      example: '$ git add .'
    },
    {
      command: 'git commit -m "Add counter"',
      description:
        'Take a snapshot of all staged files with a short, descriptive message. Good messages describe WHY, not just what.',
      example:
        '$ git commit -m "Add counter"\\n[main 3f9a1b2] Add counter\\n 1 file changed, 12 insertions(+)'
    },
    {
      command: 'git log --oneline',
      description:
        'Browse your commit history, one commit per line. Your time machine, sorted newest first.',
      example:
        '$ git log --oneline\\n3f9a1b2 Add counter\\n8c2d0ee Initial commit'
    }
  ];

  // Good vs bad commit messages (a very common beginner trap).
  const commitMessageExamples = [
    { type: 'bad', text: 'stuff' },
    { type: 'bad', text: 'fixed' },
    { type: 'bad', text: 'asdfasdf' },
    { type: 'good', text: 'Add counter with increment and reset' },
    { type: 'good', text: 'Fix typo in welcome heading' },
    { type: 'good', text: 'Use $state instead of plain let for reactive count' }
  ];

  // Example Prettier config file content.
  const prettierConfig = \`{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "plugins": ["prettier-plugin-svelte"]
}\`;

  // Messy code BEFORE Prettier.
  const uglyCode = \`<script>
let   name=$state(   'world'  )
  let count=$state( 0)
<\\/script>
<h1>Hello {name}  </h1>
<button onclick={()=>count+=1}>{count}</button>\`;

  // Same code AFTER Prettier.
  const prettyCode = \`<script>
  let name = $state('world');
  let count = $state(0);
<\\/script>

<h1>Hello {name}</h1>
<button onclick={() => (count += 1)}>
  {count}
</button>\`;

  function nextStep() {
    if (currentStep < gitSteps.length - 1) currentStep = currentStep + 1;
  }
  function prevStep() {
    if (currentStep > 0) currentStep = currentStep - 1;
  }
  function goToStep(i) {
    currentStep = i;
  }
</script>

<h1>Git & Prettier: Save Your Work</h1>
<p class="intro">
  Two tools every developer uses daily. You will not run them inside this
  preview, but by the end of this lesson you should be able to picture
  exactly what each command does.
</p>

<!-- ===== 1: Git walkthrough ===== -->
<section class="card">
  <h2>1. The Git workflow</h2>

  <!-- Step indicator: clickable dots for random access -->
  <div class="dots">
    {#each gitSteps as step, i (i)}
      <button
        class="dot"
        class:active={currentStep === i}
        onclick={() => goToStep(i)}
        aria-label={\`Step \${i + 1}\`}
      >
        {i + 1}
      </button>
    {/each}
  </div>

  <div class="step-box">
    <p class="step-label">Step {currentStep + 1} of {gitSteps.length}</p>
    <code class="command">{gitSteps[currentStep].command}</code>
    <p class="description">{gitSteps[currentStep].description}</p>
    <pre class="terminal">{gitSteps[currentStep].example}</pre>
  </div>

  <div class="buttons">
    <button onclick={prevStep} disabled={currentStep === 0}>← Previous</button>
    <button onclick={nextStep} disabled={currentStep === gitSteps.length - 1}>
      Next →
    </button>
  </div>
</section>

<!-- ===== 2: Good vs bad commit messages ===== -->
<section class="card">
  <h2>2. Good vs bad commit messages</h2>
  <p>
    Future-you (and your teammates) will thank you for clear messages.
    Write them in the imperative mood: "Add", "Fix", "Update", "Remove".
  </p>
  <ul class="commits">
    {#each commitMessageExamples as msg, i (i)}
      <li class={msg.type}>
        <span class="tag">{msg.type === 'good' ? '✓' : '✗'}</span>
        <code>{msg.text}</code>
      </li>
    {/each}
  </ul>
</section>

<!-- ===== 3: Prettier config ===== -->
<section class="card">
  <h2>3. Prettier config (.prettierrc)</h2>
  <p>
    Drop this file in the root of your project. Every setting is a
    preference — what matters is that the whole team uses the same file.
  </p>
  <pre>{prettierConfig}</pre>
</section>

<!-- ===== 4: Before/after ===== -->
<section class="card">
  <h2>4. Before and after Prettier</h2>
  <div class="comparison">
    <div>
      <h3>Before (messy)</h3>
      <pre class="ugly">{uglyCode}</pre>
    </div>
    <div>
      <h3>After (formatted)</h3>
      <pre class="pretty">{prettyCode}</pre>
    </div>
  </div>
  <p class="note">
    Notice: same logic, zero behavior change. Prettier only touches
    whitespace, quotes, and line breaks — never the meaning of the code.
  </p>
</section>

<!-- ===== 5: Cheat sheet ===== -->
<section class="card cheatsheet">
  <h2>5. Module 0 cheat sheet</h2>
  <ul>
    <li><code>git init</code> — start tracking a folder</li>
    <li><code>git status</code> — what has changed?</li>
    <li><code>git add .</code> — stage everything</li>
    <li><code>git commit -m "message"</code> — save a snapshot</li>
    <li><code>git log --oneline</code> — browse history</li>
    <li><code>npx prettier --write .</code> — format every file in the project</li>
  </ul>
</section>

<style>
  h1 {
    color: #ff3e00;
    font-family: sans-serif;
    margin-bottom: 4px;
  }
  .intro {
    color: #666;
    font-family: sans-serif;
    font-size: 14px;
    margin: 0 0 16px;
  }
  h2 { font-size: 16px; color: #333; margin: 0 0 8px; font-family: sans-serif; }
  h3 { font-size: 14px; color: #555; margin: 0 0 4px; font-family: sans-serif; }
  .card {
    background: #fafafa;
    border: 2px solid #e5e5e5;
    border-radius: 10px;
    padding: 14px 18px;
    margin: 14px 0;
    font-family: sans-serif;
  }
  .cheatsheet { background: #fff9ec; border-color: #ffe2a8; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  code {
    background: #eee;
    color: #c7254e;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
  }
  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 12px;
    border-radius: 6px;
    font-size: 13px;
    overflow-x: auto;
    white-space: pre;
    font-family: 'Menlo', 'Consolas', monospace;
  }
  .terminal {
    background: #0f2a0f;
    color: #a7e3a7;
    border-left: 3px solid #4ec9b0;
  }
  .command {
    display: block;
    background: #2d2d2d;
    color: #4ec9b0;
    padding: 10px;
    border-radius: 6px;
    font-size: 16px;
    margin: 8px 0;
  }
  .step-box {
    text-align: center;
    padding: 8px 0;
  }
  .step-label {
    font-weight: 700;
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
  }
  .description {
    color: #333;
    font-size: 14px;
    margin: 8px 0;
  }
  .dots {
    display: flex;
    gap: 6px;
    justify-content: center;
    margin: 6px 0 10px;
  }
  .dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    font-size: 12px;
    cursor: pointer;
    padding: 0;
    font-family: sans-serif;
  }
  .dot.active { background: #ff3e00; color: white; }
  .buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin: 8px 0;
  }
  button:not(.dot) {
    padding: 6px 14px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-family: sans-serif;
  }
  button:not(.dot):hover:not(:disabled) { background: #ff3e00; color: white; }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
  .commits {
    list-style: none;
    padding: 0;
  }
  .commits li {
    padding: 6px 8px;
    margin: 4px 0;
    border-radius: 4px;
    font-size: 13px;
  }
  .commits li.good { background: #eafbe7; color: #2a7a2e; }
  .commits li.bad { background: #fde9e9; color: #a13232; }
  .commits .tag {
    display: inline-block;
    width: 20px;
    font-weight: 700;
  }
  .comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .ugly { border-left: 3px solid #f44747; }
  .pretty { border-left: 3px solid #4ec9b0; }
  .note {
    margin-top: 8px;
    padding: 6px 10px;
    background: #f2fbff;
    border-left: 3px solid #569cd6;
    font-size: 12px;
    color: #333;
  }
  ul { color: #444; font-size: 14px; padding-left: 20px; }
  .cheatsheet ul li { margin: 4px 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
