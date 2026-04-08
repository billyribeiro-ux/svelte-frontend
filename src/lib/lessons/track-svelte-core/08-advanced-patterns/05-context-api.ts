import type { Lesson } from '$types/lesson';

export const contextApi: Lesson = {
	id: 'svelte-core.advanced.context-api',
	slug: 'context-api',
	title: 'The Context API — Sharing State Without Prop Drilling',
	description:
		'Master setContext and getContext to share reactive state across deeply nested components, and learn when to use context versus module-level stores.',
	trackId: 'svelte-core',
	moduleId: 'advanced-patterns',
	order: 5,
	estimatedMinutes: 25,
	concepts: ['svelte5.context.set', 'svelte5.context.get', 'svelte5.context.has'],
	prerequisites: ['svelte5.runes.state', 'svelte5.components.props'],

	content: [
		{
			type: 'text',
			content: `# The Context API

As your application grows, you will encounter a common problem: a deeply nested component needs data that lives several levels up the component tree. Passing that data through every intermediate component as props — even components that do not use it — is called **prop drilling**, and it is one of the most widely agreed-upon anti-patterns in component-based UI development.

The Svelte Context API solves prop drilling by letting a parent component **provide** data to all of its descendants, regardless of how deep they are in the tree, without those descendants needing to be explicitly wired up with props.

## The Two Functions

Context requires just two imports from Svelte:

\`\`\`svelte
<script>
  import { setContext, getContext } from 'svelte';
</script>
\`\`\`

**\`setContext(key, value)\`** — called in a parent component, makes \`value\` available to all descendants. The \`key\` can be any JavaScript value, but a \`Symbol\` is recommended to avoid naming collisions.

**\`getContext(key)\`** — called in any descendant component to retrieve the value set by the nearest ancestor that called \`setContext\` with the same key.

## A Concrete Example — Theme Provider

Here is how you might build a theme system that any child component can access:

\`\`\`svelte
<!-- ThemeProvider.svelte (parent) -->
<script>
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  let theme = $state<'light' | 'dark'>('dark');
  function toggle() { theme = theme === 'dark' ? 'light' : 'dark'; }

  setContext('theme', {
    get current() { return theme; },
    toggle
  });
</script>

<div data-theme={theme}>
  {@render children()}
</div>
\`\`\`

Any component inside \`ThemeProvider\` can now read the theme and call toggle:

\`\`\`svelte
<!-- DeepButton.svelte (many levels down) -->
<script>
  import { getContext } from 'svelte';

  const theme = getContext('theme');
</script>

<button onclick={theme.toggle}>
  Current theme: {theme.current} — click to toggle
</button>
\`\`\`

The critical detail in the parent: \`get current() { return theme; }\`. Because the context object is created once, you cannot store the raw \`$state\` value directly — you must expose it through a getter so that reads are live. Without the getter, \`theme.current\` would always return the initial value.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.state'
		},
		{
			type: 'text',
			content: `## Using a Symbol Key

Using a plain string like \`'theme'\` as the context key works, but creates a risk of collision — if a library you use also sets context with the key \`'theme'\`, you will get the wrong value. The solution is a \`Symbol\`:

\`\`\`ts
// context-keys.ts — shared between provider and consumers
export const THEME_KEY = Symbol('theme');
export const AUTH_KEY = Symbol('auth');
export const CART_KEY = Symbol('cart');
\`\`\`

\`\`\`svelte
<!-- In provider -->
<script>
  import { THEME_KEY } from './context-keys';
  setContext(THEME_KEY, { ... });
</script>

<!-- In consumer -->
<script>
  import { THEME_KEY } from './context-keys';
  const theme = getContext(THEME_KEY);
</script>
\`\`\`

Symbols are unique by definition — two \`Symbol('theme')\` calls produce different values. By exporting a shared Symbol from a central file, your provider and consumers use the exact same reference, eliminating any possibility of collision.

## Context Is Component-Scoped

This is the most important property of context to understand: **context is scoped to the component tree, not the entire application**.

If you have two separate \`ThemeProvider\` instances, each one provides its own independent context:

\`\`\`svelte
<ThemeProvider>
  <!-- These components see ThemeProvider #1's context -->
  <Sidebar />
  <MainContent />
</ThemeProvider>

<ThemeProvider>
  <!-- This sees ThemeProvider #2's context — completely separate -->
  <Modal />
</ThemeProvider>
\`\`\`

This is fundamentally different from a module-level \`$state\` store, which is a singleton shared across the entire app. Context lets you have **multiple independent instances of the same abstraction** — which is essential for component libraries, portals, and multi-pane layouts.

## Context vs Module-Level Stores

| | Context | Module Store |
|---|---|---|
| **Scope** | Component tree | Entire app (singleton) |
| **Multiple instances** | ✅ Yes | ❌ No |
| **SSR safe** | ✅ Yes | ⚠️ Requires care |
| **Setup** | More boilerplate | Simpler |
| **Best for** | Component libraries, portals, auth trees | Global UI state (dark mode, toast queue) |

The rule of thumb: if you need the same state to be accessible everywhere with one shared instance, use a module-level store. If you need an abstraction that can be instantiated multiple times (a design system, a form library, a drag-and-drop context), use \`setContext\`/\`getContext\`.

## Type-Safe Context with TypeScript

To get full type safety on both the provider and consumers, export a typed helper function:

\`\`\`ts
// cart-context.ts
import { setContext, getContext } from 'svelte';

const CART_KEY = Symbol('cart');

interface CartContext {
  items: { id: string; qty: number }[];
  addItem(id: string): void;
  removeItem(id: string): void;
  total: number;
}

export function createCartContext(value: CartContext) {
  setContext(CART_KEY, value);
}

export function useCart(): CartContext {
  return getContext<CartContext>(CART_KEY);
}
\`\`\`

Consumers call \`const cart = useCart()\` and get a fully typed context object with IDE autocomplete and compile-time error checking.`
		},
		{
			type: 'checkpoint',
			content: 'cp-context-provide'
		},
		{
			type: 'checkpoint',
			content: 'cp-context-consume'
		},
		{
			type: 'xray-prompt',
			content: 'Open X-Ray and look at the compiler output for a component using `getContext`. Notice that context calls are left largely as-is — unlike runes, `setContext`/`getContext` are runtime functions, not compile-time transformations. The Svelte compiler does not need to transform them because they work directly through Svelte\'s component lifecycle.'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  import { setContext } from 'svelte';
  import ProductGrid from './ProductGrid.svelte';

  // Cart state
  let cartItems = $state([]);

  // TODO: Use setContext with key 'cart' to provide these functions to all descendants:
  //   - get items() { return cartItems }
  //   - addItem(id, name, price) — adds or increments item
  //   - removeItem(id) — removes item
  //   - get total() — sum of price * qty
</script>

<div class="layout">
  <header>
    <h1>🛍 Shop</h1>
    <span class="cart-count">Cart: {cartItems.length} items</span>
  </header>
  <ProductGrid />
</div>

<style>
  .layout { max-width: 700px; margin: 0 auto; font-family: system-ui, sans-serif; padding: 1rem; }
  header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
  h1 { margin: 0; font-size: 1.25rem; }
  .cart-count { font-size: 0.875rem; color: #6366f1; font-weight: 600; }
</style>`
		},
		{
			name: 'ProductGrid.svelte',
			path: '/ProductGrid.svelte',
			language: 'svelte',
			content: `<script>
  import ProductCard from './ProductCard.svelte';

  const products = [
    { id: '1', name: 'Keyboard', price: 149 },
    { id: '2', name: 'Mouse', price: 89 },
    { id: '3', name: 'Monitor', price: 399 },
    { id: '4', name: 'Headset', price: 129 },
  ];
</script>

<div class="grid">
  {#each products as product (product.id)}
    <ProductCard {product} />
  {/each}
</div>

<style>
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
</style>`
		},
		{
			name: 'ProductCard.svelte',
			path: '/ProductCard.svelte',
			language: 'svelte',
			content: `<script>
  import { getContext } from 'svelte';

  let { product } = $props();

  // TODO: Get the cart context using getContext('cart')
  // const cart = ...

  // TODO: Derive whether this product is in the cart
  // const inCart = $derived(...)
</script>

<div class="card">
  <h3>{product.name}</h3>
  <p class="price">$\${product.price}</p>
  <!-- TODO: Add to cart button that calls cart.addItem -->
  <button>Add to Cart</button>
</div>

<style>
  .card { padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; background: white; }
  h3 { margin: 0 0 0.25rem; font-size: 1rem; }
  .price { margin: 0 0 0.75rem; color: #6366f1; font-weight: 700; }
  button { width: 100%; padding: 0.5rem; border: 1px solid #6366f1; border-radius: 5px; background: white; color: #6366f1; font-weight: 600; cursor: pointer; }
  button:hover { background: #6366f1; color: white; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  import { setContext } from 'svelte';
  import ProductGrid from './ProductGrid.svelte';
  import CartSummary from './CartSummary.svelte';

  let cartItems = $state([]);

  setContext('cart', {
    get items() { return cartItems; },
    addItem(id, name, price) {
      const existing = cartItems.find(i => i.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cartItems.push({ id, name, price, qty: 1 });
      }
    },
    removeItem(id) {
      cartItems = cartItems.filter(i => i.id !== id);
    },
    get total() {
      return cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    }
  });

  const totalItems = $derived(cartItems.reduce((s, i) => s + i.qty, 0));
</script>

<div class="layout">
  <header>
    <h1>🛍 Shop</h1>
    <span class="cart-count">Cart: {totalItems} item{totalItems !== 1 ? 's' : ''}</span>
  </header>
  <ProductGrid />
  <CartSummary />
</div>

<style>
  .layout { max-width: 700px; margin: 0 auto; font-family: system-ui, sans-serif; padding: 1rem; }
  header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
  h1 { margin: 0; font-size: 1.25rem; }
  .cart-count { font-size: 0.875rem; color: #6366f1; font-weight: 600; }
</style>`
		},
		{
			name: 'ProductGrid.svelte',
			path: '/ProductGrid.svelte',
			language: 'svelte',
			content: `<script>
  import ProductCard from './ProductCard.svelte';

  const products = [
    { id: '1', name: 'Keyboard', price: 149 },
    { id: '2', name: 'Mouse', price: 89 },
    { id: '3', name: 'Monitor', price: 399 },
    { id: '4', name: 'Headset', price: 129 },
  ];
</script>

<div class="grid">
  {#each products as product (product.id)}
    <ProductCard {product} />
  {/each}
</div>

<style>
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
</style>`
		},
		{
			name: 'ProductCard.svelte',
			path: '/ProductCard.svelte',
			language: 'svelte',
			content: `<script>
  import { getContext } from 'svelte';

  let { product } = $props();
  const cart = getContext('cart');
  const inCart = $derived(cart.items.some(i => i.id === product.id));
</script>

<div class="card" class:in-cart={inCart}>
  <h3>{product.name}</h3>
  <p class="price">$\${product.price}</p>
  {#if inCart}
    <button class="remove" onclick={() => cart.removeItem(product.id)}>✓ In Cart — Remove</button>
  {:else}
    <button onclick={() => cart.addItem(product.id, product.name, product.price)}>Add to Cart</button>
  {/if}
</div>

<style>
  .card { padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; background: white; transition: border-color 0.2s; }
  .card.in-cart { border-color: #6366f1; background: #f5f3ff; }
  h3 { margin: 0 0 0.25rem; font-size: 1rem; }
  .price { margin: 0 0 0.75rem; color: #6366f1; font-weight: 700; }
  button { width: 100%; padding: 0.5rem; border: 1px solid #6366f1; border-radius: 5px; background: white; color: #6366f1; font-weight: 600; cursor: pointer; }
  button:hover { background: #6366f1; color: white; }
  .remove { border-color: #10b981; color: #10b981; }
  .remove:hover { background: #10b981; color: white; }
</style>`
		},
		{
			name: 'CartSummary.svelte',
			path: '/CartSummary.svelte',
			language: 'svelte',
			content: `<script>
  import { getContext } from 'svelte';
  const cart = getContext('cart');
</script>

{#if cart.items.length > 0}
  <div class="summary">
    <h2>Cart</h2>
    {#each cart.items as item (item.id)}
      <div class="row">
        <span>{item.name} ×{item.qty}</span>
        <span>$\${item.price * item.qty}</span>
      </div>
    {/each}
    <div class="total">Total: <strong>$\${cart.total}</strong></div>
  </div>
{/if}

<style>
  .summary { margin-top: 2rem; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
  h2 { margin: 0 0 1rem; font-size: 1rem; }
  .row { display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid #e2e8f0; font-size: 0.875rem; }
  .total { padding-top: 0.75rem; text-align: right; font-size: 0.875rem; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-context-provide',
			description: 'Use setContext to provide cart functions from the App component',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'setContext' },
						{ type: 'contains', value: "'cart'" },
						{ type: 'contains', value: 'addItem' }
					]
				}
			},
			hints: [
				'Call `setContext(\'cart\', { ... })` in App.svelte with the cart functions.',
				'Expose reactive state via getters: `get items() { return cartItems; }` — without the getter, consumers would see a stale snapshot.',
				'Include `addItem`, `removeItem`, and a `total` getter in your context object.'
			],
			conceptsTested: ['svelte5.context.set']
		},
		{
			id: 'cp-context-consume',
			description: 'Use getContext in ProductCard to access the cart without prop drilling',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'getContext' },
						{ type: 'contains', value: "'cart'" },
						{ type: 'contains', value: 'cart.addItem' }
					]
				}
			},
			hints: [
				'Call `const cart = getContext(\'cart\')` in ProductCard.svelte.',
				'Note that ProductGrid does not need the cart at all — it just renders ProductCard. Context skips intermediate components.',
				'Use `$derived` to compute whether this product is already in the cart: `const inCart = $derived(cart.items.some(i => i.id === product.id))`.'
			],
			conceptsTested: ['svelte5.context.get', 'svelte5.runes.derived']
		}
	]
};
