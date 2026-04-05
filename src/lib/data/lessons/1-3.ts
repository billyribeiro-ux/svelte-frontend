import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '1-3',
		title: 'Destructuring',
		phase: 1,
		module: 1,
		lessonIndex: 3
	},
	description: `You have an object, and you need to use several of its properties. You *could* write \`user.name\`, \`user.age\`, \`user.email\` over and over… but that's repetitive and noisy. **Destructuring** is a shorthand that pulls values out of objects and arrays into local variables in a single, readable line.

Think of destructuring as *unpacking a box*: the box is the object or array, and you're taking out specific items and giving them names as you go. Once you see it, you'll recognize it everywhere — it's one of the most-used features of modern JavaScript and Svelte component code.

Destructuring is especially important in Svelte 5 because it's how components receive props: \`let { title, count } = $props()\` — you'll meet this pattern in Module 2. Mastering destructuring now makes everything else easier later.

This lesson walks through every flavor: object destructuring, array destructuring, default values, renaming, nested patterns, rest syntax, and destructuring in function parameters and return values.`,
	objectives: [
		'Destructure objects to extract properties into variables',
		'Destructure arrays to extract elements by position',
		'Use default values for missing properties',
		'Rename variables during destructuring',
		'Destructure nested objects and use the rest (...) operator',
		'Use destructuring in function parameters for cleaner APIs'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ============================================================
  // EXAMPLE 1 — Basic object destructuring
  // ------------------------------------------------------------
  // The "old way" would be:
  //   const name = user.name;
  //   const age = user.age;
  //   const role = user.role;
  // Destructuring does all three in one line.
  // ============================================================
  const user = {
    name: 'Ada Lovelace',
    age: 28,
    role: 'Engineer',
    city: 'London',
    email: 'ada@example.com'
  };

  const { name, age, role, city } = user;
  // Now 'name', 'age', 'role', 'city' are normal variables.

  // ============================================================
  // EXAMPLE 2 — Renaming while destructuring
  // ------------------------------------------------------------
  // Sometimes the key name clashes with an existing variable,
  // or you just want a clearer name. Use "key: newName".
  // ============================================================
  const response = {
    status: 200,
    data: 'Success!',
    error: null
  };

  const {
    status: httpStatus,
    data: responseBody
  } = response;
  // httpStatus === 200, responseBody === 'Success!'

  // ============================================================
  // EXAMPLE 3 — Default values
  // ------------------------------------------------------------
  // If a property is undefined, the default kicks in. Super
  // useful for config objects where most fields are optional.
  // ============================================================
  const config = { theme: 'dark' };
  const {
    theme,
    fontSize = 16,
    language = 'en',
    showSidebar = true
  } = config;

  // ============================================================
  // EXAMPLE 4 — Nested destructuring
  // ------------------------------------------------------------
  // Reach deep into nested objects in one statement. The
  // shape of the pattern mirrors the shape of the object.
  // ============================================================
  const company = {
    name: 'TechCo',
    address: {
      street: '456 Code Ave',
      city: 'DevTown',
      country: 'Webland'
    },
    founder: {
      name: 'Grace',
      since: 1985
    }
  };

  const {
    name: companyName,
    address: { street, city: companyCity, country },
    founder: { name: founderName, since }
  } = company;

  // ============================================================
  // EXAMPLE 5 — Array destructuring
  // ------------------------------------------------------------
  // Arrays are destructured by POSITION, not by name. Use
  // commas to skip items, and ...rest to collect the leftovers.
  // ============================================================
  const colors = ['red', 'green', 'blue', 'yellow', 'purple'];
  const [firstColor, secondColor, ...otherColors] = colors;

  // Skipping elements with empty commas
  const scores = [95, 87, 72, 91, 88];
  const [topScore, , thirdScore] = scores;

  // ============================================================
  // EXAMPLE 6 — The swap trick (array destructuring)
  // ------------------------------------------------------------
  // Swapping two variables used to need a temp variable.
  // With destructuring it's a one-liner.
  // ============================================================
  let a = $state('Hello');
  let b = $state('World');

  function swap() {
    [a, b] = [b, a];
  }

  // ============================================================
  // EXAMPLE 7 — Destructuring in function parameters
  // ------------------------------------------------------------
  // Instead of accepting a big object and digging in, destructure
  // it right in the parameter list. This is how Svelte props work!
  // ============================================================
  function greet({ name, greeting = 'Hello' }) {
    return \`\${greeting}, \${name}!\`;
  }

  const greetings = [
    greet({ name: 'Alice' }),
    greet({ name: 'Bob', greeting: 'Hi' }),
    greet({ name: 'Carol', greeting: 'Hey' })
  ];

  // ============================================================
  // EXAMPLE 8 — Destructuring function return values
  // ------------------------------------------------------------
  // A function that returns an object can be "unpacked" at the
  // call site. Very common for utility functions.
  // ============================================================
  function analyze(numbers) {
    return {
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      sum: numbers.reduce((a, b) => a + b, 0),
      avg: numbers.reduce((a, b) => a + b, 0) / numbers.length
    };
  }

  const { min, max, sum, avg } = analyze([4, 7, 2, 9, 1, 5]);

  // ============================================================
  // EXAMPLE 9 — Real-world: destructuring an API-shaped object
  // ------------------------------------------------------------
  // This is what you'll see constantly when working with APIs.
  // ============================================================
  const apiResult = {
    ok: true,
    user: {
      id: 42,
      profile: { handle: '@svelte_fan', followers: 1200 }
    },
    meta: { requestId: 'abc-123' }
  };

  const {
    ok,
    user: { id: userId, profile: { handle, followers } },
    meta: { requestId }
  } = apiResult;
</script>

<h1>Destructuring</h1>

<section>
  <h2>1. Basic Object Destructuring</h2>
  <p><strong>{name}</strong>, age {age}, works as {role} in {city}</p>
  <p class="note">const {'{'} name, age, role, city {'}'} = user</p>
</section>

<section>
  <h2>2. Renaming</h2>
  <p>HTTP Status: <strong>{httpStatus}</strong></p>
  <p>Body: <strong>{responseBody}</strong></p>
  <p class="note">const {'{'} status: httpStatus {'}'} = response</p>
</section>

<section>
  <h2>3. Default Values</h2>
  <p>theme: <strong>{theme}</strong> (from object)</p>
  <p>fontSize: <strong>{fontSize}</strong> (default)</p>
  <p>language: <strong>{language}</strong> (default)</p>
  <p>showSidebar: <strong>{showSidebar}</strong> (default)</p>
</section>

<section>
  <h2>4. Nested Destructuring</h2>
  <p>{companyName} is at {street}, {companyCity}, {country}</p>
  <p>Founded by {founderName} in {since}</p>
</section>

<section>
  <h2>5. Array Destructuring</h2>
  <p>First: <strong>{firstColor}</strong>, Second: <strong>{secondColor}</strong></p>
  <p>Rest: {otherColors.join(', ')}</p>
  <p>Top score: {topScore}, Third (skipped 2nd): {thirdScore}</p>
</section>

<section>
  <h2>6. Swap with Destructuring</h2>
  <p>a = "<strong>{a}</strong>", b = "<strong>{b}</strong>"</p>
  <button onclick={swap}>Swap a and b</button>
  <p class="note">[a, b] = [b, a]</p>
</section>

<section>
  <h2>7. Destructuring in Function Parameters</h2>
  <ul>
    {#each greetings as g, i (i)}
      <li>{g}</li>
    {/each}
  </ul>
  <p class="note">function greet({'{'} name, greeting = 'Hello' {'}'}) {'{'} ... {'}'}</p>
</section>

<section>
  <h2>8. Destructuring Function Returns</h2>
  <p>min: {min} | max: {max} | sum: {sum} | avg: {avg.toFixed(2)}</p>
</section>

<section>
  <h2>9. Real-World API Shape</h2>
  <p>ok: <strong>{ok}</strong></p>
  <p>User #{userId}: {handle} ({followers} followers)</p>
  <p class="note">requestId: {requestId}</p>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .note { color: #999; font-family: monospace; font-size: 12px; font-style: italic; }
  ul { padding-left: 20px; }
  li { color: #444; font-size: 14px; }
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
