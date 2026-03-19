import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '1-3',
		title: 'Destructuring',
		phase: 1,
		module: 1,
		lessonIndex: 3
	},
	description: `Destructuring lets you pull values out of objects and arrays into individual variables in a single, clean statement. Instead of writing user.name, user.age, user.role on separate lines, you write const { name, age, role } = user. It's one of the most common patterns in modern JavaScript.

This lesson covers object destructuring, array destructuring, default values, renaming, and nested destructuring.`,
	objectives: [
		'Destructure objects to extract properties into variables',
		'Destructure arrays to extract elements by position',
		'Use default values and renaming in destructuring patterns'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // Object destructuring
  const user = { name: 'Ada', age: 28, role: 'Engineer', city: 'London' };
  const { name, age, role, city } = user;

  // Renaming during destructuring
  const response = { status: 200, data: 'Success', error: null };
  const { status: httpStatus, data: responseData } = response;

  // Default values
  const config = { theme: 'dark' };
  const { theme, fontSize = 16, language = 'en' } = config;

  // Nested destructuring
  const company = {
    name: 'TechCo',
    address: { street: '456 Code Ave', city: 'DevTown' }
  };
  const { name: companyName, address: { street, city: companyCity } } = company;

  // Array destructuring
  const colors = ['red', 'green', 'blue', 'yellow'];
  const [first, second, ...rest] = colors;

  // Skipping elements
  const scores = [95, 87, 72, 91, 88];
  const [best, , third] = scores;

  // Swap values with destructuring
  let a = $state('Hello');
  let b = $state('World');

  function swap() {
    [a, b] = [b, a];
  }

  // Practical: destructuring function return
  function getMinMax(numbers) {
    return {
      min: Math.min(...numbers),
      max: Math.max(...numbers)
    };
  }
  const { min, max } = getMinMax([4, 7, 2, 9, 1]);
</script>

<h1>Destructuring</h1>

<section>
  <h2>Object Destructuring</h2>
  <p>{name}, age {age}, works as {role} in {city}</p>
</section>

<section>
  <h2>Renaming</h2>
  <p>HTTP Status: {httpStatus}, Data: {responseData}</p>
  <p class="note">const {'{'} status: httpStatus {'}'} = response</p>
</section>

<section>
  <h2>Default Values</h2>
  <p>Theme: {theme} (from object)</p>
  <p>Font size: {fontSize} (default — not in object)</p>
  <p>Language: {language} (default — not in object)</p>
</section>

<section>
  <h2>Nested Destructuring</h2>
  <p>{companyName} is at {street}, {companyCity}</p>
</section>

<section>
  <h2>Array Destructuring</h2>
  <p>First: {first}, Second: {second}</p>
  <p>Rest: {rest.join(', ')}</p>
  <p>Best score: {best}, Third score: {third}</p>
</section>

<section>
  <h2>Swap with Destructuring</h2>
  <p>a = "<strong>{a}</strong>", b = "<strong>{b}</strong>"</p>
  <button onclick={swap}>Swap a & b</button>
</section>

<section>
  <h2>Destructure Function Returns</h2>
  <p>Min: {min}, Max: {max}</p>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .note { color: #999; font-family: monospace; font-size: 12px; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px; margin-top: 4px;
  }
  button:hover { background: #ff3e00; color: white; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
