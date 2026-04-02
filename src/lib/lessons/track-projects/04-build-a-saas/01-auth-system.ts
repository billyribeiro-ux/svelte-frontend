import type { Lesson } from '$types/lesson';

export const authSystem: Lesson = {
	id: 'projects.build-a-saas.auth-system',
	slug: 'auth-system',
	title: 'Authentication System',
	description:
		'Build a complete authentication flow with login, registration, session management, and route guards using Svelte 5 runes and reactive stores.',
	trackId: 'projects',
	moduleId: 'build-a-saas',
	order: 1,
	estimatedMinutes: 35,
	concepts: ['svelte5.runes.state', 'svelte5.runes.derived', 'svelte5.components.composition'],
	prerequisites: ['svelte5.runes.state', 'svelte5.runes.derived', 'svelte5.runes.effect'],

	content: [
		{
			type: 'text',
			content: `# Building an Authentication System

Authentication is the gatekeeper of every SaaS application. Before users see dashboards, manage tasks, or configure settings, they must prove their identity. In this lesson you will build a complete client-side authentication flow: a login form, a registration form, a session store that tracks the current user, route guards that protect pages, and a logout mechanism. Everything is powered by Svelte 5 runes.

We focus on the front-end architecture. In production you would connect to a backend authentication service (Supabase, Auth0, Firebase, or your own API). Our simulated backend stores credentials in memory and validates them locally — the patterns for reactive state, form handling, and conditional rendering are identical regardless of where the actual validation happens.

## The Auth Store

The auth store is the central source of truth for authentication state. It tracks the current user, the authentication status, and provides methods for login, register, and logout:

\`\`\`ts
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
}
\`\`\`

We model this with \`$state\`:

\`\`\`ts
function createAuthStore() {
  let user = $state<User | null>(null);
  let isLoading = $state(false);
  let error = $state('');

  // Simulated user database
  let registeredUsers = $state<Array<{ email: string; password: string; user: User }>>([
    {
      email: 'admin@example.com',
      password: 'password123',
      user: { id: '1', email: 'admin@example.com', name: 'Admin User', role: 'admin', createdAt: '2025-01-01' }
    }
  ]);

  return {
    get user() { return user; },
    get isAuthenticated() { return user !== null; },
    get isLoading() { return isLoading; },
    get error() { return error; },

    async login(email: string, password: string) {
      isLoading = true;
      error = '';
      // Simulate network delay
      await new Promise(r => setTimeout(r, 800));
      const found = registeredUsers.find(u => u.email === email && u.password === password);
      if (found) {
        user = found.user;
      } else {
        error = 'Invalid email or password';
      }
      isLoading = false;
    },

    async register(email: string, password: string, name: string) {
      isLoading = true;
      error = '';
      await new Promise(r => setTimeout(r, 800));
      if (registeredUsers.some(u => u.email === email)) {
        error = 'Email already registered';
        isLoading = false;
        return;
      }
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        name,
        role: 'user',
        createdAt: new Date().toISOString().split('T')[0],
      };
      registeredUsers.push({ email, password, user: newUser });
      user = newUser;
      isLoading = false;
    },

    logout() {
      user = null;
      error = '';
    }
  };
}
\`\`\`

The \`async\` methods simulate network latency with \`setTimeout\`. The \`isLoading\` flag drives loading spinners in the UI. The \`error\` string populates inline error messages. Because all three are \`$state\`, the UI reacts to every stage of the authentication flow automatically.

## The Login Form

The login form binds email and password inputs to \`$state\` variables and calls \`authStore.login()\` on submit:

\`\`\`svelte
<script lang="ts">
  import { authStore } from './auth-store';

  let email = $state('');
  let password = $state('');

  let isValid = $derived(email.includes('@') && password.length >= 6);

  async function handleLogin() {
    if (!isValid) return;
    await authStore.login(email, password);
  }
</script>
\`\`\`

Validation is inline with \`$derived\` — the submit button is disabled when the form is invalid. Error messages from the store display below the form. The loading state disables inputs and shows a spinner.

## Route Guards

Protected pages should redirect unauthenticated users to the login screen. We implement this with a \`Guard\` component that wraps protected content:

\`\`\`svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { authStore } from './auth-store';

  let { children, fallback }: {
    children: Snippet;
    fallback?: Snippet;
  } = $props();
</script>

{#if authStore.isAuthenticated}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{:else}
  <p>Please log in to access this page.</p>
{/if}
\`\`\`

The guard reads \`authStore.isAuthenticated\` — a derived getter that returns \`true\` when a user is set. When the user logs in, the guard automatically renders the protected content. When they log out, it switches to the fallback. No imperative navigation, no event listeners — just reactive conditional rendering.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.state'
		},
		{
			type: 'text',
			content: `## Your Task: Build the Auth System

Open the starter code. You will find shells for \`auth-store.ts\`, \`LoginForm.svelte\`, \`RegisterForm.svelte\`, \`AuthGuard.svelte\`, and \`App.svelte\`.

1. Complete \`auth-store.ts\` with \`$state\` for user, isLoading, error, and async login/register/logout methods.
2. Build \`LoginForm.svelte\` with bound inputs, validation, loading state, and error display.
3. Build \`RegisterForm.svelte\` with additional name field and password confirmation.
4. Create \`AuthGuard.svelte\` that conditionally renders children based on auth state.`
		},
		{
			type: 'checkpoint',
			content: 'cp-auth-store'
		},
		{
			type: 'text',
			content: `## Switching Between Login and Register

The app should let users toggle between the login and registration forms. We manage this with a \`$state\` variable in the parent:

\`\`\`svelte
<script lang="ts">
  let mode = $state<'login' | 'register'>('login');
</script>

{#if mode === 'login'}
  <LoginForm />
  <p>Don't have an account? <button onclick={() => mode = 'register'}>Register</button></p>
{:else}
  <RegisterForm />
  <p>Already have an account? <button onclick={() => mode = 'login'}>Log in</button></p>
{/if}
\`\`\`

When switching modes, any error messages from the previous form should clear. Add a call to reset the store error when the mode changes:

\`\`\`ts
$effect(() => {
  mode; // dependency
  authStore.clearError();
});
\`\`\`

## The User Profile Header

Once authenticated, display the user's name and role in a header bar. Add a logout button:

\`\`\`svelte
{#if authStore.isAuthenticated}
  <header>
    <span>Welcome, {authStore.user?.name}</span>
    <span class="role">{authStore.user?.role}</span>
    <button onclick={() => authStore.logout()}>Log out</button>
  </header>
{/if}
\`\`\`

The optional chaining (\`authStore.user?.name\`) guards against null — TypeScript enforces this, and the \`{#if}\` block ensures we only render when a user exists.

## Session Persistence

For a real-world feel, persist the session to localStorage. On page load, check for a stored user and restore the session:

\`\`\`ts
// In the auth store
$effect(() => {
  if (user) {
    localStorage.setItem('auth_user', JSON.stringify($state.snapshot(user)));
  } else {
    localStorage.removeItem('auth_user');
  }
});
\`\`\`

Initialize with the stored value:

\`\`\`ts
function loadSession(): User | null {
  try {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

let user = $state<User | null>(loadSession());
\`\`\`

This gives users a seamless experience — they log in once and remain logged in across page refreshes until they explicitly log out.`
		},
		{
			type: 'checkpoint',
			content: 'cp-auth-forms'
		},
		{
			type: 'checkpoint',
			content: 'cp-auth-guard'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { authStore } from './auth-store';
  import LoginForm from './LoginForm.svelte';
  import RegisterForm from './RegisterForm.svelte';
  import AuthGuard from './AuthGuard.svelte';

  let mode = $state<'login' | 'register'>('login');
</script>

<div class="app">
  <AuthGuard>
    {#snippet children()}
      <header class="user-bar">
        <span>Welcome, {authStore.user?.name} ({authStore.user?.role})</span>
        <button onclick={() => authStore.logout()}>Log out</button>
      </header>
      <main>
        <h1>Dashboard</h1>
        <p>You are logged in! This is the protected content area.</p>
      </main>
    {/snippet}
    {#snippet fallback()}
      <div class="auth-page">
        <h1>SaaS App</h1>
        {#if mode === 'login'}
          <LoginForm />
          <p class="switch">No account? <button onclick={() => mode = 'register'}>Register</button></p>
        {:else}
          <RegisterForm />
          <p class="switch">Have an account? <button onclick={() => mode = 'login'}>Log in</button></p>
        {/if}
      </div>
    {/snippet}
  </AuthGuard>
</div>

<style>
  .app { max-width: 500px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  .auth-page { text-align: center; }
  .user-bar { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
  .user-bar button { padding: 0.4rem 0.8rem; background: #f1f5f9; border: 1px solid #d1d5db; border-radius: 5px; cursor: pointer; }
  .switch { margin-top: 1rem; color: #64748b; font-size: 0.875rem; }
  .switch button { background: none; border: none; color: #6366f1; cursor: pointer; text-decoration: underline; font-size: inherit; }
</style>`
		},
		{
			name: 'auth-store.ts',
			path: '/auth-store.ts',
			language: 'typescript',
			content: `// TODO: Define User interface
// TODO: Create auth store with $state for user, isLoading, error
// TODO: Implement login, register, logout methods
// TODO: Add simulated user database
`
		},
		{
			name: 'LoginForm.svelte',
			path: '/LoginForm.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import authStore
  // TODO: Add $state for email, password
  // TODO: Add $derived isValid
  // TODO: Add async handleLogin function
</script>

<!-- TODO: Build login form with bound inputs, validation, error display -->

<style>
  /* Add form styles */
</style>`
		},
		{
			name: 'RegisterForm.svelte',
			path: '/RegisterForm.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import authStore
  // TODO: Add $state for email, password, confirmPassword, name
  // TODO: Add $derived validation
  // TODO: Add async handleRegister function
</script>

<!-- TODO: Build registration form -->

<style>
  /* Add form styles */
</style>`
		},
		{
			name: 'AuthGuard.svelte',
			path: '/AuthGuard.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';
  // TODO: Import authStore
  // TODO: Accept children and fallback snippets via $props()
</script>

<!-- TODO: Conditionally render children or fallback based on auth state -->
`
		}
	],

	solutionFiles: [
		{
			name: 'auth-store.ts',
			path: '/auth-store.ts',
			language: 'typescript',
			content: `interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

function createAuthStore() {
  let user = $state<User | null>(null);
  let isLoading = $state(false);
  let error = $state('');

  let registeredUsers = $state<Array<{ email: string; password: string; user: User }>>([
    {
      email: 'admin@example.com',
      password: 'password123',
      user: { id: '1', email: 'admin@example.com', name: 'Admin User', role: 'admin', createdAt: '2025-01-01' }
    }
  ]);

  return {
    get user() { return user; },
    get isAuthenticated() { return user !== null; },
    get isLoading() { return isLoading; },
    get error() { return error; },

    clearError() { error = ''; },

    async login(email: string, password: string) {
      isLoading = true;
      error = '';
      await new Promise(r => setTimeout(r, 800));
      const found = registeredUsers.find(u => u.email === email && u.password === password);
      if (found) {
        user = found.user;
      } else {
        error = 'Invalid email or password';
      }
      isLoading = false;
    },

    async register(email: string, password: string, name: string) {
      isLoading = true;
      error = '';
      await new Promise(r => setTimeout(r, 800));
      if (registeredUsers.some(u => u.email === email)) {
        error = 'Email already registered';
        isLoading = false;
        return;
      }
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        name,
        role: 'user',
        createdAt: new Date().toISOString().split('T')[0],
      };
      registeredUsers.push({ email, password, user: newUser });
      user = newUser;
      isLoading = false;
    },

    logout() {
      user = null;
      error = '';
    }
  };
}

export const authStore = createAuthStore();
`
		},
		{
			name: 'LoginForm.svelte',
			path: '/LoginForm.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { authStore } from './auth-store';

  let email = $state('');
  let password = $state('');

  let isValid = $derived(email.includes('@') && password.length >= 6);

  async function handleLogin() {
    if (!isValid) return;
    await authStore.login(email, password);
  }
</script>

<form onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
  <h2>Log In</h2>

  <label>
    Email
    <input type="email" bind:value={email} placeholder="you@example.com" disabled={authStore.isLoading} />
  </label>

  <label>
    Password
    <input type="password" bind:value={password} placeholder="At least 6 characters" disabled={authStore.isLoading} />
  </label>

  {#if authStore.error}
    <p class="error">{authStore.error}</p>
  {/if}

  <button type="submit" disabled={!isValid || authStore.isLoading}>
    {authStore.isLoading ? 'Logging in...' : 'Log In'}
  </button>

  <p class="hint">Demo: admin@example.com / password123</p>
</form>

<style>
  form { display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 8px; text-align: left; }
  h2 { margin: 0 0 0.5rem; text-align: center; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-weight: 600; font-size: 0.85rem; color: #374151; }
  input { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; }
  .error { color: #dc2626; font-size: 0.85rem; margin: 0; text-align: center; }
  button { padding: 0.625rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .hint { font-size: 0.75rem; color: #94a3b8; text-align: center; margin: 0; }
</style>`
		},
		{
			name: 'RegisterForm.svelte',
			path: '/RegisterForm.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { authStore } from './auth-store';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');

  let passwordsMatch = $derived(password === confirmPassword);
  let isValid = $derived(
    name.length >= 2 && email.includes('@') && password.length >= 6 && passwordsMatch
  );

  async function handleRegister() {
    if (!isValid) return;
    await authStore.register(email, password, name);
  }
</script>

<form onsubmit={(e) => { e.preventDefault(); handleRegister(); }}>
  <h2>Create Account</h2>

  <label>
    Name
    <input bind:value={name} placeholder="Your name" disabled={authStore.isLoading} />
  </label>

  <label>
    Email
    <input type="email" bind:value={email} placeholder="you@example.com" disabled={authStore.isLoading} />
  </label>

  <label>
    Password
    <input type="password" bind:value={password} placeholder="At least 6 characters" disabled={authStore.isLoading} />
  </label>

  <label>
    Confirm Password
    <input type="password" bind:value={confirmPassword} placeholder="Repeat password" disabled={authStore.isLoading} />
    {#if confirmPassword && !passwordsMatch}
      <span class="field-error">Passwords do not match</span>
    {/if}
  </label>

  {#if authStore.error}
    <p class="error">{authStore.error}</p>
  {/if}

  <button type="submit" disabled={!isValid || authStore.isLoading}>
    {authStore.isLoading ? 'Creating account...' : 'Register'}
  </button>
</form>

<style>
  form { display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 8px; text-align: left; }
  h2 { margin: 0 0 0.5rem; text-align: center; }
  label { display: flex; flex-direction: column; gap: 0.2rem; font-weight: 600; font-size: 0.85rem; color: #374151; }
  input { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; }
  .field-error { color: #dc2626; font-size: 0.75rem; font-weight: 400; }
  .error { color: #dc2626; font-size: 0.85rem; margin: 0; text-align: center; }
  button { padding: 0.625rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>`
		},
		{
			name: 'AuthGuard.svelte',
			path: '/AuthGuard.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';
  import { authStore } from './auth-store';

  let { children, fallback }: {
    children: Snippet;
    fallback?: Snippet;
  } = $props();
</script>

{#if authStore.isAuthenticated}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{:else}
  <p>Please log in to access this page.</p>
{/if}`
		},
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { authStore } from './auth-store';
  import LoginForm from './LoginForm.svelte';
  import RegisterForm from './RegisterForm.svelte';
  import AuthGuard from './AuthGuard.svelte';

  let mode = $state<'login' | 'register'>('login');

  $effect(() => {
    mode;
    authStore.clearError();
  });
</script>

<div class="app">
  <AuthGuard>
    {#snippet children()}
      <header class="user-bar">
        <span>Welcome, {authStore.user?.name} ({authStore.user?.role})</span>
        <button onclick={() => authStore.logout()}>Log out</button>
      </header>
      <main>
        <h1>Dashboard</h1>
        <p>You are logged in! This is the protected content area.</p>
      </main>
    {/snippet}
    {#snippet fallback()}
      <div class="auth-page">
        <h1>SaaS App</h1>
        {#if mode === 'login'}
          <LoginForm />
          <p class="switch">No account? <button onclick={() => mode = 'register'}>Register</button></p>
        {:else}
          <RegisterForm />
          <p class="switch">Have an account? <button onclick={() => mode = 'login'}>Log in</button></p>
        {/if}
      </div>
    {/snippet}
  </AuthGuard>
</div>

<style>
  .app { max-width: 500px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  .auth-page { text-align: center; }
  .user-bar { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
  .user-bar button { padding: 0.4rem 0.8rem; background: #f1f5f9; border: 1px solid #d1d5db; border-radius: 5px; cursor: pointer; }
  .switch { margin-top: 1rem; color: #64748b; font-size: 0.875rem; }
  .switch button { background: none; border: none; color: #6366f1; cursor: pointer; text-decoration: underline; font-size: inherit; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-auth-store',
			description: 'Create auth store with $state for user, isLoading, error and async login/register/logout',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$state' },
						{ type: 'contains', value: 'async login' },
						{ type: 'contains', value: 'isAuthenticated' }
					]
				}
			},
			hints: [
				'Create `let user = $state<User | null>(null)`, `let isLoading = $state(false)`, `let error = $state(\'\')` inside a factory function.',
				'Implement async login that simulates a delay, checks credentials against a stored array, and sets user or error.',
				'Expose getters: `get isAuthenticated() { return user !== null; }`, `get user() { return user; }`, and methods for login, register, logout.'
			],
			conceptsTested: ['svelte5.runes.state']
		},
		{
			id: 'cp-auth-forms',
			description: 'Build login and registration forms with bound inputs, validation, and error display',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'bind:value' },
						{ type: 'contains', value: 'isValid' },
						{ type: 'contains', value: 'authStore.error' }
					]
				}
			},
			hints: [
				'Use `$state` for form fields and `$derived` for validation: `let isValid = $derived(email.includes(\'@\') && password.length >= 6)`.',
				'Display `authStore.error` with `{#if authStore.error}<p class="error">{authStore.error}</p>{/if}` and disable inputs during `authStore.isLoading`.',
				'The registration form needs an extra password confirmation field with `let passwordsMatch = $derived(password === confirmPassword)` validation.'
			],
			conceptsTested: ['svelte5.runes.derived', 'svelte5.bindings.input']
		},
		{
			id: 'cp-auth-guard',
			description: 'Create AuthGuard component that conditionally renders based on auth state',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'authStore.isAuthenticated' },
						{ type: 'contains', value: '@render children()' },
						{ type: 'contains', value: 'Snippet' }
					]
				}
			},
			hints: [
				'Accept `children` and optional `fallback` snippets via `$props()` typed as `Snippet`.',
				'Conditionally render: `{#if authStore.isAuthenticated}{@render children()}{:else if fallback}{@render fallback()}{/if}`.',
				'Import `authStore` and `Snippet` type, then: `let { children, fallback }: { children: Snippet; fallback?: Snippet } = $props();`'
			],
			conceptsTested: ['svelte5.components.composition']
		}
	]
};
