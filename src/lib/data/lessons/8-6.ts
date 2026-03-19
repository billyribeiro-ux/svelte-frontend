import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '8-6',
		title: 'Utility Types & Aliases',
		phase: 2,
		module: 8,
		lessonIndex: 6
	},
	description: `TypeScript ships with built-in utility types that transform existing types. Partial<T> makes all properties optional. Pick<T, Keys> extracts specific properties. Omit<T, Keys> removes properties. Record<Keys, Value> creates an object type with specific keys.

Type aliases (type Name = ...) give names to complex types, making your code more readable. Combined with keyof (which extracts property names as a union) and indexed access types (T[K]), you can build powerful, reusable type transformations.

These utilities are everywhere in production TypeScript. Instead of defining similar interfaces over and over, you derive new types from existing ones.`,
	objectives: [
		'Use Partial, Pick, Omit, and Record to transform types',
		'Create type aliases for complex or reused types',
		'Access property types with keyof and indexed access T[K]',
		'Build form and settings interfaces using utility types'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Base interface
  interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    createdAt: string;
  }

  // Utility types derived from User
  type UserUpdate = Partial<User>;                  // All fields optional
  type UserPreview = Pick<User, 'id' | 'name' | 'role'>;  // Only these fields
  type UserInput = Omit<User, 'id' | 'createdAt'>;        // Without these fields
  type UserRoles = Record<User['role'], string>;           // Role -> description

  // Type alias for complex types
  type FormField = {
    value: string;
    error: string;
    touched: boolean;
  };

  type UserForm = Record<keyof UserInput, FormField>;

  // keyof demo
  type UserKeys = keyof User; // 'id' | 'name' | 'email' | 'role' | 'createdAt'

  // Demo data
  let fullUser: User = $state({
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
    createdAt: '2024-01-15'
  });

  let preview: UserPreview = $derived({
    id: fullUser.id,
    name: fullUser.name,
    role: fullUser.role
  });

  let roleDescriptions: UserRoles = {
    admin: 'Full access to all features',
    editor: 'Can create and edit content',
    viewer: 'Read-only access'
  };

  // Form using utility types
  let form: UserForm = $state({
    name: { value: '', error: '', touched: false },
    email: { value: '', error: '', touched: false },
    role: { value: 'viewer', error: '', touched: false }
  });

  function validateField(field: keyof UserInput): void {
    const f = form[field];
    f.touched = true;

    switch (field) {
      case 'name':
        f.error = f.value.length < 2 ? 'Name must be at least 2 characters' : '';
        break;
      case 'email':
        f.error = !f.value.includes('@') ? 'Invalid email address' : '';
        break;
      case 'role':
        f.error = '';
        break;
    }
  }

  let isFormValid = $derived(
    Object.values(form).every((f: FormField) => f.touched && !f.error && f.value)
  );

  // Partial update demo
  let partialUpdate: UserUpdate = $state({});
  let updateFields: string[] = $state([]);

  function toggleUpdateField(field: keyof User): void {
    if (updateFields.includes(field)) {
      updateFields = updateFields.filter(f => f !== field);
      const { [field]: _, ...rest } = partialUpdate;
      partialUpdate = rest;
    } else {
      updateFields = [...updateFields, field];
      partialUpdate = { ...partialUpdate, [field]: fullUser[field] };
    }
  }

  const editableFields: (keyof User)[] = ['name', 'email', 'role'];
</script>

<h1>Utility Types & Aliases</h1>

<section>
  <h2>The Base Type</h2>
  <pre class="code">interface User {'{'}
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: string;
{'}'}</pre>

  <div class="user-display">
    <p><strong>{fullUser.name}</strong> ({fullUser.email})</p>
    <p>Role: <span class="badge">{fullUser.role}</span> | ID: {fullUser.id}</p>
  </div>
</section>

<section>
  <h2>Utility Type Showcase</h2>
  <div class="type-grid">
    <div class="type-card">
      <h3>Pick&lt;User, 'id' | 'name' | 'role'&gt;</h3>
      <p class="desc">Only selected fields</p>
      <pre class="mini">{JSON.stringify(preview, null, 2)}</pre>
    </div>
    <div class="type-card">
      <h3>Omit&lt;User, 'id' | 'createdAt'&gt;</h3>
      <p class="desc">Everything except these fields</p>
      <pre class="mini">// For creation forms — no id or timestamp
{'{'}name, email, role{'}'}</pre>
    </div>
    <div class="type-card">
      <h3>Record&lt;Role, string&gt;</h3>
      <p class="desc">Maps each role to a description</p>
      {#each Object.entries(roleDescriptions) as [role, desc]}
        <p class="record-entry"><span class="badge">{role}</span> {desc}</p>
      {/each}
    </div>
    <div class="type-card">
      <h3>Partial&lt;User&gt;</h3>
      <p class="desc">All fields optional — for updates</p>
      <div class="checkboxes">
        {#each editableFields as field}
          <label>
            <input
              type="checkbox"
              checked={updateFields.includes(field)}
              onchange={() => toggleUpdateField(field)}
            />
            {field}
          </label>
        {/each}
      </div>
      <pre class="mini">{JSON.stringify(partialUpdate, null, 2)}</pre>
    </div>
  </div>
</section>

<section>
  <h2>Form with Record&lt;keyof T, FormField&gt;</h2>
  <pre class="code">type FormField = {'{'}value: string; error: string; touched: boolean{'}'};
type UserForm = Record&lt;keyof UserInput, FormField&gt;;</pre>

  <div class="form">
    <div class="field">
      <label>Name</label>
      <input
        bind:value={form.name.value}
        onblur={() => validateField('name')}
        class:invalid={form.name.touched && form.name.error}
      />
      {#if form.name.touched && form.name.error}
        <span class="error">{form.name.error}</span>
      {/if}
    </div>
    <div class="field">
      <label>Email</label>
      <input
        bind:value={form.email.value}
        onblur={() => validateField('email')}
        class:invalid={form.email.touched && form.email.error}
      />
      {#if form.email.touched && form.email.error}
        <span class="error">{form.email.error}</span>
      {/if}
    </div>
    <div class="field">
      <label>Role</label>
      <select bind:value={form.role.value} onchange={() => validateField('role')}>
        <option value="admin">Admin</option>
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
      </select>
    </div>
    <button disabled={!isFormValid}>
      {isFormValid ? 'Submit' : 'Fill all fields'}
    </button>
  </div>
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
  .user-display {
    background: white;
    padding: 0.75rem;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    margin-top: 0.5rem;
  }
  .badge {
    background: #4f46e5;
    color: white;
    padding: 0.15rem 0.5rem;
    border-radius: 3px;
    font-size: 0.8rem;
  }
  .type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 0.75rem 0; }
  .type-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 0.75rem;
  }
  .type-card h3 { margin: 0 0 0.25rem; font-size: 0.9rem; color: #4f46e5; }
  .desc { font-size: 0.8rem; color: #888; margin: 0 0 0.5rem; }
  .mini {
    background: #f5f5f5;
    padding: 0.5rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.75rem;
    white-space: pre;
    margin: 0;
  }
  .record-entry { margin: 0.25rem 0; font-size: 0.85rem; }
  .checkboxes { display: flex; gap: 0.75rem; margin-bottom: 0.5rem; }
  .checkboxes label { display: flex; align-items: center; gap: 0.3rem; font-size: 0.85rem; }
  .form { display: flex; flex-direction: column; gap: 0.75rem; max-width: 350px; }
  .field { display: flex; flex-direction: column; gap: 0.25rem; }
  .field label { font-weight: bold; font-size: 0.85rem; }
  input, select { padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; }
  .invalid { border-color: #ef4444; background: #fef2f2; }
  .error { color: #ef4444; font-size: 0.8rem; }
  button {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    align-self: flex-start;
  }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
