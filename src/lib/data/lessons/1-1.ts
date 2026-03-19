import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '1-1',
		title: 'Objects: Grouping Related Data',
		phase: 1,
		module: 1,
		lessonIndex: 1
	},
	description: `Objects are the most common way to group related data together. Instead of having separate variables for a person's name, age, and role, you bundle them into a single object. This makes your code organized and easier to pass around.

In this lesson, you'll create object literals, access properties using dot and bracket notation, work with nested objects, and update properties reactively using $state.`,
	objectives: [
		'Create object literals with properties',
		'Access properties using dot notation and bracket notation',
		'Work with nested objects and update them reactively'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // A reactive object with $state
  let person = $state({
    name: 'Billy',
    age: 30,
    role: 'Developer'
  });

  // Nested object
  let company = $state({
    name: 'Acme Corp',
    address: {
      street: '123 Main St',
      city: 'Codeville',
      country: 'JS Land'
    },
    founded: 2020
  });

  // Bracket notation — useful when the key is dynamic
  let selectedField = $state('name');
  const fields = ['name', 'age', 'role'];

  function birthday() {
    person.age += 1;
  }

  function changeRole() {
    person.role = person.role === 'Developer' ? 'Lead Developer' : 'Developer';
  }

  function updateCity() {
    company.address.city = company.address.city === 'Codeville' ? 'Frameworkton' : 'Codeville';
  }
</script>

<h1>Objects: Grouping Related Data</h1>

<section>
  <h2>Person Object</h2>
  <p>Name: <strong>{person.name}</strong></p>
  <p>Age: <strong>{person.age}</strong></p>
  <p>Role: <strong>{person.role}</strong></p>
  <div class="buttons">
    <button onclick={birthday}>Birthday (+1 age)</button>
    <button onclick={changeRole}>Toggle Role</button>
  </div>
</section>

<section>
  <h2>Bracket Notation</h2>
  <p>Selected field: <strong>{selectedField}</strong></p>
  <p>Value: <strong>{person[selectedField]}</strong></p>
  <div class="buttons">
    {#each fields as field}
      <button onclick={() => selectedField = field} class:active={selectedField === field}>
        {field}
      </button>
    {/each}
  </div>
</section>

<section>
  <h2>Nested Object</h2>
  <p>Company: <strong>{company.name}</strong> (founded {company.founded})</p>
  <p>Street: {company.address.street}</p>
  <p>City: <strong>{company.address.city}</strong></p>
  <p>Country: {company.address.country}</p>
  <button onclick={updateCity}>Toggle City</button>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .buttons { display: flex; gap: 8px; margin: 8px 0; flex-wrap: wrap; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover { background: #ff3e00; color: white; }
  .active { background: #ff3e00; color: white; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
