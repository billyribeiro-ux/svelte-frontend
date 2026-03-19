import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '1-5',
		title: 'Operators & Comparisons',
		phase: 1,
		module: 1,
		lessonIndex: 5
	},
	description: `Operators are the building blocks of logic. You use arithmetic operators for math, comparison operators to check conditions, and logical operators to combine them. A common source of bugs is using == instead of === — this lesson makes the difference crystal clear.

You'll also learn the ternary operator for inline conditionals and logical AND (&&) for conditional rendering.`,
	objectives: [
		'Use === instead of == for strict equality comparisons',
		'Write ternary expressions for inline conditional values',
		'Use logical AND (&&) for conditional rendering in templates'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let a = $state(10);
  let b = $state(5);

  // Arithmetic
  const sum = $derived(a + b);
  const difference = $derived(a - b);
  const product = $derived(a * b);
  const quotient = $derived(a / b);
  const remainder = $derived(a % b);

  // === vs ==
  let testValue = $state('5');
  const looseEqual = $derived(testValue == 5);   // true — coerces types
  const strictEqual = $derived(testValue === 5); // false — different types

  // Ternary operator
  let score = $state(75);
  const grade = $derived(
    score >= 90 ? 'A' :
    score >= 80 ? 'B' :
    score >= 70 ? 'C' :
    score >= 60 ? 'D' : 'F'
  );

  // Logical operators
  let isLoggedIn = $state(true);
  let isAdmin = $state(false);
  const canEdit = $derived(isLoggedIn && isAdmin);
  const hasAccess = $derived(isLoggedIn || isAdmin);

  // Conditional rendering with &&
  let showBanner = $state(true);
  let itemCount = $state(3);
</script>

<h1>Operators & Comparisons</h1>

<section>
  <h2>Arithmetic</h2>
  <div class="input-row">
    <label>a: <input type="number" bind:value={a} /></label>
    <label>b: <input type="number" bind:value={b} /></label>
  </div>
  <p>{a} + {b} = <strong>{sum}</strong></p>
  <p>{a} - {b} = <strong>{difference}</strong></p>
  <p>{a} * {b} = <strong>{product}</strong></p>
  <p>{a} / {b} = <strong>{quotient}</strong></p>
  <p>{a} % {b} = <strong>{remainder}</strong></p>
</section>

<section>
  <h2>=== vs == (Always use ===)</h2>
  <p>testValue = "{testValue}" (type: {typeof testValue})</p>
  <p>"{testValue}" == 5 (loose): <strong class:true-val={looseEqual} class:false-val={!looseEqual}>{looseEqual}</strong></p>
  <p>"{testValue}" === 5 (strict): <strong class:true-val={strictEqual} class:false-val={!strictEqual}>{strictEqual}</strong></p>
  <p class="note">== coerces types (dangerous). === checks type AND value (safe).</p>
</section>

<section>
  <h2>Ternary Operator</h2>
  <label>Score: <input type="range" bind:value={score} min="0" max="100" /></label>
  <p>Score: {score} — Grade: <strong class="grade">{grade}</strong></p>
  <p class="note">condition ? valueIfTrue : valueIfFalse</p>
</section>

<section>
  <h2>Logical Operators</h2>
  <div class="toggles">
    <label><input type="checkbox" bind:checked={isLoggedIn} /> Logged in</label>
    <label><input type="checkbox" bind:checked={isAdmin} /> Admin</label>
  </div>
  <p>isLoggedIn && isAdmin (AND): <strong class:true-val={canEdit} class:false-val={!canEdit}>{canEdit}</strong></p>
  <p>isLoggedIn || isAdmin (OR): <strong class:true-val={hasAccess} class:false-val={!hasAccess}>{hasAccess}</strong></p>
</section>

<section>
  <h2>Conditional Rendering with &&</h2>
  <label><input type="checkbox" bind:checked={showBanner} /> Show banner</label>
  {#if showBanner}
    <div class="banner">This banner is visible!</div>
  {/if}

  {#if itemCount > 0}
    <p>You have <strong>{itemCount}</strong> items in your cart.</p>
  {/if}
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .note { color: #999; font-size: 12px; font-style: italic; }
  .true-val { color: #4ec9b0; }
  .false-val { color: #f44747; }
  .grade { font-size: 20px; color: #ff3e00; }
  .input-row { display: flex; gap: 12px; margin-bottom: 8px; }
  .toggles { display: flex; gap: 16px; margin-bottom: 8px; }
  label { color: #444; font-size: 14px; display: flex; align-items: center; gap: 4px; }
  input[type="number"] { width: 60px; padding: 4px; border: 2px solid #ddd; border-radius: 4px; }
  input[type="range"] { width: 200px; }
  .banner {
    background: #4ec9b0; color: white; padding: 8px 16px;
    border-radius: 6px; margin: 8px 0; font-weight: 600;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
