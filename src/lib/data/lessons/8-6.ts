import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '8-6',
		title: 'Utility Types & Aliases',
		phase: 2,
		module: 8,
		lessonIndex: 6
	},
	description: `TypeScript ships with built-in utility types that transform existing types. Partial<T> makes all properties optional. Required<T> makes all properties required. Pick<T, Keys> extracts specific properties. Omit<T, Keys> removes properties. Record<Keys, Value> creates an object type with specific keys. Readonly<T> makes all properties readonly.

Type aliases (type Name = ...) give names to complex types, making your code more readable. Combined with keyof (which extracts property names as a union) and indexed access types (T[K]), you can build powerful, reusable type transformations without duplicating interface definitions.

These utilities are everywhere in production TypeScript. Instead of defining similar interfaces over and over for "full user", "user update form", "user preview" — you derive them all from a single User type.`,
	objectives: [
		'Use Partial, Required, Pick, Omit to transform types',
		'Use Record to build map-shaped types',
		'Create type aliases for complex or reused types',
		'Access property types with keyof and indexed access T[K]'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // 1. THE SOURCE TYPE — everything derives from this
  // ============================================================

  interface UserProfile {
    id: number;
    name: string;
    email: string;
    age: number;
    bio: string;
    avatar: string;
    role: 'user' | 'admin';
  }

  // ============================================================
  // 2. Partial<T> — all fields become optional
  // ============================================================
  // Perfect for update forms where you only change some fields.

  type UserUpdate = Partial<UserProfile>;
  // { id?: number; name?: string; email?: string; ... }

  function updateUser(current: UserProfile, patch: UserUpdate): UserProfile {
    return { ...current, ...patch };
  }

  // ============================================================
  // 3. Required<T> — all fields become required (opposite of Partial)
  // ============================================================

  interface Config {
    host?: string;
    port?: number;
    debug?: boolean;
  }

  type CompleteConfig = Required<Config>;
  // { host: string; port: number; debug: boolean }

  // ============================================================
  // 4. Pick<T, Keys> — extract just these properties
  // ============================================================
  // Perfect for preview/summary views.

  type UserPreview = Pick<UserProfile, 'id' | 'name' | 'avatar'>;
  // { id: number; name: string; avatar: string }

  // ============================================================
  // 5. Omit<T, Keys> — exclude these properties
  // ============================================================
  // Perfect for creating a new user (no id yet).

  type NewUser = Omit<UserProfile, 'id'>;
  // All fields except id.

  // ============================================================
  // 6. Readonly<T> — lock all properties
  // ============================================================

  type FrozenUser = Readonly<UserProfile>;

  // ============================================================
  // 7. Record<Keys, Value> — map-shaped type
  // ============================================================

  type Permissions = Record<'read' | 'write' | 'delete', boolean>;
  // { read: boolean; write: boolean; delete: boolean }

  const adminPerms: Permissions = {
    read: true,
    write: true,
    delete: true
  };

  const guestPerms: Permissions = {
    read: true,
    write: false,
    delete: false
  };

  // Record with user-keyed data
  type UsersById = Record<number, UserProfile>;

  // ============================================================
  // 8. keyof and indexed access
  // ============================================================

  type UserKey = keyof UserProfile;
  // 'id' | 'name' | 'email' | 'age' | 'bio' | 'avatar' | 'role'

  type UserRole = UserProfile['role'];
  // 'user' | 'admin' — without re-declaring the union

  // A type-safe getter for any property of any object
  function getField<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
  }

  // ============================================================
  // Interactive demo
  // ============================================================

  let user = $state<UserProfile>({
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    age: 28,
    bio: 'Loves hiking and Svelte.',
    avatar: 'A',
    role: 'user'
  });

  // An update form uses Partial<UserProfile>
  let formPatch = $state<UserUpdate>({});
  let updateMessage = $state('');

  function applyUpdate(): void {
    user = updateUser(user, formPatch);
    updateMessage = 'Updated: ' + Object.keys(formPatch).join(', ');
    formPatch = {};
  }

  // Preview view uses Pick
  let preview = $derived<UserPreview>({
    id: user.id,
    name: user.name,
    avatar: user.avatar
  });

  // Permission toggle
  let currentPerms = $state<Permissions>({ ...guestPerms });

  function togglePerm(key: keyof Permissions): void {
    currentPerms = { ...currentPerms, [key]: !currentPerms[key] };
  }

  function makeAdmin(): void {
    currentPerms = { ...adminPerms };
  }
  function makeGuest(): void {
    currentPerms = { ...guestPerms };
  }

  // getField demo
  let selectedKey = $state<UserKey>('name');
  const userKeys: UserKey[] = ['id', 'name', 'email', 'age', 'bio', 'avatar', 'role'];
  let fieldValue = $derived(getField(user, selectedKey));
</script>

<h1>Utility Types &amp; Aliases</h1>

<section>
  <h2>Source of Truth: UserProfile</h2>
  <pre class="code">{\`interface UserProfile {
  id: number;
  name: string;
  email: string;
  age: number;
  bio: string;
  avatar: string;
  role: 'user' | 'admin';
}\`}</pre>

  <div class="user-display">
    <div class="avatar">{user.avatar}</div>
    <div>
      <strong>{user.name}</strong> ({user.role})
      <div>{user.email} · age {user.age}</div>
      <div class="bio">{user.bio}</div>
    </div>
  </div>
</section>

<section>
  <h2>1. Partial&lt;UserProfile&gt; for an update form</h2>
  <p class="intro">Every field is optional — send only what changed.</p>
  <div class="form">
    <input
      placeholder="new name"
      value={formPatch.name ?? ''}
      oninput={(e) => (formPatch.name = e.currentTarget.value || undefined)}
    />
    <input
      placeholder="new email"
      value={formPatch.email ?? ''}
      oninput={(e) => (formPatch.email = e.currentTarget.value || undefined)}
    />
    <input
      placeholder="new bio"
      value={formPatch.bio ?? ''}
      oninput={(e) => (formPatch.bio = e.currentTarget.value || undefined)}
    />
    <button onclick={applyUpdate}>Apply</button>
  </div>
  {#if updateMessage}
    <p class="info">{updateMessage}</p>
  {/if}
</section>

<section>
  <h2>2. Pick&lt;UserProfile, 'id' | 'name' | 'avatar'&gt; preview</h2>
  <pre class="code">{\`type UserPreview = Pick<UserProfile, 'id' | 'name' | 'avatar'>;\`}</pre>
  <div class="preview">
    <div class="avatar small">{preview.avatar}</div>
    <div>#{preview.id} — {preview.name}</div>
  </div>
</section>

<section>
  <h2>3. Record&lt;'read' | 'write' | 'delete', boolean&gt;</h2>
  <div class="perms">
    {#each ['read', 'write', 'delete'] as const as key (key)}
      <label>
        <input
          type="checkbox"
          checked={currentPerms[key]}
          onchange={() => togglePerm(key)}
        />
        {key}
      </label>
    {/each}
  </div>
  <div class="form">
    <button onclick={makeAdmin}>Admin preset</button>
    <button onclick={makeGuest}>Guest preset</button>
  </div>
</section>

<section>
  <h2>4. keyof &amp; indexed access</h2>
  <pre class="code">{\`type UserKey = keyof UserProfile;
type UserRole = UserProfile['role']; // 'user' | 'admin'

function getField<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}\`}</pre>
  <label>
    Read field:
    <select bind:value={selectedKey}>
      {#each userKeys as k (k)}
        <option value={k}>{k}</option>
      {/each}
    </select>
  </label>
  <p>value: <code>{String(fieldValue)}</code></p>
  <p class="hint">
    <code>getField</code> is fully type-safe: selecting <code>age</code> returns a number,
    selecting <code>role</code> returns the literal union.
  </p>
</section>

<section class="cheat">
  <h2>Utility Types Cheat Sheet</h2>
  <table>
    <thead><tr><th>Utility</th><th>What it does</th></tr></thead>
    <tbody>
      <tr><td><code>Partial&lt;T&gt;</code></td><td>all fields optional</td></tr>
      <tr><td><code>Required&lt;T&gt;</code></td><td>all fields required</td></tr>
      <tr><td><code>Readonly&lt;T&gt;</code></td><td>all fields readonly</td></tr>
      <tr><td><code>Pick&lt;T, K&gt;</code></td><td>keep only keys K</td></tr>
      <tr><td><code>Omit&lt;T, K&gt;</code></td><td>remove keys K</td></tr>
      <tr><td><code>Record&lt;K, V&gt;</code></td><td>object with keys K and values V</td></tr>
      <tr><td><code>keyof T</code></td><td>union of T's property names</td></tr>
      <tr><td><code>T[K]</code></td><td>type of T's K property</td></tr>
    </tbody>
  </table>
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .intro { font-size: 0.9rem; color: #555; }
  .code {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    white-space: pre-wrap;
    margin: 0.5rem 0;
  }
  .user-display {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    padding: 0.75rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #4f46e5;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  .avatar.small { width: 32px; height: 32px; font-size: 0.9rem; }
  .bio { font-size: 0.85rem; color: #666; margin-top: 0.2rem; }
  .form { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.5rem 0; }
  input, select {
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
  }
  button:hover { background: #4338ca; }
  .info { padding: 0.4rem 0.6rem; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; font-size: 0.85rem; }
  .preview {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.5rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 0.9rem;
  }
  .perms { display: flex; gap: 1rem; margin-bottom: 0.5rem; }
  .perms label { display: flex; gap: 0.3rem; align-items: center; font-size: 0.9rem; }
  code {
    background: #e8e8e8;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.85rem;
  }
  .hint { font-size: 0.85rem; color: #666; }
  .cheat { background: #fffbeb; border: 1px solid #fde68a; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.4rem 0.6rem; text-align: left; border-bottom: 1px solid #fde68a; }
  th { background: #fef3c7; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
