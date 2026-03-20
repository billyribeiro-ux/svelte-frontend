import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-5',
		title: 'Text, Numbers & Booleans',
		phase: 1,
		module: 0,
		lessonIndex: 5
	},
	description: `Every program works with data, and the most basic kinds of data are primitives: strings (text), numbers, and booleans (true/false).

In this lesson, you'll explore all three types, see how they behave differently, and use them to control what appears on screen. You'll also learn about template literals — a powerful way to build strings with embedded expressions.`,
	objectives: [
		'Distinguish between string, number, and boolean types',
		'Use template literals to build dynamic strings',
		'Use booleans with conditional rendering in Svelte'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // Strings - text data
  let name = $state('Svelte');
  let language = $state('JavaScript');

  // Numbers - numeric data
  let version = $state(5);
  let rating = $state(9.8);

  // Booleans - true/false
  let isAwesome = $state(true);
  let isOld = $state(false);

  // Template literal - build strings with expressions
  let summary = $derived(
    \`\${name} \${version} uses \${language} and is rated \${rating}/10\`
  );

  function toggleAwesome() {
    isAwesome = !isAwesome;
  }
</script>

<h1>Primitive Types</h1>

<section>
  <h2>Strings</h2>
  <p>Name: <strong>{name}</strong> (type: {typeof name})</p>
  <p>Language: <strong>{language}</strong></p>
</section>

<section>
  <h2>Numbers</h2>
  <p>Version: <strong>{version}</strong> (type: {typeof version})</p>
  <p>Rating: <strong>{rating}</strong></p>
  <p>Version + 1 = <strong>{version + 1}</strong></p>
</section>

<section>
  <h2>Booleans</h2>
  <p>
    Is awesome:
    <strong class:true-val={isAwesome} class:false-val={!isAwesome}>
      {isAwesome}
    </strong>
  </p>
  <button onclick={toggleAwesome}>Toggle</button>

  {#if isAwesome}
    <p class="yes">Yes, Svelte is awesome!</p>
  {:else}
    <p class="no">Just kidding — it's still awesome.</p>
  {/if}
</section>

<section>
  <h2>Template Literal</h2>
  <p>{summary}</p>
</section>

<style>
  h1 {
    color: #ff3e00;
    font-family: sans-serif;
    margin-bottom: 16px;
  }
  h2 {
    font-size: 16px;
    color: #333;
    margin-bottom: 8px;
    border-bottom: 1px solid #eee;
    padding-bottom: 4px;
  }
  section {
    margin-bottom: 20px;
  }
  p {
    color: #444;
    font-size: 14px;
    margin: 4px 0;
  }
  strong {
    color: #222;
  }
  .true-val { color: #4ec9b0; }
  .false-val { color: #f44747; }
  button {
    padding: 6px 14px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    margin: 8px 0;
  }
  button:hover {
    background: #ff3e00;
    color: white;
  }
  .yes { color: #4ec9b0; font-weight: 600; }
  .no { color: #f44747; font-style: italic; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'utils.js',
			content: `// Helper to check the type of a value
export function describeType(value) {
  if (typeof value === 'string') return \`"\${value}" is a string with \${value.length} characters\`;
  if (typeof value === 'number') return \`\${value} is a number (\${Number.isInteger(value) ? 'integer' : 'float'})\`;
  if (typeof value === 'boolean') return \`\${value} is a boolean\`;
  return \`\${value} is \${typeof value}\`;
}
`,
			language: 'javascript'
		}
	]
};

export default lesson;
