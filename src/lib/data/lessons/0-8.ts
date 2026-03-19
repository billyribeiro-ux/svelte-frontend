import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-8',
		title: 'Git & Prettier: Save Your Work',
		phase: 1,
		module: 0,
		lessonIndex: 8
	},
	description: `Before you go further, you need two essential tools in your workflow: Git for version control and Prettier for code formatting. Git lets you save snapshots of your code so you can experiment freely — if something breaks, you can go back. Prettier automatically formats your code so it's clean and consistent.

This lesson introduces the core Git commands (init, add, commit) and shows how Prettier keeps your code tidy without manual effort.`,
	objectives: [
		'Understand git init, git add, and git commit for saving work',
		'Configure Prettier for automatic code formatting',
		'Know why version control matters for experimentation and collaboration'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let currentStep = $state(0);

  const gitCommands = [
    { command: 'git init', description: 'Initialize a new Git repository in your project folder' },
    { command: 'git add .', description: 'Stage all changed files for the next commit' },
    { command: 'git commit -m "message"', description: 'Save a snapshot with a descriptive message' },
    { command: 'git status', description: 'See which files have changed since last commit' },
    { command: 'git log --oneline', description: 'View your commit history' }
  ];

  const prettierConfig = \`{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "plugins": ["prettier-plugin-svelte"]
}\`;

  const uglyCode = \`<script>
let   name=$state(   'world'  )
  let count=$state( 0)
<\/script>
<h1>Hello {name}  </h1>
<button onclick={()=>count+=1}>{count}</button>\`;

  const prettyCode = \`<script>
  let name = $state('world');
  let count = $state(0);
<\/script>

<h1>Hello {name}</h1>
<button onclick={() => (count += 1)}>{count}</button>\`;

  function nextStep() {
    if (currentStep < gitCommands.length - 1) currentStep += 1;
  }

  function prevStep() {
    if (currentStep > 0) currentStep -= 1;
  }
</script>

<h1>Git & Prettier: Save Your Work</h1>

<section>
  <h2>Git Commands</h2>
  <div class="step-display">
    <p class="step-label">Step {currentStep + 1} of {gitCommands.length}</p>
    <code class="command">{gitCommands[currentStep].command}</code>
    <p>{gitCommands[currentStep].description}</p>
    <div class="buttons">
      <button onclick={prevStep} disabled={currentStep === 0}>Previous</button>
      <button onclick={nextStep} disabled={currentStep === gitCommands.length - 1}>Next</button>
    </div>
  </div>
</section>

<section>
  <h2>Prettier Config (.prettierrc)</h2>
  <pre>{prettierConfig}</pre>
</section>

<section>
  <h2>Before & After Prettier</h2>
  <div class="comparison">
    <div>
      <h3>Before</h3>
      <pre class="ugly">{uglyCode}</pre>
    </div>
    <div>
      <h3>After</h3>
      <pre class="pretty">{prettyCode}</pre>
    </div>
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  h3 { font-size: 14px; color: #555; margin-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  pre {
    background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 6px;
    font-size: 13px; overflow-x: auto; white-space: pre;
  }
  .command {
    display: block; background: #2d2d2d; color: #4ec9b0; padding: 10px;
    border-radius: 6px; font-size: 16px; margin: 8px 0;
  }
  .step-display { text-align: center; }
  .step-label { font-weight: 600; color: #ff3e00; }
  .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .ugly { border-left: 3px solid #f44747; }
  .pretty { border-left: 3px solid #4ec9b0; }
  .buttons { display: flex; gap: 8px; justify-content: center; margin: 8px 0; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover:not(:disabled) { background: #ff3e00; color: white; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
