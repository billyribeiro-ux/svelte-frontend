import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '1-1',
		title: 'Objects: Grouping Related Data',
		phase: 1,
		module: 1,
		lessonIndex: 1
	},
	description: `Imagine you're building an app and you need to track information about a user — their name, age, email, and role. You *could* create four separate variables: \`userName\`, \`userAge\`, \`userEmail\`, \`userRole\`. But what happens when you have ten users? Or when you need to pass all that info to a function? Things get messy fast.

Objects solve this by letting you bundle related pieces of data together under one name. Instead of four variables floating around, you have a single \`user\` object with four properties inside it. This is the mental model: an object is a labeled container for related values.

In Svelte 5, when you wrap an object in \`$state(...)\`, it becomes **deeply reactive** — change any property (even a nested one) and the UI updates automatically. No need to manually reassign the whole object.

In this lesson, you'll create object literals, access properties using dot and bracket notation, work with nested objects, and see reactivity in action as you update properties.`,
	objectives: [
		'Create object literals with properties of different types',
		'Access properties using dot notation (obj.key) and bracket notation (obj["key"])',
		'Work with nested objects (objects inside objects)',
		'Update properties reactively using $state',
		'Add and remove properties dynamically',
		'Understand when to use bracket notation vs dot notation'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ============================================================
  // EXAMPLE 1 — A simple object
  // ------------------------------------------------------------
  // An object groups related data. Each piece is a "property"
  // with a key (name) and a value. Wrap with $state so Svelte
  // re-renders when anything inside changes.
  // ============================================================
  let person = $state({
    name: 'Billy',
    age: 30,
    role: 'Developer',
    email: 'billy@example.com'
  });

  // Dot notation — the most common way to read/update properties
  function birthday() {
    person.age += 1; // reactive! UI updates instantly
  }

  function promote() {
    // A mini state machine using a ternary
    person.role = person.role === 'Developer'
      ? 'Senior Developer'
      : 'Developer';
  }

  // ============================================================
  // EXAMPLE 2 — Bracket notation for dynamic keys
  // ------------------------------------------------------------
  // Use brackets when the key is stored in a variable, or when
  // the key has special characters/spaces. Dot notation can't
  // handle keys like "first name" — brackets can.
  // ============================================================
  let selectedField = $state('name');
  const fields = ['name', 'age', 'role', 'email'];

  // person[selectedField] looks up whichever key is selected
  // right now. Change selectedField and the displayed value changes.

  // ============================================================
  // EXAMPLE 3 — Nested objects (objects inside objects)
  // ------------------------------------------------------------
  // Real data is often hierarchical: a company has an address,
  // an address has a street, city, country. Just nest them.
  // ============================================================
  let company = $state({
    name: 'Acme Corp',
    founded: 2020,
    address: {
      street: '123 Main St',
      city: 'Codeville',
      country: 'JS Land'
    },
    ceo: {
      name: 'Jane Doe',
      age: 45
    }
  });

  function moveCompany() {
    // Reach into nested properties with chained dots
    company.address.city = company.address.city === 'Codeville'
      ? 'Frameworkton'
      : 'Codeville';
  }

  function ceoBirthday() {
    company.ceo.age += 1;
  }

  // ============================================================
  // EXAMPLE 4 — Real-world: a shopping cart item
  // ------------------------------------------------------------
  // A single object can represent a complex "thing" in your app.
  // Here we track a product, its price, quantity, and whether
  // it's on sale — all in one place.
  // ============================================================
  let product = $state({
    title: 'Svelte T-Shirt',
    price: 25,
    quantity: 1,
    onSale: false,
    details: {
      size: 'M',
      color: 'orange'
    }
  });

  // A derived value automatically recomputes when its inputs change
  const total = $derived(
    product.onSale
      ? product.price * product.quantity * 0.8  // 20% off
      : product.price * product.quantity
  );

  function increaseQty() { product.quantity += 1; }
  function decreaseQty() {
    if (product.quantity > 0) product.quantity -= 1;
  }
  function toggleSale() { product.onSale = !product.onSale; }
  function toggleSize() {
    product.details.size = product.details.size === 'M' ? 'L' : 'M';
  }
</script>

<h1>Objects: Grouping Related Data</h1>

<section>
  <h2>1. Simple Object (dot notation)</h2>
  <p>Name: <strong>{person.name}</strong></p>
  <p>Age: <strong>{person.age}</strong></p>
  <p>Role: <strong>{person.role}</strong></p>
  <p>Email: <strong>{person.email}</strong></p>
  <div class="buttons">
    <button onclick={birthday}>Birthday (+1 age)</button>
    <button onclick={promote}>Toggle Promotion</button>
  </div>
</section>

<section>
  <h2>2. Bracket Notation (dynamic keys)</h2>
  <p>Click a field below — the value is looked up by key:</p>
  <div class="buttons">
    {#each fields as field (field)}
      <button
        onclick={() => selectedField = field}
        class:active={selectedField === field}
      >
        {field}
      </button>
    {/each}
  </div>
  <p>
    <code>person["{selectedField}"]</code> =
    <strong>{person[selectedField]}</strong>
  </p>
</section>

<section>
  <h2>3. Nested Objects</h2>
  <p>Company: <strong>{company.name}</strong> (founded {company.founded})</p>
  <p>Address: {company.address.street}, <strong>{company.address.city}</strong>, {company.address.country}</p>
  <p>CEO: <strong>{company.ceo.name}</strong>, age {company.ceo.age}</p>
  <div class="buttons">
    <button onclick={moveCompany}>Move Company</button>
    <button onclick={ceoBirthday}>CEO Birthday</button>
  </div>
</section>

<section>
  <h2>4. Real-World: Shopping Cart Item</h2>
  <div class="product" class:sale={product.onSale}>
    <h3>{product.title}</h3>
    <p>Size: <strong>{product.details.size}</strong> | Color: {product.details.color}</p>
    <p>Price: \${product.price} x {product.quantity} = <strong>\${total.toFixed(2)}</strong></p>
    {#if product.onSale}
      <p class="sale-tag">20% OFF!</p>
    {/if}
  </div>
  <div class="buttons">
    <button onclick={decreaseQty}>-</button>
    <button onclick={increaseQty}>+</button>
    <button onclick={toggleSale}>Toggle Sale</button>
    <button onclick={toggleSize}>Toggle Size</button>
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  h3 { margin: 0 0 6px 0; color: #222; font-size: 15px; }
  section { margin-bottom: 24px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
  .buttons { display: flex; gap: 8px; margin: 8px 0; flex-wrap: wrap; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover { background: #ff3e00; color: white; }
  .active { background: #ff3e00; color: white; }
  .product {
    background: #fff7f3; border: 2px solid #ffd4bf;
    padding: 12px; border-radius: 8px; margin: 8px 0;
  }
  .product.sale { border-color: #4ec9b0; background: #f0faf8; }
  .sale-tag {
    display: inline-block; background: #4ec9b0; color: white;
    padding: 2px 10px; border-radius: 10px; font-size: 11px;
    font-weight: 700; margin-top: 4px;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
