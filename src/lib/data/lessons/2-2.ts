import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '2-2',
		title: 'Passing Data: $props()',
		phase: 1,
		module: 2,
		lessonIndex: 2
	},
	description: `A component that always shows the same thing isn't very useful. The real power of components comes when you can **parameterize** them — pass in data from outside so the same component can render different things. Those parameters are called **props** (short for properties).

You saw in the last lesson that components are reusable. Props are what make them flexible. Think of a component like a function, and props like its arguments: \`<ProfileCard name="Alice" age={28} />\` is conceptually the same as calling \`ProfileCard({ name: 'Alice', age: 28 })\`.

In Svelte 5, a child component receives props via the \`$props()\` rune. You destructure the object it returns to get named variables — and you can give each prop a default value right in the destructure, for the cases when the parent doesn't pass it. This is destructuring (from lesson 1-3) in action.

You can pass any kind of data as a prop: strings, numbers, booleans, arrays, objects, even functions. Strings can be written directly as attributes; everything else goes inside curly braces. This lesson walks you through all the forms with realistic examples — a profile card, a button, and a stat tile.`,
	objectives: [
		'Pass data to child components using attributes',
		'Receive and destructure props with $props() in Svelte 5',
		'Set default values for optional props',
		'Pass strings, numbers, booleans, arrays, and objects as props',
		'Use derived values from props inside a component',
		'Understand that props flow DOWN from parent to child'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  import ProfileCard from './ProfileCard.svelte';
  import StatTile from './StatTile.svelte';
  import Button from './Button.svelte';

  // A list of users — we'll render one ProfileCard per user
  let users = $state([
    { name: 'Alice', role: 'Developer',    level: 5, active: true,  skills: ['JS', 'Svelte', 'CSS'] },
    { name: 'Bob',   role: 'Designer',     level: 3, active: true,  skills: ['Figma', 'UX'] },
    { name: 'Carol', role: 'Manager',      level: 7, active: false, skills: ['Agile', 'Leadership'] },
    { name: 'Dan',   role: 'QA Engineer',  level: 4, active: true,  skills: ['Testing', 'CI/CD'] }
  ]);

  let clickCount = $state(0);

  function handleClick() {
    clickCount += 1;
  }
</script>

<h1>Passing Data with $props()</h1>

<!-- ============================================================
     PART 1 — A grid of profile cards, each with different data
     ============================================================ -->
<section>
  <h2>1. Profile Cards (array of props)</h2>
  <div class="grid">
    {#each users as user (user.name)}
      <ProfileCard
        name={user.name}
        role={user.role}
        level={user.level}
        active={user.active}
        skills={user.skills}
      />
    {/each}
  </div>
</section>

<!-- ============================================================
     PART 2 — Default values: omit props and watch defaults kick in
     ============================================================ -->
<section>
  <h2>2. Default Values in Action</h2>
  <p class="note">
    The ProfileCard defines defaults for role, level, active, and skills.
    Only <code>name</code> is required below:
  </p>
  <div class="grid">
    <ProfileCard name="Eve" />
    <ProfileCard name="Finn" role="Intern" />
    <ProfileCard name="Grace" role="Architect" level={9} />
  </div>
</section>

<!-- ============================================================
     PART 3 — Stat tiles demonstrate number + string + color props
     ============================================================ -->
<section>
  <h2>3. Stat Tiles</h2>
  <div class="stats">
    <StatTile label="Users"    value={1240} color="#ff3e00" />
    <StatTile label="Revenue"  value={58900} color="#4ec9b0" prefix="$" />
    <StatTile label="Uptime"   value={99.9} color="#569cd6" suffix="%" />
    <StatTile label="Errors"   value={3} color="#f44747" />
  </div>
</section>

<!-- ============================================================
     PART 4 — Passing a FUNCTION as a prop (callback)
     ============================================================ -->
<section>
  <h2>4. Passing a Function (callback)</h2>
  <p>Click count from buttons: <strong>{clickCount}</strong></p>
  <div class="buttons">
    <Button label="Primary"   variant="primary"   onClick={handleClick} />
    <Button label="Secondary" variant="secondary" onClick={handleClick} />
    <Button label="Danger"    variant="danger"    onClick={handleClick} />
    <Button label="Disabled"  variant="primary"   disabled={true} onClick={handleClick} />
  </div>
  <p class="note">
    The parent passes a function; the child calls it when clicked.
    That's how child components communicate back up.
  </p>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 24px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #ff3e00; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
  .note { color: #999; font-size: 12px; font-style: italic; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 12px;
  }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
  .buttons { display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'ProfileCard.svelte',
			content: `<script>
  // ============================================================
  // $props() returns an object containing all the props the
  // parent passed in. Destructure them — and provide defaults
  // for anything optional.
  // ============================================================
  let {
    name,                     // required (no default)
    role = 'Member',          // default if parent omits
    level = 1,
    active = true,
    skills = []
  } = $props();

  // A derived value computed FROM props. It updates automatically
  // if the parent passes a new level.
  const stars = $derived('*'.repeat(level));
</script>

<div class="card" class:inactive={!active}>
  <h3>{name}</h3>
  <p class="role">{role}</p>
  <p class="level">Level {level}: <span class="stars">{stars}</span></p>

  {#if skills.length > 0}
    <div class="skills">
      {#each skills as skill (skill)}
        <span class="chip">{skill}</span>
      {/each}
    </div>
  {/if}

  <span class="badge" class:on={active} class:off={!active}>
    {active ? 'Active' : 'Away'}
  </span>
</div>

<style>
  .card {
    border: 2px solid #eee;
    border-radius: 10px;
    padding: 14px;
    background: white;
  }
  .inactive { opacity: 0.6; border-color: #ddd; }
  h3 { margin: 0 0 4px 0; color: #333; font-size: 16px; }
  .role { color: #666; font-size: 13px; margin: 0 0 4px 0; }
  .level { color: #ff3e00; font-size: 12px; margin: 0 0 8px 0; }
  .stars { font-family: monospace; letter-spacing: 2px; }
  .skills { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
  .chip {
    font-size: 10px; background: #f0f0f0; color: #555;
    padding: 2px 6px; border-radius: 8px;
  }
  .badge {
    display: inline-block; font-size: 10px;
    padding: 2px 8px; border-radius: 10px; font-weight: 700;
  }
  .badge.on { background: #e6f7f3; color: #4ec9b0; }
  .badge.off { background: #fdecea; color: #f44747; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'StatTile.svelte',
			content: `<script>
  // A flexible stat tile — label + value, plus optional
  // prefix (e.g. "$") and suffix (e.g. "%").
  let {
    label,
    value,
    color = '#ff3e00',
    prefix = '',
    suffix = ''
  } = $props();
</script>

<div class="tile" style="border-color: {color};">
  <div class="label">{label}</div>
  <div class="value" style="color: {color};">
    {prefix}{value}{suffix}
  </div>
</div>

<style>
  .tile {
    border: 2px solid;
    border-radius: 10px;
    padding: 12px;
    background: white;
    text-align: center;
  }
  .label {
    font-size: 11px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .value {
    font-size: 24px;
    font-weight: 700;
    margin-top: 4px;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Button.svelte',
			content: `<script>
  // A reusable button that takes its label, a variant for
  // styling, whether it's disabled, and a click handler.
  let {
    label,
    variant = 'primary',
    disabled = false,
    onClick
  } = $props();
</script>

<button
  class="btn {variant}"
  {disabled}
  onclick={onClick}
>
  {label}
</button>

<style>
  .btn {
    padding: 8px 16px;
    border: 2px solid;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    background: white;
    transition: all 0.2s;
  }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn.primary { border-color: #ff3e00; color: #ff3e00; }
  .btn.primary:hover:not(:disabled) { background: #ff3e00; color: white; }

  .btn.secondary { border-color: #569cd6; color: #569cd6; }
  .btn.secondary:hover:not(:disabled) { background: #569cd6; color: white; }

  .btn.danger { border-color: #f44747; color: #f44747; }
  .btn.danger:hover:not(:disabled) { background: #f44747; color: white; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
