import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '8-2',
		title: 'Interfaces for Props',
		phase: 2,
		module: 8,
		lessonIndex: 2
	},
	description: `Interfaces define the shape of objects. When you write interface User { name: string; age: number }, you're creating a contract: any object claiming to be a User must have those exact properties with those exact types.

In Svelte, interfaces shine for typing component props. You define what your component expects, and TypeScript ensures every parent component provides the right data. Optional properties use the ? suffix.

Interfaces can extend other interfaces, building up complex types from simple building blocks. This keeps your code DRY and your types composable.`,
	objectives: [
		'Define interfaces with required and optional properties',
		'Use interfaces to type $props() in Svelte components',
		'Extend interfaces to build complex types from simpler ones'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Define interfaces for our data
  interface User {
    name: string;
    email: string;
    age: number;
    avatar?: string; // optional — may or may not exist
  }

  interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
  }

  // Extending interfaces
  interface UserWithAddress extends User {
    address: Address;
  }

  import ProfileCard from './ProfileCard.svelte';

  // Using interfaces with $state
  let users: User[] = $state([
    { name: 'Alice', email: 'alice@example.com', age: 28 },
    { name: 'Bob', email: 'bob@example.com', age: 34, avatar: 'B' },
    { name: 'Carol', email: 'carol@example.com', age: 22 }
  ]);

  let fullUser: UserWithAddress = $state({
    name: 'Dave',
    email: 'dave@example.com',
    age: 30,
    address: {
      street: '123 Main St',
      city: 'Portland',
      state: 'OR',
      zip: '97201'
    }
  });

  // New user form
  let newName: string = $state('');
  let newEmail: string = $state('');
  let newAge: number = $state(25);

  function addUser(): void {
    if (!newName.trim() || !newEmail.trim()) return;

    const user: User = {
      name: newName.trim(),
      email: newEmail.trim(),
      age: newAge
    };

    users = [...users, user];
    newName = '';
    newEmail = '';
    newAge = 25;
  }

  function removeUser(index: number): void {
    users = users.filter((_: User, i: number) => i !== index);
  }

  // Helper function with typed params
  function formatUser(user: User): string {
    const avatarPart = user.avatar ? \` (\${user.avatar})\` : '';
    return \`\${user.name}\${avatarPart}, age \${user.age}\`;
  }

  function formatAddress(addr: Address): string {
    return \`\${addr.street}, \${addr.city}, \${addr.state} \${addr.zip}\`;
  }
</script>

<h1>Interfaces for Props</h1>

<section>
  <h2>User Interface</h2>
  <pre class="code">
interface User {'{'}
  name: string;      // required
  email: string;     // required
  age: number;       // required
  avatar?: string;   // optional (?)
{'}'}</pre>

  <div class="user-list">
    {#each users as user, i}
      <div class="user-card">
        <div class="user-avatar">{user.avatar || user.name[0]}</div>
        <div class="user-info">
          <strong>{user.name}</strong>
          <span>{user.email}</span>
          <span class="age">Age: {user.age}</span>
        </div>
        <button class="remove" onclick={() => removeUser(i)}>x</button>
      </div>
    {/each}
  </div>

  <div class="add-form">
    <input bind:value={newName} placeholder="Name" />
    <input bind:value={newEmail} placeholder="Email" />
    <input type="number" bind:value={newAge} min="0" max="150" />
    <button onclick={addUser}>Add User</button>
  </div>
</section>

<section>
  <h2>Extended Interface: UserWithAddress</h2>
  <pre class="code">
interface UserWithAddress extends User {'{'}
  address: Address;
{'}'}</pre>

  <div class="extended-card">
    <p><strong>{fullUser.name}</strong> ({fullUser.email})</p>
    <p class="address">{formatAddress(fullUser.address)}</p>
  </div>
</section>

<section>
  <h2>Interfaces for $props()</h2>
  <p>The real power: type your component props so parents get autocomplete and error-checking.</p>
  <pre class="code">
// In ProfileCard.svelte:
interface Props {'{'}
  user: User;
  showEmail?: boolean;  // optional
{'}'}
let {'{'} user, showEmail = true {'}'} = $props&lt;Props&gt;();</pre>

  {#each users as user}
    <ProfileCard {user} />
  {/each}
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
    margin: 0 0 1rem;
  }
  .user-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
  .user-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #4f46e5;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    flex-shrink: 0;
  }
  .user-info { flex: 1; display: flex; flex-direction: column; }
  .user-info span { font-size: 0.85rem; color: #666; }
  .age { color: #888 !important; }
  .remove {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    padding: 0;
  }
  .add-form { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .add-form input { padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; }
  .add-form input[type="number"] { width: 60px; }
  button {
    padding: 0.4rem 0.8rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .extended-card {
    background: white;
    padding: 0.75rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }
  .address { color: #666; font-size: 0.9rem; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'ProfileCard.svelte',
			content: `<script lang="ts">
  // Define the shape this component expects
  interface User {
    name: string;
    email: string;
    age: number;
    avatar?: string;
  }

  interface Props {
    user: User;
    showEmail?: boolean;
  }

  // Type $props() with your interface
  let { user, showEmail = true }: Props = $props();
</script>

<div class="profile">
  <div class="avatar">{user.avatar || user.name[0]}</div>
  <div>
    <strong>{user.name}</strong>
    {#if showEmail}
      <span class="email">{user.email}</span>
    {/if}
    <span class="age">Age: {user.age}</span>
  </div>
</div>

<style>
  .profile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #4f46e5;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    flex-shrink: 0;
  }
  .email { display: block; font-size: 0.85rem; color: #666; }
  .age { display: block; font-size: 0.8rem; color: #888; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
