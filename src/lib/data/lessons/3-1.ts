import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '3-1',
		title: 'Control Flow: if/else, switch',
		phase: 1,
		module: 3,
		lessonIndex: 1
	},
	description: `Svelte's template syntax gives you {#if} blocks for deciding *what to render*, but plenty of logic still belongs in plain JavaScript — inside your \`<script>\` block, inside helper functions, and inside \`$derived\` expressions. That's where if/else, switch/case, and the ternary operator earn their keep.

Think of it this way: every time you need to compute a value that depends on a condition, you have three tools. **if/else chains** are the workhorse — they handle ranges, multiple variables, and complex boolean expressions. **switch/case** is a specialized tool that shines when you compare one value against a fixed list of possibilities. The **ternary operator** (\`condition ? a : b\`) is a compact expression for tiny either/or decisions, perfect inline in a \`$derived\` or JSX-like expression.

A mental model that helps: if/else is imperative ("do this, then that"), switch is declarative ("match this value against these cases"), and ternary is expressional ("this value equals this OR that"). Choosing the right one isn't a style preference — it's about matching the shape of your problem.

Two patterns deserve special attention. **Guard clauses** flatten nested code by returning early on edge cases, keeping your happy path at the bottom and un-indented. **Intentional fall-through** in switch statements lets multiple cases share a single branch — very handy when grouping related values like weekend days or HTTP status ranges.

Common pitfalls to avoid: forgetting \`return\` or \`break\` in a switch case causes silent fall-through; writing deeply nested if/else instead of guard clauses makes code hard to scan; using \`==\` instead of \`===\` invites type-coercion bugs (always prefer strict equality).`,
	objectives: [
		'Use if/else chains to match against numeric ranges and multiple variables',
		'Use switch/case to match a single value against a fixed list of possibilities',
		'Apply guard clauses to flatten nested logic and handle edge cases early',
		'Use the ternary operator for concise inline either/or expressions',
		'Combine multiple conditions in real-world decision logic like a shipping calculator',
		'Understand intentional switch fall-through for grouping related cases'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === CONTROL FLOW IN SCRIPTS ===
  // {#if} in templates decides *what to render*.
  // if/else in <script> decides *what to compute*.
  // We combine both in this lesson.

  // --- Example 1: if/else chains — HTTP status categories ---
  let httpCode = $state(200);

  function getStatusMessage(code) {
    // switch/case is ideal for matching against a fixed set of values.
    // Each case must 'return' (or 'break') to avoid fall-through.
    switch (code) {
      case 200: return 'OK — Request succeeded';
      case 201: return 'Created — Resource created';
      case 204: return 'No Content — Success, nothing to return';
      case 301: return 'Moved Permanently — Redirect';
      case 302: return 'Found — Temporary redirect';
      case 400: return 'Bad Request — Check your input';
      case 401: return 'Unauthorized — Please log in';
      case 403: return 'Forbidden — Access denied';
      case 404: return 'Not Found — Resource missing';
      case 418: return "I'm a teapot — (yes, really)";
      case 500: return 'Server Error — Try again later';
      case 503: return 'Service Unavailable — Overloaded';
      default:  return 'Unknown status code';
    }
  }

  function getStatusCategory(code) {
    // if/else chains shine when we match against *ranges*, not single values.
    if (code >= 100 && code < 200) return 'info';
    if (code >= 200 && code < 300) return 'success';
    if (code >= 300 && code < 400) return 'redirect';
    if (code >= 400 && code < 500) return 'client-error';
    if (code >= 500)               return 'server-error';
    return 'unknown';
  }

  // --- Example 2: Guard clauses — permissions ---
  let userRole = $state('editor');

  function getPermissions(role) {
    // Edge cases first — return early to short-circuit.
    if (!role) return [];
    if (typeof role !== 'string') return [];

    // Happy path: a flat series of equality checks.
    if (role === 'owner')  return ['read', 'write', 'delete', 'manage', 'billing'];
    if (role === 'admin')  return ['read', 'write', 'delete', 'manage'];
    if (role === 'editor') return ['read', 'write'];
    if (role === 'viewer') return ['read'];

    return [];
  }

  // --- Example 3: Ternary operator ---
  let isDarkMode = $state(false);
  const themeLabel = $derived(isDarkMode ? 'Dark Mode' : 'Light Mode');
  const themeIcon  = $derived(isDarkMode ? '🌙' : '☀️');

  // --- Example 4: Switch with fall-through grouping ---
  let dayOfWeek = $state(3);

  function dayType(day) {
    switch (day) {
      case 0:
      case 6:
        return 'Weekend';
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        return 'Weekday';
      default:
        return 'Invalid day';
    }
  }

  // --- Example 5: Nested conditions — shipping calculator ---
  let cartTotal = $state(45);
  let isPremium = $state(false);
  let country   = $state('US');

  function calculateShipping(total, premium, country) {
    if (premium) return 0;
    if (country !== 'US') {
      if (total >= 150) return 15;
      return 30;
    }
    if (total >= 100) return 0;
    if (total >= 50)  return 5;
    return 10;
  }

  const statusMessage  = $derived(getStatusMessage(httpCode));
  const statusCategory = $derived(getStatusCategory(httpCode));
  const permissions    = $derived(getPermissions(userRole));
  const currentDayType = $derived(dayType(dayOfWeek));
  const shipping       = $derived(calculateShipping(cartTotal, isPremium, country));

  const codes    = [200, 201, 301, 400, 401, 403, 404, 418, 500, 503];
  const roles    = ['owner', 'admin', 'editor', 'viewer', 'guest'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
</script>

<h1>Control Flow: if/else, switch</h1>

<section class:dark={isDarkMode}>
  <h2>1. switch/case — HTTP Status Codes</h2>
  <p class="hint">Switch is ideal when you match a value against a known list.</p>
  <div class="button-grid">
    {#each codes as code (code)}
      <button class:active={httpCode === code} onclick={() => (httpCode = code)}>
        {code}
      </button>
    {/each}
  </div>
  <div class="result {statusCategory}">
    <strong>{httpCode}</strong>: {statusMessage}
  </div>
  <p>Category (from if/else ranges): <strong>{statusCategory}</strong></p>
</section>

<section>
  <h2>2. Guard Clauses — Role Permissions</h2>
  <p class="hint">Return early for edge cases; keep the happy path flat.</p>
  <div class="button-grid">
    {#each roles as role (role)}
      <button class:active={userRole === role} onclick={() => (userRole = role)}>
        {role}
      </button>
    {/each}
  </div>
  <div class="permissions">
    {#each permissions as perm (perm)}
      <span class="perm">{perm}</span>
    {:else}
      <span class="none">No permissions for "{userRole}"</span>
    {/each}
  </div>
</section>

<section>
  <h2>3. Ternary Operator — Theme Toggle</h2>
  <p class="hint">Perfect for small either/or expressions.</p>
  <button onclick={() => (isDarkMode = !isDarkMode)}>
    {themeIcon} Switch to {isDarkMode ? 'Light' : 'Dark'}
  </button>
  <p>Current theme: <strong>{themeLabel}</strong></p>
</section>

<section>
  <h2>4. switch with Fall-Through — Day Type</h2>
  <p class="hint">Omitting 'return' lets multiple cases share a branch.</p>
  <div class="button-grid">
    {#each dayNames as name, i (name)}
      <button class:active={dayOfWeek === i} onclick={() => (dayOfWeek = i)}>
        {name}
      </button>
    {/each}
  </div>
  <p>
    <strong>{dayNames[dayOfWeek]}</strong> is a <strong>{currentDayType}</strong>
  </p>
</section>

<section>
  <h2>5. Nested Conditions — Shipping Calculator</h2>
  <p class="hint">Real decisions combine several factors — order matters.</p>
  <div class="controls">
    <label>Cart total: $
      <input type="number" bind:value={cartTotal} min="0" step="5" />
    </label>
    <label>
      <input type="checkbox" bind:checked={isPremium} />
      Premium member
    </label>
    <label>Country:
      <select bind:value={country}>
        <option value="US">US</option>
        <option value="CA">Canada</option>
        <option value="UK">UK</option>
        <option value="JP">Japan</option>
      </select>
    </label>
  </div>
  <div class="ship-result">
    Shipping cost: <strong>{shipping === 0 ? 'FREE' : '$' + shipping}</strong>
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 22px; font-family: sans-serif; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  .hint { color: #999; font-size: 12px; font-style: italic; }
  strong { color: #222; }
  .button-grid { display: flex; gap: 6px; flex-wrap: wrap; margin: 6px 0; }
  .result { padding: 10px; border-radius: 6px; margin: 8px 0; font-size: 14px; }
  .info          { background: #e6f0ff; color: #3b7dd8; }
  .success       { background: #e6f7f3; color: #2d8a6e; }
  .redirect      { background: #fff8e1; color: #b28704; }
  .client-error  { background: #fff3e0; color: #e65100; }
  .server-error  { background: #fdecea; color: #c62828; }
  .unknown       { background: #f0f0f0; color: #666; }
  .permissions { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
  .perm { padding: 4px 10px; background: #e6f7f3; color: #2d8a6e; border-radius: 4px; font-size: 13px; font-weight: 600; }
  .none { color: #999; font-style: italic; font-size: 13px; }
  .controls { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin: 6px 0; }
  label { font-size: 13px; color: #444; display: flex; align-items: center; gap: 4px; }
  input[type="number"] { width: 70px; padding: 4px 8px; border: 2px solid #ddd; border-radius: 4px; }
  select { padding: 4px 8px; border: 2px solid #ddd; border-radius: 4px; }
  .ship-result { background: #f8f8f8; padding: 10px; border-radius: 6px; margin-top: 6px; font-size: 14px; }
  button {
    padding: 6px 14px; border: 2px solid #ddd; background: white;
    color: #666; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover { border-color: #ff3e00; color: #ff3e00; }
  .active { border-color: #ff3e00; background: #ff3e00; color: white; }
  .dark { background: #1e1e1e; color: #d4d4d4; padding: 10px; border-radius: 6px; }
  .dark h2 { color: #d4d4d4; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
