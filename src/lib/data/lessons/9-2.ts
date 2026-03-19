import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '9-2',
		title: 'Checkboxes, Radios, Selects & Details',
		phase: 3,
		module: 9,
		lessonIndex: 2
	},
	description: `Beyond text inputs, Svelte provides specialized bindings for every common form element. Checkboxes use bind:checked for boolean state. Radio buttons and checkboxes that share a group use bind:group to manage which options are selected. Select elements use bind:value for single or multiple selections. Even the <details> element supports bind:open.

This lesson walks through each binding type so you can build complete, interactive forms without manual event wiring.`,
	objectives: [
		'Use bind:checked on checkboxes for boolean toggles',
		'Use bind:group on radio buttons and checkbox groups',
		'Bind select elements for single and multiple selections',
		'Use bind:open on details elements to control expand/collapse'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Checkbox: bind:checked gives you a boolean
  let agreed: boolean = $state(false);

  // Radio: bind:group shares a single value across the group
  let flavor: string = $state('vanilla');

  // Checkbox group: bind:group collects checked values into an array
  let toppings: string[] = $state([]);

  // Select: bind:value picks the selected option
  let size: string = $state('medium');

  // Details: bind:open tracks whether the element is expanded
  let detailsOpen: boolean = $state(false);

  const availableToppings: string[] = ['Sprinkles', 'Hot Fudge', 'Whipped Cream', 'Cherries'];
</script>

<main>
  <h1>Form Element Bindings</h1>

  <!-- Checkbox with bind:checked -->
  <section>
    <h2>Checkbox</h2>
    <label>
      <input type="checkbox" bind:checked={agreed} />
      I agree to the terms
    </label>
    <p>Agreed: <strong>{agreed}</strong></p>
  </section>

  <!-- Radio with bind:group -->
  <section>
    <h2>Radio (bind:group)</h2>
    {#each ['vanilla', 'chocolate', 'strawberry'] as option}
      <label>
        <input type="radio" bind:group={flavor} value={option} />
        {option}
      </label>
    {/each}
    <p>Selected flavor: <strong>{flavor}</strong></p>
  </section>

  <!-- Checkbox group with bind:group -->
  <section>
    <h2>Checkbox Group (bind:group)</h2>
    {#each availableToppings as topping}
      <label>
        <input type="checkbox" bind:group={toppings} value={topping} />
        {topping}
      </label>
    {/each}
    <p>Selected toppings: <strong>{toppings.join(', ') || 'none'}</strong></p>
  </section>

  <!-- Select with bind:value -->
  <section>
    <h2>Select</h2>
    <select bind:value={size}>
      <option value="small">Small</option>
      <option value="medium">Medium</option>
      <option value="large">Large</option>
    </select>
    <p>Size: <strong>{size}</strong></p>
  </section>

  <!-- Details with bind:open -->
  <section>
    <h2>Details</h2>
    <details bind:open={detailsOpen}>
      <summary>Order Summary</summary>
      <p>Flavor: {flavor}, Size: {size}</p>
      <p>Toppings: {toppings.join(', ') || 'none'}</p>
    </details>
    <p>Details open: <strong>{detailsOpen}</strong></p>
    <button onclick={() => detailsOpen = !detailsOpen}>
      {detailsOpen ? 'Close' : 'Open'} Details
    </button>
  </section>
</main>

<style>
  main { max-width: 500px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  label { display: block; margin: 0.25rem 0; cursor: pointer; }
  select { padding: 0.5rem; font-size: 1rem; }
  button { padding: 0.5rem 1rem; cursor: pointer; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
