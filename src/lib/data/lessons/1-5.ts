import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '1-5',
		title: 'Operators & Comparisons',
		phase: 1,
		module: 1,
		lessonIndex: 5
	},
	description: `Operators are the punctuation of programming: tiny symbols that let you do math, compare values, and combine logical conditions. You already know \`+\`, \`-\`, \`*\`, \`/\` — but JavaScript has a rich toolkit beyond those, and using the right operator is the difference between clean code and mysterious bugs.

The most infamous footgun in JavaScript is \`==\` (loose equality). It *coerces* types, so \`"5" == 5\` is true, and so is \`0 == false\`, and \`null == undefined\`. Almost always you want \`===\` (strict equality) instead. This lesson hammers that difference home with live examples.

You'll also learn the **ternary operator** (\`a ? b : c\`), which is a one-line \`if/else\` that returns a value — perfect for inline template logic. And you'll meet **logical operators** (\`&&\`, \`||\`, \`??\`) and see how they power both boolean logic and conditional rendering in Svelte markup.

By the end, you'll write clearer conditionals, avoid type-coercion bugs, and know which operator to reach for in any situation.`,
	objectives: [
		'Perform arithmetic and understand operator precedence',
		'Use === instead of == for strict equality comparisons',
		'Write ternary expressions for inline conditional values',
		'Use logical AND (&&), OR (||), and nullish coalescing (??)',
		'Apply conditional rendering with {#if} and short-circuit patterns',
		'Use comparison operators (<, >, <=, >=) for numeric checks'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ============================================================
  // EXAMPLE 1 — Arithmetic operators
  // ------------------------------------------------------------
  // + - * / %    and the power operator **
  // Parentheses control precedence, just like in math.
  // ============================================================
  let a = $state(10);
  let b = $state(3);

  const sum = $derived(a + b);
  const difference = $derived(a - b);
  const product = $derived(a * b);
  const quotient = $derived(a / b);
  const remainder = $derived(a % b);   // modulo — the leftover
  const power = $derived(a ** b);      // a to the power of b

  // ============================================================
  // EXAMPLE 2 — Strict vs loose equality
  // ------------------------------------------------------------
  // == converts types before comparing (DANGEROUS).
  // === compares type AND value (SAFE — use this).
  // ============================================================
  let testValue = $state('5');
  const looseEqual = $derived(testValue == 5);    // true — "5" becomes 5
  const strictEqual = $derived(testValue === 5);  // false — string vs number

  // Famous == gotchas
  const gotcha1 = 0 == false;         // true
  const gotcha2 = '' == false;        // true
  const gotcha3 = null == undefined;  // true
  const gotcha4 = [] == false;        // true

  // ============================================================
  // EXAMPLE 3 — Comparison operators
  // ------------------------------------------------------------
  // < > <= >= — numeric ordering
  // ============================================================
  let score = $state(75);

  // Chained ternary — like a mini if/else if/else
  const grade = $derived(
    score >= 90 ? 'A' :
    score >= 80 ? 'B' :
    score >= 70 ? 'C' :
    score >= 60 ? 'D' : 'F'
  );

  const passed = $derived(score >= 60);

  // ============================================================
  // EXAMPLE 4 — Logical operators: && and ||
  // ------------------------------------------------------------
  // && (AND) — both sides must be truthy
  // || (OR)  — at least one side must be truthy
  // ============================================================
  let isLoggedIn = $state(true);
  let isAdmin = $state(false);
  let isPremium = $state(true);

  const canEdit = $derived(isLoggedIn && isAdmin);
  const canView = $derived(isLoggedIn || isAdmin);
  const canAccessFeature = $derived(isLoggedIn && (isAdmin || isPremium));

  // ============================================================
  // EXAMPLE 5 — Nullish coalescing (??) vs OR (||)
  // ------------------------------------------------------------
  // ?? returns the right side ONLY if the left is null/undefined.
  // || returns the right side for ANY falsy value (0, '', false...).
  // Use ?? for default values where 0 or '' are valid!
  // ============================================================
  let userCount = $state(0);
  const displayCountOr = $derived(userCount || 'unknown');   // 'unknown' — bug!
  const displayCountNullish = $derived(userCount ?? 'unknown'); // 0 — correct

  // ============================================================
  // EXAMPLE 6 — Conditional rendering with {#if} and &&
  // ------------------------------------------------------------
  // Show/hide parts of the UI based on state. This is the
  // gateway to dynamic interfaces.
  // ============================================================
  let showBanner = $state(true);
  let itemCount = $state(3);
  let username = $state('');
</script>

<h1>Operators &amp; Comparisons</h1>

<section>
  <h2>1. Arithmetic</h2>
  <div class="input-row">
    <label>a: <input type="number" bind:value={a} /></label>
    <label>b: <input type="number" bind:value={b} /></label>
  </div>
  <p>{a} + {b} = <strong>{sum}</strong></p>
  <p>{a} - {b} = <strong>{difference}</strong></p>
  <p>{a} * {b} = <strong>{product}</strong></p>
  <p>{a} / {b} = <strong>{quotient}</strong></p>
  <p>{a} % {b} = <strong>{remainder}</strong> (modulo / remainder)</p>
  <p>{a} ** {b} = <strong>{power}</strong> (power)</p>
</section>

<section>
  <h2>2. === vs == (always use ===)</h2>
  <div class="input-row">
    <label>testValue: <input bind:value={testValue} /></label>
  </div>
  <p>typeof testValue: <code>{typeof testValue}</code></p>
  <p>
    "{testValue}" == 5 (loose):
    <strong class:true-val={looseEqual} class:false-val={!looseEqual}>
      {looseEqual}
    </strong>
  </p>
  <p>
    "{testValue}" === 5 (strict):
    <strong class:true-val={strictEqual} class:false-val={!strictEqual}>
      {strictEqual}
    </strong>
  </p>
  <details>
    <summary>Infamous == gotchas</summary>
    <p>0 == false → <strong>{gotcha1}</strong></p>
    <p>'' == false → <strong>{gotcha2}</strong></p>
    <p>null == undefined → <strong>{gotcha3}</strong></p>
    <p>[] == false → <strong>{gotcha4}</strong></p>
  </details>
</section>

<section>
  <h2>3. Comparison + Ternary (grading)</h2>
  <label>
    Score: {score}
    <input type="range" bind:value={score} min="0" max="100" />
  </label>
  <p>
    Grade: <strong class="grade">{grade}</strong> —
    {passed ? 'PASSED' : 'FAILED'}
  </p>
  <p class="note">Chained ternaries act like a switch statement.</p>
</section>

<section>
  <h2>4. Logical Operators (&amp;&amp; and ||)</h2>
  <div class="toggles">
    <label><input type="checkbox" bind:checked={isLoggedIn} /> Logged in</label>
    <label><input type="checkbox" bind:checked={isAdmin} /> Admin</label>
    <label><input type="checkbox" bind:checked={isPremium} /> Premium</label>
  </div>
  <p>
    canEdit (logged &amp;&amp; admin):
    <strong class:true-val={canEdit} class:false-val={!canEdit}>{canEdit}</strong>
  </p>
  <p>
    canView (logged || admin):
    <strong class:true-val={canView} class:false-val={!canView}>{canView}</strong>
  </p>
  <p>
    canAccessFeature (logged &amp;&amp; (admin || premium)):
    <strong class:true-val={canAccessFeature} class:false-val={!canAccessFeature}>{canAccessFeature}</strong>
  </p>
</section>

<section>
  <h2>5. ?? vs || (default values)</h2>
  <label>
    userCount: {userCount}
    <input type="range" bind:value={userCount} min="0" max="10" />
  </label>
  <p>userCount || 'unknown' → <strong>{displayCountOr}</strong></p>
  <p>userCount ?? 'unknown' → <strong>{displayCountNullish}</strong></p>
  <p class="note">Set the slider to 0 — notice || gives 'unknown' (bug), ?? gives 0 (correct).</p>
</section>

<section>
  <h2>6. Conditional Rendering</h2>
  <label><input type="checkbox" bind:checked={showBanner} /> Show banner</label>
  {#if showBanner}
    <div class="banner">This banner only renders when showBanner is true.</div>
  {/if}

  <label>Items: <input type="number" bind:value={itemCount} min="0" max="99" /></label>
  {#if itemCount > 0}
    <p>You have <strong>{itemCount}</strong> item{itemCount !== 1 ? 's' : ''} in your cart.</p>
  {:else}
    <p class="note">Your cart is empty.</p>
  {/if}

  <input bind:value={username} placeholder="Enter username..." />
  {#if username.length >= 3}
    <p class="true-val">Valid name: {username}</p>
  {:else if username.length > 0}
    <p class="false-val">Too short — need 3+ characters.</p>
  {:else}
    <p class="note">Please type a username.</p>
  {/if}
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 24px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
  .note { color: #999; font-size: 12px; font-style: italic; }
  .true-val { color: #4ec9b0; font-weight: 600; }
  .false-val { color: #f44747; font-weight: 600; }
  .grade { font-size: 22px; color: #ff3e00; }
  .input-row { display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
  .toggles { display: flex; gap: 16px; margin-bottom: 8px; flex-wrap: wrap; }
  label { color: #444; font-size: 14px; display: flex; align-items: center; gap: 6px; }
  input[type="number"] { width: 70px; padding: 4px; border: 2px solid #ddd; border-radius: 4px; }
  input[type="range"] { width: 200px; }
  input:not([type]) { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; }
  .banner {
    background: #4ec9b0; color: white; padding: 10px 16px;
    border-radius: 6px; margin: 8px 0; font-weight: 600;
  }
  details { margin-top: 8px; font-size: 13px; }
  summary { cursor: pointer; color: #ff3e00; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
