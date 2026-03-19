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

By adding generics="T extends SomeConstraint" to your script tag, you create a type parameter that flows through props, slots, and event handlers. A generic List component can accept items of any type and pass the correctly-typed item back to render snippets — all with full IDE autocompletion and compile-time type checking.`,
	objectives: [
		'Define generic type parameters on components using the generics attribute',
		'Constrain generic types with extends for type safety',
		'Pass generic types through props and snippets with full inference',
		'Build reusable type-safe collection components'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // This demonstrates generic component patterns
  // In a real project, GenericList would be a separate .svelte file:
  //
  // <!-- GenericList.svelte -->
  // <script lang="ts" generics="T extends { id: string }">
  //   import type { Snippet } from 'svelte';
  //   let { items, renderItem, emptyMessage = 'No items' }: {
  //     items: T[];
  //     renderItem: Snippet<[T, number]>;
  //     emptyMessage?: string;
  //   } = $props();
  // </script>
  //
  // {#if items.length === 0}
  //   <p>{emptyMessage}</p>
  // {:else}
  //   {#each items as item, i (item.id)}
  //     {@render renderItem(item, i)}
  //   {/each}
  // {/if}

  interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
  }

  interface Product {
    id: string;
    name: string;
    price: number;
    inStock: boolean;
  }

  let users: User[] = $state([
    { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
    { id: 'u2', name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
    { id: 'u3', name: 'Carol White', email: 'carol@example.com', role: 'user' },
  ]);

  let products: Product[] = $state([
    { id: 'p1', name: 'Svelte Hoodie', price: 49.99, inStock: true },
    { id: 'p2', name: 'TypeScript Mug', price: 14.99, inStock: true },
    { id: 'p3', name: 'Runes Sticker Pack', price: 7.99, inStock: false },
  ]);

  let searchTerm: string = $state('');

  // Generic filter function — works with any type
  function filterItems<T extends { id: string }>(
    items: T[],
    predicate: (item: T) => boolean
  ): T[] {
    return items.filter(predicate);
  }

  let filteredUsers = $derived(
    filterItems(users, (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  let filteredProducts = $derived(
    filterItems(products, (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  function removeItem<T extends { id: string }>(list: T[], id: string): T[] {
    return list.filter((item) => item.id !== id);
  }
</script>

<h1>Generic Components</h1>

<input
  class="search"
  bind:value={searchTerm}
  placeholder="Search users and products..."
/>

<section>
  <h2>User List (Generic List&lt;User&gt;)</h2>
  <div class="code-hint">
    <code>&lt;script generics="T extends &#123; id: string &#125;"&gt;</code>
  </div>

  {#if filteredUsers.length === 0}
    <p class="empty">No users match your search.</p>
  {:else}
    <div class="list">
      {#each filteredUsers as user (user.id)}
        <div class="card user-card">
          <div class="avatar">{user.name[0]}</div>
          <div class="info">
            <strong>{user.name}</strong>
            <span class="email">{user.email}</span>
          </div>
          <span class="badge" class:admin={user.role === 'admin'}>{user.role}</span>
          <button onclick={() => users = removeItem(users, user.id)}>Remove</button>
        </div>
      {/each}
    </div>
  {/if}
</section>

<section>
  <h2>Product List (Generic List&lt;Product&gt;)</h2>
  {#if filteredProducts.length === 0}
    <p class="empty">No products match your search.</p>
  {:else}
    <div class="list">
      {#each filteredProducts as product (product.id)}
        <div class="card product-card">
          <div class="product-info">
            <strong>{product.name}</strong>
            <span class="price">\${product.price.toFixed(2)}</span>
          </div>
          <span class="stock" class:out={!product.inStock}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
          <button onclick={() => products = removeItem(products, product.id)}>Remove</button>
        </div>
      {/each}
    </div>
  {/if}
</section>

<section class="syntax">
  <h2>Generic Component Syntax</h2>
  <pre><code>&lt;script lang="ts" generics="T extends &#123; id: string &#125;"&gt;
  import type &#123; Snippet &#125; from 'svelte';

  let &#123; items, renderItem, onSelect &#125;: &#123;
    items: T[];
    renderItem: Snippet&lt;[T]&gt;;
    onSelect?: (item: T) =&gt; void;
  &#125; = $props();
&lt;/script&gt;

&#123;#each items as item (item.id)&#125;
  &lt;div onclick=&#123;() =&gt; onSelect?.(item)&#125;&gt;
    &#123;@render renderItem(item)&#125;
  &lt;/div&gt;
&#123;/each&#125;</code></pre>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #6c5ce7; font-size: 1.1rem; }
  .search {
    width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 6px;
    margin-bottom: 1.5rem; font-size: 1rem; box-sizing: border-box;
  }
  .code-hint {
    margin-bottom: 0.75rem; padding: 0.3rem 0.6rem; background: #2d3436;
    border-radius: 4px; display: inline-block;
  }
  .code-hint code { color: #74b9ff; font-size: 0.8rem; }
  .list { display: flex; flex-direction: column; gap: 0.5rem; }
  .card {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem; background: white; border-radius: 6px;
    border: 1px solid #dfe6e9;
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
  .product-info { flex: 1; }
  .price { display: block; color: #00b894; font-weight: 600; }
  .stock { font-size: 0.8rem; font-weight: 600; color: #00b894; }
  .stock.out { color: #d63031; }
  button {
    padding: 0.3rem 0.6rem; border: none; border-radius: 4px;
    background: #ff7675; color: white; cursor: pointer; font-size: 0.8rem;
  }
  .empty { color: #b2bec3; text-align: center; }
  .syntax { background: #2d3436; color: #dfe6e9; }
  .syntax h2 { color: #74b9ff; }
  pre { margin: 0; overflow-x: auto; }
  code { font-size: 0.8rem; line-height: 1.5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
