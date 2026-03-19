import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '8-7',
		title: 'satisfies, ReturnType & app.d.ts',
		phase: 2,
		module: 8,
		lessonIndex: 7
	},
	description: `The satisfies operator validates that a value matches a type without widening it. When you write const config = {...} satisfies Config, TypeScript checks that config has the right shape BUT preserves the exact literal types. Without satisfies, you'd either lose literal types (with a type annotation) or lose validation (with no annotation).

ReturnType<typeof fn> extracts the return type from a function — useful when you want to type a variable based on what a function returns without duplicating the type definition.

Declaration files (.d.ts) like app.d.ts let you add custom type information to your project: extending global types, declaring ambient modules, and typing environment variables.`,
	objectives: [
		'Use satisfies to validate values without widening their types',
		'Extract function return types with ReturnType<typeof fn>',
		'Understand what declaration files (app.d.ts) are for',
		'Know when satisfies is better than a type annotation'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // === satisfies ===

  // The problem: type annotation widens literal types
  interface ThemeConfig {
    primary: string;
    secondary: string;
    sizes: Record<string, number>;
  }

  // With type annotation: TypeScript forgets exact values
  const annotated: ThemeConfig = {
    primary: '#4f46e5',
    secondary: '#06b6d4',
    sizes: { sm: 12, md: 16, lg: 20 }
  };
  // annotated.primary is type 'string' — not '#4f46e5'

  // With satisfies: TypeScript validates AND preserves literals
  const validated = {
    primary: '#4f46e5',
    secondary: '#06b6d4',
    sizes: { sm: 12, md: 16, lg: 20 }
  } satisfies ThemeConfig;
  // validated.primary is type '"#4f46e5"' — exact literal!
  // AND TypeScript verified it matches ThemeConfig

  // === ReturnType ===
  function createUser(name: string, role: 'admin' | 'user' = 'user') {
    return {
      id: Math.random().toString(36).slice(2),
      name,
      role,
      createdAt: new Date().toISOString(),
      permissions: role === 'admin'
        ? ['read', 'write', 'delete'] as const
        : ['read'] as const
    };
  }

  // Extract the return type without duplicating it
  type CreatedUser = ReturnType<typeof createUser>;

  let users: CreatedUser[] = $state([]);
  let newUserName: string = $state('');
  let newUserRole: 'admin' | 'user' = $state('user');

  function addUser(): void {
    if (!newUserName.trim()) return;
    const user: CreatedUser = createUser(newUserName.trim(), newUserRole);
    users = [...users, user];
    newUserName = '';
  }

  function removeUser(id: string): void {
    users = users.filter((u: CreatedUser) => u.id !== id);
  }

  // === satisfies for route config ===
  interface RouteConfig {
    path: string;
    label: string;
    icon?: string;
    requiresAuth?: boolean;
  }

  const routes = {
    home:     { path: '/', label: 'Home', icon: 'H' },
    about:    { path: '/about', label: 'About', icon: 'A' },
    settings: { path: '/settings', label: 'Settings', icon: 'S', requiresAuth: true },
    profile:  { path: '/profile', label: 'Profile', icon: 'P', requiresAuth: true }
  } satisfies Record<string, RouteConfig>;

  // routes.home.path is exactly '/' (not just string)
  // AND TypeScript validated every route matches RouteConfig

  let selectedRoute = $state<keyof typeof routes>('home');
  let currentRoute = $derived(routes[selectedRoute]);

  // === app.d.ts explanation ===
  let showDeclarationInfo: boolean = $state(false);
</script>

<h1>satisfies, ReturnType & app.d.ts</h1>

<section>
  <h2>satisfies: Validate Without Widening</h2>
  <div class="comparison">
    <div class="panel">
      <h3>Type Annotation</h3>
      <pre class="code">const config: ThemeConfig = {'{'}
  primary: '#4f46e5',
{'}'};
// config.primary is type 'string'
// Lost the exact value!</pre>
    </div>
    <div class="panel highlight">
      <h3>satisfies</h3>
      <pre class="code">const config = {'{'}
  primary: '#4f46e5',
{'}'} satisfies ThemeConfig;
// config.primary is type '"#4f46e5"'
// Validated AND preserved!</pre>
    </div>
  </div>

  <div class="theme-demo">
    <h3>Live Theme Config (using satisfies)</h3>
    <div class="color-swatch" style="background: {validated.primary}">
      primary: {validated.primary}
    </div>
    <div class="color-swatch" style="background: {validated.secondary}">
      secondary: {validated.secondary}
    </div>
    <p class="sizes">
      Sizes: {Object.entries(validated.sizes).map(([k, v]) => \`\${k}=\${v}px\`).join(', ')}
    </p>
  </div>
</section>

<section>
  <h2>ReturnType&lt;typeof fn&gt;</h2>
  <pre class="code">function createUser(name: string, role: 'admin' | 'user') {'{'}
  return {'{'}id, name, role, createdAt, permissions{'}'};
{'}'}

type CreatedUser = ReturnType&lt;typeof createUser&gt;;
// Automatically matches whatever createUser returns!</pre>

  <div class="add-form">
    <input bind:value={newUserName} placeholder="User name" />
    <select bind:value={newUserRole}>
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
    <button onclick={addUser}>Add</button>
  </div>

  <div class="user-list">
    {#each users as user}
      <div class="user-card">
        <div class="user-info">
          <strong>{user.name}</strong>
          <span class="role-badge {user.role}">{user.role}</span>
        </div>
        <div class="user-details">
          <span>ID: {user.id}</span>
          <span>Permissions: {user.permissions.join(', ')}</span>
        </div>
        <button class="remove-btn" onclick={() => removeUser(user.id)}>x</button>
      </div>
    {:else}
      <p class="empty">Add a user to see ReturnType in action</p>
    {/each}
  </div>
</section>

<section>
  <h2>satisfies for Route Config</h2>
  <div class="nav-demo">
    {#each Object.entries(routes) as [key, route]}
      <button
        class="nav-btn"
        class:active={selectedRoute === key}
        onclick={() => selectedRoute = key as keyof typeof routes}
      >
        <span class="nav-icon">{route.icon}</span>
        {route.label}
        {#if route.requiresAuth}
          <span class="auth-badge">Auth</span>
        {/if}
      </button>
    {/each}
  </div>
  <div class="route-info">
    <p>Path: <code>{currentRoute.path}</code></p>
    <p>Requires auth: <strong>{currentRoute.requiresAuth ? 'Yes' : 'No'}</strong></p>
  </div>
</section>

<section>
  <h2>app.d.ts — Declaration Files</h2>
  <button onclick={() => showDeclarationInfo = !showDeclarationInfo}>
    {showDeclarationInfo ? 'Hide' : 'Show'} Details
  </button>
  {#if showDeclarationInfo}
    <div class="declaration-info">
      <p>In SvelteKit, <code>src/app.d.ts</code> is where you declare global types:</p>
      <pre class="code">// src/app.d.ts
declare global {'{'}
  namespace App {'{'}
    interface Locals {'{'}
      user: {'{'}id: string; role: string{'}'};
    {'}'}
    interface PageData {'{'}
      title: string;
    {'}'}
  {'}'}
{'}'}

export {'{}'};</pre>
      <ul>
        <li><code>App.Locals</code> — types for server-side request data</li>
        <li><code>App.PageData</code> — shared page data types</li>
        <li><code>App.Error</code> — custom error shape</li>
        <li>Declaration files describe types without runtime code</li>
      </ul>
    </div>
  {/if}
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .code {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    overflow-x: auto;
    white-space: pre;
    margin: 0.5rem 0;
  }
  .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 0.75rem 0; }
  .panel { padding: 0.75rem; border: 1px solid #e0e0e0; border-radius: 8px; background: white; }
  .panel.highlight { border-color: #4f46e5; background: #f0f4ff; }
  .panel h3 { margin: 0 0 0.5rem; font-size: 0.95rem; }
  .theme-demo { margin: 1rem 0; }
  .color-swatch {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    color: white;
    font-family: monospace;
    font-size: 0.85rem;
    margin: 0.25rem 0.5rem 0.25rem 0;
  }
  .sizes { font-family: monospace; font-size: 0.85rem; color: #666; }
  .add-form { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
  input { padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; }
  select { padding: 0.4rem; }
  button {
    padding: 0.4rem 0.8rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .user-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .user-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
  }
  .user-info { display: flex; align-items: center; gap: 0.5rem; }
  .user-details { flex: 1; font-size: 0.8rem; color: #666; display: flex; gap: 1rem; }
  .role-badge { font-size: 0.75rem; padding: 0.1rem 0.4rem; border-radius: 3px; }
  .role-badge.admin { background: #fef3c7; color: #92400e; }
  .role-badge.user { background: #e0e7ff; color: #3730a3; }
  .remove-btn { background: #ef4444; padding: 0.2rem 0.5rem; }
  .empty { color: #999; font-style: italic; }
  .nav-demo { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .nav-btn {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    background: white;
    color: #333;
    border: 1px solid #e0e0e0;
  }
  .nav-btn.active { background: #4f46e5; color: white; border-color: #4f46e5; }
  .nav-icon { font-weight: bold; }
  .auth-badge { font-size: 0.65rem; background: rgba(0,0,0,0.15); padding: 0.1rem 0.3rem; border-radius: 2px; }
  .route-info { margin-top: 0.5rem; padding: 0.5rem; background: white; border-radius: 6px; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
  .declaration-info { margin-top: 0.75rem; }
  ul { padding-left: 1.2rem; }
  li { margin: 0.25rem 0; font-size: 0.9rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
