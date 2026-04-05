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

ReturnType<typeof fn> extracts the return type from a function — useful when you want to type a variable based on what a function returns without duplicating the type definition. Paired with typeof, you can also derive types from values and objects.

Declaration files (.d.ts) like app.d.ts let you add custom type information to your project: extending global types (especially SvelteKit's App namespace for App.Locals, App.Error, App.PageData), declaring ambient modules, and typing environment variables. This lesson closes Module 8 by pulling together everything you've learned.`,
	objectives: [
		'Use satisfies to validate values without widening their types',
		'Extract function return types with ReturnType<typeof fn>',
		'Derive types from values using typeof',
		'Understand what app.d.ts is for and how to extend SvelteKit App types'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // 1. THE PROBLEM satisfies SOLVES
  // ============================================================
  // Imagine you have a route config: each route has a path and roles.

  type RouteConfig = Record<string, { path: string; roles: string[] }>;

  // --- Option A: type annotation — LOSES literal types ---
  const routesA: RouteConfig = {
    home: { path: '/', roles: ['user', 'admin'] },
    admin: { path: '/admin', roles: ['admin'] }
  };
  // routesA.home.path is widened to string.
  // routesA.home is typed, but accessing routesA.foobar is also typed
  // (it won't give a "no such key" error at compile time).

  // --- Option B: no annotation — LOSES validation ---
  const routesB = {
    home: { path: '/', roles: ['user', 'admin'] },
    admin: { path: '/admin', roles: ['admin'] }
  };
  // Great literal types, but nothing validates the shape.
  // You could accidentally misspell a field with no error.

  // --- Option C: satisfies — best of both worlds ---
  const routes = {
    home: { path: '/', roles: ['user', 'admin'] },
    admin: { path: '/admin', roles: ['admin'] },
    profile: { path: '/profile', roles: ['user', 'admin'] }
  } satisfies RouteConfig;

  // 1. TS still validates the shape against RouteConfig
  // 2. But routes.home.path is the literal '/' (narrow)
  // 3. routes.xyz would be a compile error (no such key)

  type RouteKey = keyof typeof routes; // 'home' | 'admin' | 'profile'

  // ============================================================
  // 2. ReturnType<typeof fn>
  // ============================================================

  function createUser(name: string, age: number) {
    return {
      id: Math.floor(Math.random() * 1000),
      name,
      age,
      createdAt: new Date()
    };
  }

  type User = ReturnType<typeof createUser>;
  // { id: number; name: string; age: number; createdAt: Date }
  // No need to duplicate the shape!

  function formatUser(user: User): string {
    return \`\${user.name} (#\${user.id}), age \${user.age}\`;
  }

  // ============================================================
  // 3. typeof for deriving types from values
  // ============================================================

  const DEFAULT_SETTINGS = {
    theme: 'light',
    fontSize: 14,
    notifications: true
  } as const;

  type Settings = typeof DEFAULT_SETTINGS;
  // { readonly theme: 'light'; readonly fontSize: 14; readonly notifications: true }

  type ThemeName = typeof DEFAULT_SETTINGS.theme; // 'light'

  // ============================================================
  // 4. satisfies with a MORE COMPLEX example
  // ============================================================

  type IconName = 'home' | 'user' | 'settings' | 'logout';
  type NavItem = { label: string; icon: IconName; badge?: number };

  const nav = {
    home: { label: 'Home', icon: 'home' },
    profile: { label: 'Profile', icon: 'user', badge: 3 },
    settings: { label: 'Settings', icon: 'settings' },
    logout: { label: 'Sign out', icon: 'logout' }
  } satisfies Record<string, NavItem>;

  // nav.profile.badge is the literal 3, not number.
  // If you typo 'home' as 'hime', TS errors.

  type NavKey = keyof typeof nav;
  const navKeys = Object.keys(nav) as NavKey[];

  // ============================================================
  // 5. app.d.ts — the SvelteKit declaration file
  // ============================================================
  //
  // In a SvelteKit project, src/app.d.ts defines the App namespace:
  //
  //   declare global {
  //     namespace App {
  //       interface Locals {
  //         user: { id: number; name: string } | null;
  //       }
  //       interface Error {
  //         code: string;
  //         message: string;
  //       }
  //       interface PageData {}
  //       interface Platform {}
  //     }
  //   }
  //   export {};
  //
  // This lets your hooks.server.ts set event.locals.user, and any
  // +page.server.ts load function gets it typed automatically.

  // ============================================================
  // Interactive demo
  // ============================================================

  let selectedRoute = $state<RouteKey>('home');
  let currentRole = $state('user');

  const hasAccess = $derived(routes[selectedRoute].roles.includes(currentRole));

  let newUser = $state<User | null>(null);
  let userName = $state('Alice');
  let userAge = $state(28);

  function makeUser(): void {
    newUser = createUser(userName, userAge);
  }

  let selectedNav = $state<NavKey>('home');
</script>

<h1>satisfies, ReturnType &amp; app.d.ts</h1>

<section>
  <h2>1. satisfies — validate without widening</h2>
  <pre class="code">{\`const routes = {
  home: { path: '/', roles: ['user', 'admin'] },
  admin: { path: '/admin', roles: ['admin'] }
} satisfies RouteConfig;

// routes.home.path is the literal '/'
// keyof typeof routes → 'home' | 'admin'\`}</pre>

  <div class="controls">
    <label>Route
      <select bind:value={selectedRoute}>
        <option value="home">home</option>
        <option value="admin">admin</option>
        <option value="profile">profile</option>
      </select>
    </label>
    <label>Role
      <select bind:value={currentRole}>
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
    </label>
  </div>

  <div class="route-card">
    <div>Path: <code>{routes[selectedRoute].path}</code></div>
    <div>Allowed: <code>[{routes[selectedRoute].roles.join(', ')}]</code></div>
    <div class="access" class:ok={hasAccess} class:no={!hasAccess}>
      {hasAccess ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
    </div>
  </div>
</section>

<section>
  <h2>2. ReturnType&lt;typeof createUser&gt;</h2>
  <pre class="code">{\`function createUser(name: string, age: number) {
  return { id: ..., name, age, createdAt: new Date() };
}

type User = ReturnType<typeof createUser>;\`}</pre>

  <div class="form">
    <input bind:value={userName} placeholder="name" />
    <input type="number" bind:value={userAge} />
    <button onclick={makeUser}>Create user</button>
  </div>

  {#if newUser}
    <p class="result">{formatUser(newUser)}</p>
    <p class="hint">createdAt: {newUser.createdAt.toLocaleString()}</p>
  {/if}
</section>

<section>
  <h2>3. Nav with satisfies</h2>
  <div class="nav-grid">
    {#each navKeys as key (key)}
      <button
        class="nav-btn"
        class:active={selectedNav === key}
        onclick={() => (selectedNav = key)}
      >
        {nav[key].label}
        {#if 'badge' in nav[key]}
          <span class="badge">{nav[key].badge}</span>
        {/if}
      </button>
    {/each}
  </div>
  <p class="hint">
    Current: <code>{nav[selectedNav].label}</code> (icon: <code>{nav[selectedNav].icon}</code>)
  </p>
</section>

<section class="cheat">
  <h2>app.d.ts in SvelteKit</h2>
  <pre class="code">{\`// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user: { id: number; name: string } | null;
    }
    interface Error {
      code: string;
      message: string;
    }
    interface PageData {}
    interface Platform {}
  }
}
export {};\`}</pre>
  <ul>
    <li><code>App.Locals</code> — set in <code>hooks.server.ts</code>, available in every load function</li>
    <li><code>App.Error</code> — shape returned by your custom error pages</li>
    <li><code>App.PageData</code> — data shared across all pages</li>
    <li><code>App.Platform</code> — platform-specific info (Cloudflare, Vercel, etc.)</li>
  </ul>
</section>

<section class="cheat">
  <h2>When to use which</h2>
  <table>
    <thead><tr><th>Tool</th><th>Use when</th></tr></thead>
    <tbody>
      <tr><td><code>: Type</code></td><td>you want widening and strict typing</td></tr>
      <tr><td><code>satisfies Type</code></td><td>you want validation AND literal types</td></tr>
      <tr><td><code>as const</code></td><td>freeze a value into deep literal types</td></tr>
      <tr><td><code>typeof value</code></td><td>derive a type from a value</td></tr>
      <tr><td><code>ReturnType&lt;typeof fn&gt;</code></td><td>derive a type from a function's return</td></tr>
      <tr><td><code>app.d.ts</code></td><td>extend global SvelteKit types</td></tr>
    </tbody>
  </table>
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
    white-space: pre-wrap;
    margin: 0.5rem 0;
  }
  .controls { display: flex; gap: 0.75rem; flex-wrap: wrap; margin: 0.5rem 0; }
  label { display: flex; gap: 0.3rem; align-items: center; font-size: 0.9rem; }
  select, input {
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  button {
    padding: 0.4rem 0.9rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-right: 0.25rem;
  }
  button:hover { background: #4338ca; }
  .route-card {
    padding: 0.75rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 0.9rem;
    line-height: 1.6;
  }
  .access {
    margin-top: 0.5rem;
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    font-weight: bold;
    display: inline-block;
    font-family: monospace;
    font-size: 0.85rem;
  }
  .access.ok { background: #d1fae5; color: #065f46; }
  .access.no { background: #fee2e2; color: #991b1b; }
  .form { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.5rem 0; }
  .result {
    padding: 0.5rem 0.75rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-weight: bold;
  }
  .hint { font-size: 0.85rem; color: #666; }
  code {
    background: #e8e8e8;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.85rem;
  }
  .nav-grid {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .nav-btn {
    background: white;
    color: #333;
    border: 1px solid #e0e0e0;
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }
  .nav-btn.active { background: #4f46e5; color: white; }
  .badge {
    background: #ef4444;
    color: white;
    border-radius: 999px;
    padding: 0.05rem 0.4rem;
    font-size: 0.7rem;
  }
  .cheat { background: #fffbeb; border: 1px solid #fde68a; }
  .cheat ul { margin: 0; padding-left: 1.2rem; line-height: 1.7; font-size: 0.9rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.4rem 0.6rem; text-align: left; border-bottom: 1px solid #fde68a; }
  th { background: #fef3c7; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
