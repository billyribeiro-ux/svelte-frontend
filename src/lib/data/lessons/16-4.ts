import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '16-4',
		title: 'Generic Components',
		phase: 5,
		module: 16,
		lessonIndex: 4
	},
	description: `Svelte 5 supports generic components through the generics attribute on the script tag. This lets you write type-safe, reusable components that work with any data type while preserving full TypeScript inference.

By adding generics="T extends SomeConstraint" to your script tag, you create a type parameter that flows through props, snippets, and event callbacks. A generic List component can accept items of any type and pass the correctly-typed item back to render snippets — all with full IDE autocompletion and compile-time type checking.

The canonical pattern is: constrain T to whatever your component needs (e.g. objects with an \`id\` for keying), type your \`items: T[]\` prop, and type your render snippets as \`Snippet<[T]>\` or \`Snippet<[T, number]>\`. Multiple type parameters are allowed — e.g. a generic <Table<T, K extends keyof T>> with typed column keys.`,
	objectives: [
		'Define generic type parameters on components using the generics attribute',
		'Constrain generic types with extends for type safety and key requirements',
		'Pass generic types through props and snippets with full inference',
		'Build a reusable generic List<T> with typed render snippets',
		'Build a generic Table<T> that uses keyof T for column definitions'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import GenericList from './GenericList.svelte';
  import GenericTable from './GenericTable.svelte';

  interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    joined: string;
  }

  interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
  }

  let users: User[] = $state([
    { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', joined: '2023-01-15' },
    { id: 'u2', name: 'Bob Smith', email: 'bob@example.com', role: 'user', joined: '2023-06-02' },
    { id: 'u3', name: 'Carol White', email: 'carol@example.com', role: 'user', joined: '2024-02-11' }
  ]);

  let products: Product[] = $state([
    { id: 'p1', name: 'Svelte Hoodie', price: 49.99, stock: 12, category: 'Apparel' },
    { id: 'p2', name: 'TypeScript Mug', price: 14.99, stock: 48, category: 'Kitchen' },
    { id: 'p3', name: 'Runes Sticker Pack', price: 7.99, stock: 0, category: 'Stationery' },
    { id: 'p4', name: 'Reactive Notebook', price: 19.99, stock: 7, category: 'Stationery' }
  ]);

  let searchTerm: string = $state('');

  // Generic filter helper — works for any T
  function filterBy<T>(items: T[], predicate: (item: T) => boolean): T[] {
    return items.filter(predicate);
  }

  let filteredUsers = $derived(
    filterBy(users, (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  let filteredProducts = $derived(
    filterBy(products, (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  function removeUser(id: string): void {
    users = users.filter((u) => u.id !== id);
  }

  function removeProduct(id: string): void {
    products = products.filter((p) => p.id !== id);
  }
</script>

<h1>Generic Components</h1>

<input
  class="search"
  bind:value={searchTerm}
  placeholder="Search users and products..."
/>

<section>
  <h2>GenericList&lt;User&gt; with typed Snippet&lt;[User, number]&gt;</h2>
  <GenericList items={filteredUsers} emptyMessage="No users match your search.">
    {#snippet row(user, index)}
      <div class="user-card">
        <div class="avatar">{user.name[0]}</div>
        <div class="info">
          <strong>#{index + 1} — {user.name}</strong>
          <span class="email">{user.email} · joined {user.joined}</span>
        </div>
        <span class="badge" class:admin={user.role === 'admin'}>{user.role}</span>
        <button onclick={() => removeUser(user.id)}>Remove</button>
      </div>
    {/snippet}
  </GenericList>
</section>

<section>
  <h2>GenericList&lt;Product&gt; — same component, different T</h2>
  <GenericList items={filteredProducts} emptyMessage="No products match your search.">
    {#snippet row(product)}
      <div class="product-card">
        <div class="product-info">
          <strong>{product.name}</strong>
          <span class="category">{product.category}</span>
        </div>
        <span class="price">\${product.price.toFixed(2)}</span>
        <span class="stock" class:out={product.stock === 0}>
          {product.stock === 0 ? 'Sold out' : \`\${product.stock} left\`}
        </span>
        <button onclick={() => removeProduct(product.id)}>Remove</button>
      </div>
    {/snippet}
  </GenericList>
</section>

<section>
  <h2>GenericTable&lt;Product, keyof Product&gt;</h2>
  <p class="note">
    Column keys are typed with <code>keyof T</code> — unknown keys fail at compile time.
  </p>
  <GenericTable
    items={filteredProducts}
    columns={[
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'price', label: 'Price', format: (v) => \`\$\${Number(v).toFixed(2)}\` },
      { key: 'stock', label: 'Stock' }
    ]}
  />
</section>

<section>
  <h2>GenericTable&lt;User&gt; — same table, different T</h2>
  <GenericTable
    items={filteredUsers}
    columns={[
      { key: 'name', label: 'Full Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', format: (v) => String(v).toUpperCase() },
      { key: 'joined', label: 'Joined' }
    ]}
  />
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #6c5ce7; font-size: 1.05rem; }
  .search {
    width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 6px;
    margin-bottom: 1rem; font-size: 1rem; box-sizing: border-box;
  }
  .note {
    font-size: 0.85rem; color: #636e72; margin: 0 0 0.5rem 0;
  }
  .note code {
    background: #dfe6e9; padding: 0.1rem 0.3rem; border-radius: 3px;
    font-size: 0.8rem;
  }
  .user-card, .product-card {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem; background: white; border-radius: 6px;
    border: 1px solid #dfe6e9; margin-bottom: 0.4rem;
  }
  .avatar {
    width: 36px; height: 36px; border-radius: 50%; background: #6c5ce7;
    color: white; display: flex; align-items: center; justify-content: center;
    font-weight: bold;
  }
  .info { flex: 1; display: flex; flex-direction: column; }
  .email { font-size: 0.8rem; color: #636e72; }
  .badge {
    padding: 0.2rem 0.5rem; background: #dfe6e9; border-radius: 10px;
    font-size: 0.75rem; font-weight: 600;
  }
  .badge.admin { background: #6c5ce7; color: white; }
  .product-info { flex: 1; display: flex; flex-direction: column; }
  .category { font-size: 0.75rem; color: #b2bec3; }
  .price { color: #00b894; font-weight: 600; }
  .stock { font-size: 0.8rem; font-weight: 600; color: #00b894; }
  .stock.out { color: #d63031; }
  button {
    padding: 0.3rem 0.6rem; border: none; border-radius: 4px;
    background: #ff7675; color: white; cursor: pointer; font-size: 0.8rem;
    font-weight: 600;
  }
  button:hover { opacity: 0.9; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'GenericList.svelte',
			content: `<script lang="ts" generics="T extends { id: string }">
  import type { Snippet } from 'svelte';

  // T is inferred from the 'items' prop at each call site.
  // The 'row' snippet receives a strongly-typed T.
  let {
    items,
    row,
    emptyMessage = 'No items.'
  }: {
    items: T[];
    row: Snippet<[T, number]>;
    emptyMessage?: string;
  } = $props();
</script>

{#if items.length === 0}
  <p class="empty">{emptyMessage}</p>
{:else}
  <div class="list">
    {#each items as item, i (item.id)}
      {@render row(item, i)}
    {/each}
  </div>
{/if}

<style>
  .list { display: flex; flex-direction: column; gap: 0.25rem; }
  .empty {
    color: #b2bec3; text-align: center; padding: 1rem;
    font-style: italic;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'GenericTable.svelte',
			content: `<script lang="ts" generics="T extends { id: string }">
  // Column definition uses keyof T — column keys are type-checked.
  // 'format' receives the value at that column's type.
  type Column<T> = {
    key: keyof T;
    label: string;
    format?: (value: T[keyof T]) => string;
  };

  let {
    items,
    columns
  }: {
    items: T[];
    columns: Column<T>[];
  } = $props();

  function display(item: T, col: Column<T>): string {
    const v = item[col.key];
    return col.format ? col.format(v) : String(v);
  }
</script>

{#if items.length === 0}
  <p class="empty">No rows.</p>
{:else}
  <table>
    <thead>
      <tr>
        {#each columns as col (String(col.key))}
          <th>{col.label}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each items as item (item.id)}
        <tr>
          {#each columns as col (String(col.key))}
            <td>{display(item, col)}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  table {
    width: 100%; border-collapse: collapse; background: white;
    border-radius: 6px; overflow: hidden;
  }
  th, td {
    padding: 0.5rem 0.75rem; text-align: left;
    border-bottom: 1px solid #eee; font-size: 0.9rem;
  }
  th {
    background: #6c5ce7; color: white; font-weight: 600;
    text-transform: uppercase; font-size: 0.75rem;
    letter-spacing: 0.05em;
  }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: #f8f9fa; }
  .empty {
    color: #b2bec3; text-align: center; padding: 1rem;
    font-style: italic;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
