import type { Lesson } from '$types/lesson';

export const constInTemplates: Lesson = {
	id: 'svelte-core.control-flow.const-in-templates',
	slug: 'const-in-templates',
	title: 'Template Constants with {@const}',
	description:
		'Use {@const} to declare local constants inside template blocks, eliminating repetitive expressions and improving readability in {#each} and {#if} blocks.',
	trackId: 'svelte-core',
	moduleId: 'control-flow',
	order: 5,
	estimatedMinutes: 14,
	concepts: ['svelte5.const.template', 'svelte5.const.scope', 'svelte5.const.computed'],
	prerequisites: ['svelte5.control-flow.each', 'svelte5.control-flow.if'],

	content: [
		{
			type: 'text',
			content: `# Template Constants with {@const}

## WHY {@const} Exists

When you iterate over data with \`{#each}\` or conditionally render with \`{#if}\`, you frequently need to compute derived values from the current item. Without \`{@const}\`, you end up repeating expressions, cluttering the template, or moving logic into the script block where it loses its connection to the template context.

Consider a product listing. Each product has a \`price\` and a \`taxRate\`. You want to display the final price including tax. Without \`{@const}\`, you would write:

\`\`\`svelte
{#each products as product}
  <div>
    <span>{product.name}</span>
    <span>{(product.price * (1 + product.taxRate)).toFixed(2)}</span>
    <span class:expensive={product.price * (1 + product.taxRate) > 100}>
      {product.price * (1 + product.taxRate) > 100 ? 'Premium' : 'Standard'}
    </span>
  </div>
{/each}
\`\`\`

The expression \`product.price * (1 + product.taxRate)\` appears three times. This is not just a readability problem -- it is a maintenance hazard. If the formula changes, you need to update it in three places. If you miss one, you have a bug that is hard to spot because the template looks visually similar.

### The Pre-{@const} Workarounds

Before \`{@const}\` existed, developers had two unsatisfying options:

**Option 1: Precompute in the script block.** You could create a derived array with the computed values baked in. But this means maintaining a parallel data structure that duplicates information and must stay in sync with the original data. It also moves the presentation logic away from the template, making it harder to understand what the template is doing.

**Option 2: Use a helper function.** You could write \`getTotal(product)\` and call it in the template. This reduces repetition but introduces function call overhead on every render cycle. More importantly, the function lives in the script block while its purpose is purely presentational -- it exists only to serve the template.

### What {@const} Actually Does

\`{@const}\` lets you declare a local constant inside any template block. The constant is scoped to that block -- it exists only within the \`{#each}\`, \`{#if}\`, \`{#snippet}\`, or other block where it is declared. It is evaluated once per block iteration (for \`{#each}\`) or once per block render (for \`{#if}\`).

\`\`\`svelte
{#each products as product}
  {@const total = product.price * (1 + product.taxRate)}
  <div>
    <span>{product.name}</span>
    <span>{total.toFixed(2)}</span>
    <span class:expensive={total > 100}>
      {total > 100 ? 'Premium' : 'Standard'}
    </span>
  </div>
{/each}
\`\`\`

Now the expression appears once. The name \`total\` communicates intent. Changes to the formula happen in one place. The template reads like a description of the UI rather than a pile of duplicated calculations.

### Compile-Time Behavior

The Svelte compiler treats \`{@const}\` as a compile-time declaration. It does not create a reactive variable or a store. It is closer to a \`const\` in JavaScript -- a name bound to a value that does not change within its scope. However, because it is re-evaluated on each render of its containing block, it naturally stays up-to-date when the underlying data changes. If \`product.price\` is reactive state, the \`{@const total}\` will reflect the current price on every render.

This is a subtle but important point: \`{@const}\` is not reactive in the way \`$derived\` is. It does not set up a dependency graph. It is simply inlined by the compiler into the block's render function, giving you a named reference to an expression that would otherwise be anonymous and repeated.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.const.template'
		},
		{
			type: 'text',
			content: `## Scope Rules

The constant declared with \`{@const}\` is only available within the block where it is declared. It cannot be accessed outside that block, in sibling blocks, or in parent blocks.

\`\`\`svelte
{#each items as item}
  {@const label = item.name.toUpperCase()}
  <p>{label}</p> <!-- works -->
{/each}

<p>{label}</p> <!-- ERROR: label is not defined -->
\`\`\`

This scoping is intentional and beneficial. It prevents name collisions and makes it clear that the constant is tied to a specific context. In a complex template with multiple \`{#each}\` blocks, each block can have its own \`{@const}\` declarations without worrying about name conflicts.

### Nesting and Shadowing

You can nest \`{@const}\` declarations in nested blocks. Inner declarations can shadow outer ones, though this is generally poor practice:

\`\`\`svelte
{#each categories as category}
  {@const title = category.name}
  <h2>{title}</h2>

  {#each category.items as item}
    {@const title = item.name}  <!-- shadows outer title -->
    <p>{title}</p>
  {/each}
{/each}
\`\`\`

Prefer distinct names to avoid confusion: use \`categoryTitle\` and \`itemTitle\` instead.

### Where {@const} Can Appear

\`{@const}\` can be used inside:
- \`{#each}\` blocks
- \`{#if}\` / \`{:else if}\` / \`{:else}\` blocks
- \`{#snippet}\` blocks
- \`{#await}\` / \`{:then}\` / \`{:catch}\` blocks
- Component slot content (when passing children)

It **cannot** appear at the top level of a template outside of any block. For top-level derived values, use \`$derived\` in the script block.

\`\`\`svelte
<!-- INVALID: @const at top level -->
{@const x = 5}

<!-- VALID: @const inside a block -->
{#if condition}
  {@const x = 5}
  <p>{x}</p>
{/if}
\`\`\`

**Task:** Given a list of products with \`price\` and \`discount\` properties, use \`{@const}\` to compute the discounted price and display both the original price and the savings amount inside an \`{#each}\` block.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Common Patterns

### Pattern 1: Computed Display Values

The most common use is computing a display value from item properties:

\`\`\`svelte
{#each users as user}
  {@const fullName = \`\${user.firstName} \${user.lastName}\`}
  {@const initials = \`\${user.firstName[0]}\${user.lastName[0]}\`}
  <div class="avatar" title={fullName}>{initials}</div>
  <span>{fullName}</span>
{/each}
\`\`\`

Without \`{@const}\`, the full name template literal would appear twice.

### Pattern 2: Destructuring Complex Objects

When an item has deeply nested properties, \`{@const}\` with destructuring cleans up the template:

\`\`\`svelte
{#each orders as order}
  {@const { street, city, zip } = order.shipping.address}
  {@const { name, email } = order.customer}
  <div>
    <p>{name} ({email})</p>
    <p>{street}, {city} {zip}</p>
  </div>
{/each}
\`\`\`

Compare this to writing \`order.shipping.address.street\`, \`order.shipping.address.city\`, and \`order.shipping.address.zip\` repeatedly. The destructured version is shorter, clearer, and less error-prone.

### Pattern 3: Avoiding Repeated Function Calls

If you need to call a function that produces a value used multiple times in a block, \`{@const}\` ensures the function is called once:

\`\`\`svelte
{#each dates as date}
  {@const formatted = formatDate(date, locale)}
  {@const isToday = isSameDay(date, today)}
  <li class:today={isToday}>
    {formatted}
    {#if isToday}
      <span class="badge">Today</span>
    {/if}
  </li>
{/each}
\`\`\`

Without \`{@const}\`, \`formatDate(date, locale)\` would be called each time the value is referenced in the template. While the Svelte compiler is smart about many optimizations, explicitly naming the result ensures a single call and communicates intent.

### Pattern 4: Conditional Logic Within Blocks

\`{@const}\` is particularly useful inside \`{#if}\` blocks where you want to derive a value based on the condition that was just checked:

\`\`\`svelte
{#if user.role === 'admin'}
  {@const permissions = getAdminPermissions(user)}
  <AdminPanel {permissions} />
{:else if user.role === 'editor'}
  {@const permissions = getEditorPermissions(user)}
  <EditorPanel {permissions} />
{/if}
\`\`\`

Each branch computes its own permissions set, and the constant is only evaluated when that branch is active.`
		},
		{
			type: 'xray-prompt',
			content: 'Look at the compiled output of a component using {@const}. How does the Svelte compiler translate {@const} declarations? Is there any runtime overhead compared to inlining the expression? Consider how this differs from $derived -- one is a template convenience, the other is a reactive primitive. Why does Svelte need both?'
		},
		{
			type: 'text',
			content: `## Real-World Exercise: Product Catalog with Discounts

Let us build a product catalog that demonstrates the practical value of \`{@const}\`. We have a list of products, each with a base price and a discount percentage. The catalog needs to display:

1. The original price
2. The discount percentage
3. The discount amount (how much you save)
4. The final price after discount
5. A badge indicating whether the item is on sale or clearance (over 30% off)

Without \`{@const}\`, you would compute the discount amount and final price inline each time they appear. With \`{@const}\`, you compute each value once and reference it by name.

### The Data Structure

\`\`\`typescript
interface Product {
  id: number;
  name: string;
  price: number;       // base price in dollars
  discount: number;    // discount as decimal (0.15 = 15%)
  category: string;
}
\`\`\`

### Building the Catalog

The starter code provides the product array and basic markup. Your job is to:

1. Use \`{@const}\` to compute \`discountAmount\`, \`finalPrice\`, and \`badge\` inside the \`{#each}\` block
2. Display these computed values in the template
3. Apply conditional styling based on the computed values

This exercise reinforces three things:
- **DRY templates**: each expression appears once
- **Named values**: the code reads like documentation
- **Block scoping**: each product iteration has its own set of constants

**Task:** Complete the product catalog by adding \`{@const}\` declarations for \`discountAmount\` (price * discount), \`finalPrice\` (price - discountAmount), and \`badge\` (either "Clearance" if discount > 0.3, "Sale" if discount > 0, or an empty string). Display all computed values in the template and conditionally show the badge.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## {@const} vs $derived: Choosing the Right Tool

A common question is when to use \`{@const}\` versus \`$derived\`. They solve different problems and operate at different levels:

| Aspect | {@const} | $derived |
|---|---|---|
| **Scope** | Template block only | Component-wide |
| **Reactive** | Re-evaluated per render | Tracked dependency graph |
| **Location** | Inside template blocks | Script block |
| **Use case** | Per-item or per-branch computations | Component-level derived state |
| **Iteration** | Re-computed per \`{#each}\` iteration | Single value for the component |

Use \`$derived\` for component-level state that other parts of the script need to access. Use \`{@const}\` for presentation-level computations that are only relevant within a specific template block.

\`\`\`svelte
<script lang="ts">
  let products = $state(initialProducts);
  // Component-level: use $derived
  let totalRevenue = $derived(
    products.reduce((sum, p) => sum + p.price * (1 - p.discount), 0)
  );
</script>

<p>Total: {totalRevenue.toFixed(2)}</p>

{#each products as product}
  <!-- Per-item: use @const -->
  {@const finalPrice = product.price * (1 - product.discount)}
  <span>{finalPrice.toFixed(2)}</span>
{/each}
\`\`\`

### Anti-Patterns to Avoid

**Do not use {@const} as a workaround for missing reactive state.** If you find yourself needing a computed value outside of a template block, it belongs in the script block as a \`$derived\` value.

**Do not over-use {@const}.** If an expression appears only once and is simple, there is no need to extract it. \`{@const x = a + b}\` followed by a single \`{x}\` is more verbose than just writing \`{a + b}\`.

**Do not use {@const} for side effects.** The declaration must be a pure expression. It is evaluated during rendering, and side effects during rendering lead to unpredictable behavior.

\`\`\`svelte
<!-- BAD: side effect in @const -->
{@const _ = console.log('rendering item', item.id)}

<!-- GOOD: pure computation -->
{@const total = item.quantity * item.unitPrice}
\`\`\`

### Performance Considerations

\`{@const}\` has zero runtime overhead beyond the expression evaluation itself. The compiler simply inlines the expression assignment into the block's render function. There is no wrapper, no proxy, no subscription. It is the lightest-weight way to name a computed value in a template.

For lists with many items, \`{@const}\` can actually improve performance if it replaces multiple evaluations of the same expression. Instead of computing \`item.price * (1 + item.tax)\` three times per item, the named constant computes it once. For a list of 500 items, that is 1000 fewer expression evaluations per render cycle.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.const.scope'
		},
		{
			type: 'text',
			content: `## Advanced: {@const} in Snippets and Await Blocks

### Inside Snippets

Snippets are reusable template fragments in Svelte 5. \`{@const}\` works inside snippets just as it does inside other blocks:

\`\`\`svelte
{#snippet productCard(product)}
  {@const savings = product.price * product.discount}
  {@const isFree = product.price - savings === 0}
  <div class="card">
    <h3>{product.name}</h3>
    {#if isFree}
      <span class="free">FREE</span>
    {:else}
      <span>Save \${savings.toFixed(2)}</span>
    {/if}
  </div>
{/snippet}

{#each products as product}
  {@render productCard(product)}
{/each}
\`\`\`

This is a powerful combination. The snippet encapsulates a reusable template, and \`{@const}\` keeps the internal computations clean and named.

### Inside Await Blocks

\`{@const}\` can simplify the resolved value of an \`{#await}\` block:

\`\`\`svelte
{#await fetchUserProfile(userId)}
  <p>Loading...</p>
{:then profile}
  {@const displayName = profile.nickname || \`\${profile.firstName} \${profile.lastName}\`}
  {@const memberSince = new Date(profile.createdAt).getFullYear()}
  <h1>{displayName}</h1>
  <p>Member since {memberSince}</p>
{:catch error}
  {@const message = error instanceof Error ? error.message : 'Unknown error'}
  <p class="error">{message}</p>
{/await}
\`\`\`

Each branch of the await block can have its own \`{@const}\` declarations, keeping the template clean even when dealing with complex async data.

### Multiple {@const} Declarations

You can declare as many constants as needed in a single block. They are evaluated in order, and later constants can reference earlier ones:

\`\`\`svelte
{#each invoices as invoice}
  {@const subtotal = invoice.items.reduce((sum, i) => sum + i.amount, 0)}
  {@const tax = subtotal * invoice.taxRate}
  {@const total = subtotal + tax}
  {@const isPaid = invoice.paidAmount >= total}
  <div class:paid={isPaid}>
    <span>Subtotal: \${subtotal.toFixed(2)}</span>
    <span>Tax: \${tax.toFixed(2)}</span>
    <span>Total: \${total.toFixed(2)}</span>
    {#if isPaid}<span class="badge">Paid</span>{/if}
  </div>
{/each}
\`\`\`

Each constant builds on the previous, creating a clear chain of computation. This is both readable and efficient -- each value is computed exactly once.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface Product {
    id: number;
    name: string;
    price: number;
    discount: number;
    category: string;
  }

  let products = $state<Product[]>([
    { id: 1, name: 'Wireless Headphones', price: 89.99, discount: 0.15, category: 'Electronics' },
    { id: 2, name: 'Running Shoes', price: 129.99, discount: 0.35, category: 'Sports' },
    { id: 3, name: 'Coffee Maker', price: 49.99, discount: 0.10, category: 'Kitchen' },
    { id: 4, name: 'Yoga Mat', price: 24.99, discount: 0.0, category: 'Sports' },
    { id: 5, name: 'Desk Lamp', price: 34.99, discount: 0.50, category: 'Home' },
    { id: 6, name: 'Backpack', price: 59.99, discount: 0.20, category: 'Travel' }
  ]);
</script>

<div class="catalog">
  <h1>Product Catalog</h1>

  {#each products as product}
    <!-- TODO: Use {@const} to compute:
         - discountAmount = product.price * product.discount
         - finalPrice = product.price - discountAmount
         - badge = "Clearance" if discount > 0.3, "Sale" if discount > 0, or ""
    -->
    <div class="product-card">
      <h2>{product.name}</h2>
      <span class="category">{product.category}</span>

      <div class="pricing">
        <!-- TODO: Display original price -->
        <span class="original-price"></span>

        <!-- TODO: Display final price using @const value -->
        <span class="final-price"></span>

        <!-- TODO: Display savings using @const value -->
        <span class="savings"></span>
      </div>

      <!-- TODO: Conditionally show badge using @const value -->
    </div>
  {/each}
</div>

<style>
  .catalog {
    font-family: system-ui, sans-serif;
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .product-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .category {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .pricing {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-top: 0.5rem;
  }

  .original-price {
    text-decoration: line-through;
    color: #9ca3af;
  }

  .final-price {
    font-weight: bold;
    font-size: 1.25rem;
    color: #059669;
  }

  .savings {
    color: #dc2626;
    font-size: 0.875rem;
  }

  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
    margin-top: 0.5rem;
  }

  .badge.sale {
    background: #fef3c7;
    color: #d97706;
  }

  .badge.clearance {
    background: #fee2e2;
    color: #dc2626;
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface Product {
    id: number;
    name: string;
    price: number;
    discount: number;
    category: string;
  }

  let products = $state<Product[]>([
    { id: 1, name: 'Wireless Headphones', price: 89.99, discount: 0.15, category: 'Electronics' },
    { id: 2, name: 'Running Shoes', price: 129.99, discount: 0.35, category: 'Sports' },
    { id: 3, name: 'Coffee Maker', price: 49.99, discount: 0.10, category: 'Kitchen' },
    { id: 4, name: 'Yoga Mat', price: 24.99, discount: 0.0, category: 'Sports' },
    { id: 5, name: 'Desk Lamp', price: 34.99, discount: 0.50, category: 'Home' },
    { id: 6, name: 'Backpack', price: 59.99, discount: 0.20, category: 'Travel' }
  ]);
</script>

<div class="catalog">
  <h1>Product Catalog</h1>

  {#each products as product}
    {@const discountAmount = product.price * product.discount}
    {@const finalPrice = product.price - discountAmount}
    {@const badge = product.discount > 0.3 ? 'Clearance' : product.discount > 0 ? 'Sale' : ''}

    <div class="product-card">
      <h2>{product.name}</h2>
      <span class="category">{product.category}</span>

      <div class="pricing">
        <span class="original-price">\${product.price.toFixed(2)}</span>
        <span class="final-price">\${finalPrice.toFixed(2)}</span>
        {#if discountAmount > 0}
          <span class="savings">Save \${discountAmount.toFixed(2)}</span>
        {/if}
      </div>

      {#if badge}
        <span class="badge" class:sale={badge === 'Sale'} class:clearance={badge === 'Clearance'}>
          {badge}
        </span>
      {/if}
    </div>
  {/each}
</div>

<style>
  .catalog {
    font-family: system-ui, sans-serif;
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .product-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .category {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .pricing {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-top: 0.5rem;
  }

  .original-price {
    text-decoration: line-through;
    color: #9ca3af;
  }

  .final-price {
    font-weight: bold;
    font-size: 1.25rem;
    color: #059669;
  }

  .savings {
    color: #dc2626;
    font-size: 0.875rem;
  }

  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
    margin-top: 0.5rem;
  }

  .badge.sale {
    background: #fef3c7;
    color: #d97706;
  }

  .badge.clearance {
    background: #fee2e2;
    color: #dc2626;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use {@const} to compute discountAmount and finalPrice inside the {#each} block',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{@const discountAmount' },
						{ type: 'contains', value: '{@const finalPrice' }
					]
				}
			},
			hints: [
				'Add `{@const discountAmount = product.price * product.discount}` inside the `{#each}` block, before the product card markup.',
				'Add `{@const finalPrice = product.price - discountAmount}` right after the discountAmount declaration. Later `{@const}` declarations can reference earlier ones.',
				'Your `{#each}` block should start with `{@const discountAmount = product.price * product.discount}` and `{@const finalPrice = product.price - discountAmount}`, then use `{finalPrice.toFixed(2)}` and `{discountAmount.toFixed(2)}` in the template.'
			],
			conceptsTested: ['svelte5.const.template', 'svelte5.const.computed']
		},
		{
			id: 'cp-2',
			description: 'Use {@const} to compute a badge label and conditionally display it',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{@const badge' },
						{ type: 'contains', value: '{#if badge}' }
					]
				}
			},
			hints: [
				'Add `{@const badge = product.discount > 0.3 ? \'Clearance\' : product.discount > 0 ? \'Sale\' : \'\'}` to compute the badge text.',
				'Use `{#if badge}` to conditionally render a `<span class="badge">` element with the badge text.',
				'Combine the badge declaration `{@const badge = product.discount > 0.3 ? \'Clearance\' : product.discount > 0 ? \'Sale\' : \'\'}` with `{#if badge}<span class="badge" class:sale={badge === \'Sale\'} class:clearance={badge === \'Clearance\'}>{badge}</span>{/if}` in the template.'
			],
			conceptsTested: ['svelte5.const.template', 'svelte5.const.scope']
		}
	]
};
