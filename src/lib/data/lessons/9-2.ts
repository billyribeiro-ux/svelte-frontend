import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '9-2',
		title: 'Checkboxes, Radios, Selects & Details',
		phase: 3,
		module: 9,
		lessonIndex: 2
	},
	description: `\`bind:value\` is only half the story. Svelte provides a dedicated binding for every common form element, and picking the right one dramatically simplifies your code.

**\`bind:checked\`** turns a single checkbox into a boolean. **\`bind:group\`** is the killer feature — when multiple radio buttons or checkboxes share the same \`bind:group={variable}\`, Svelte automatically manages the group for you. For radios the variable is a single value (whichever is selected); for checkboxes it's an array of the currently-checked values. No \`name\` attribute, no manual event wiring.

For \`<select>\`, \`bind:value\` works the same way it does on text inputs — unless you add the \`multiple\` attribute, in which case the bound value becomes a \`string[]\`. Even \`<details>\` supports binding via \`bind:open\`, letting you build expand-all / collapse-all controls with a single line of code.

This lesson builds a live pizza-ordering form that exercises every one of these bindings and derives a running total from the choices.`,
	objectives: [
		'Use bind:checked on single checkboxes for boolean toggles',
		'Use bind:group to build radio groups without a name attribute',
		'Use bind:group on checkboxes to collect checked values into an array',
		'Bind <select> and <select multiple> with bind:value',
		'Use bind:open on <details> for expand/collapse state',
		'Drive derived state ($derived) from the bound form values'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // Form bindings beyond bind:value
  // ============================================================
  //
  // bind:value is only half the story. Svelte offers specialised
  // bindings for every common form element:
  //
  //   bind:checked  — single checkbox (boolean)
  //   bind:group    — radio buttons or checkboxes that share
  //                   a variable (value is a string or string[])
  //   bind:value    — <select> (single string) or
  //                   <select multiple> (string[])
  //   bind:open     — <details> expand/collapse (boolean)
  //
  // Each binding is two-way: writing to the variable updates
  // the element, and user interaction updates the variable.

  // --- Single checkbox (bind:checked) -------------------------
  let subscribed: boolean = $state(true);
  let agreed: boolean = $state(false);
  let darkMode: boolean = $state(false);

  // --- Radio group (bind:group) -------------------------------
  type Plan = 'free' | 'pro' | 'enterprise';
  let plan: Plan = $state('pro');

  const planDetails: Record<Plan, { price: string; perks: string[] }> = {
    free: { price: '$0/mo', perks: ['1 project', 'Community support'] },
    pro: { price: '$12/mo', perks: ['Unlimited projects', 'Email support', 'Custom domains'] },
    enterprise: { price: '$99/mo', perks: ['Everything in Pro', 'SSO', 'SLA', 'Dedicated rep'] }
  };

  // --- Checkbox group (bind:group) ----------------------------
  let toppings: string[] = $state(['Cheese']);
  const availableToppings = [
    'Cheese', 'Pepperoni', 'Mushrooms', 'Olives',
    'Peppers', 'Onions', 'Pineapple', 'Anchovies'
  ];

  function selectAll() { toppings = [...availableToppings]; }
  function clearToppings() { toppings = []; }

  // --- Single <select> (bind:value) ---------------------------
  let size: 'small' | 'medium' | 'large' = $state('medium');
  const sizePrice: Record<typeof size, number> = { small: 9, medium: 12, large: 15 };

  // --- Multi <select> (bind:value with array) -----------------
  let languages: string[] = $state(['ts', 'svelte']);
  const allLanguages = [
    { id: 'ts', label: 'TypeScript' },
    { id: 'js', label: 'JavaScript' },
    { id: 'svelte', label: 'Svelte' },
    { id: 'rust', label: 'Rust' },
    { id: 'go', label: 'Go' },
    { id: 'python', label: 'Python' }
  ];

  // --- <details> bind:open ------------------------------------
  let faqOpen: boolean[] = $state([false, false, false]);
  const faqs = [
    { q: 'What is two-way binding?', a: 'A convenience that keeps a variable and a form element in sync without manual event handlers.' },
    { q: 'Does bind:group work with dynamic options?', a: 'Yes — the value array just mirrors whichever options are currently checked.' },
    { q: 'Can I bind to <details>?', a: 'Absolutely — use bind:open to control or observe the expanded state.' }
  ];

  function expandAll() { faqOpen = faqOpen.map(() => true); }
  function collapseAll() { faqOpen = faqOpen.map(() => false); }

  // --- Live totals derived from the current choices -----------
  const toppingPrice = $derived(toppings.length * 1.5);
  const total = $derived(sizePrice[size] + toppingPrice);
</script>

<main class:dark={darkMode}>
  <h1>Checkboxes, Radios, Selects &amp; Details</h1>
  <p class="lede">
    Every form element gets its own dedicated binding. Click
    around — the state panel on each card updates live.
  </p>

  <label class="theme-toggle">
    <input type="checkbox" bind:checked={darkMode} />
    Dark mode (bind:checked)
  </label>

  <div class="grid">
    <section>
      <h2>1. Single checkbox — <code>bind:checked</code></h2>
      <label>
        <input type="checkbox" bind:checked={subscribed} />
        Subscribe to the newsletter
      </label>
      <label>
        <input type="checkbox" bind:checked={agreed} />
        I agree to the terms
      </label>
      <p class="state">
        subscribed: <strong>{subscribed}</strong>,
        agreed: <strong>{agreed}</strong>
      </p>
      <button type="button" disabled={!agreed}>
        {agreed ? 'Continue' : 'Accept terms to continue'}
      </button>
    </section>

    <section>
      <h2>2. Radio group — <code>bind:group</code></h2>
      <p class="hint">
        Same variable on every radio = same group. No
        <code>name</code> attribute required.
      </p>
      <div class="radios">
        {#each (['free', 'pro', 'enterprise'] as const) as p (p)}
          <label class:active={plan === p}>
            <input type="radio" bind:group={plan} value={p} />
            <span class="plan-name">{p}</span>
            <span class="plan-price">{planDetails[p].price}</span>
          </label>
        {/each}
      </div>
      <ul class="perks">
        {#each planDetails[plan].perks as perk (perk)}
          <li>{perk}</li>
        {/each}
      </ul>
    </section>

    <section>
      <h2>3. Checkbox group — <code>bind:group</code></h2>
      <p class="hint">
        With checkboxes, <code>bind:group</code> is a
        <code>string[]</code> of the checked values.
      </p>
      <div class="toppings">
        {#each availableToppings as topping (topping)}
          <label>
            <input type="checkbox" bind:group={toppings} value={topping} />
            {topping}
          </label>
        {/each}
      </div>
      <div class="topping-actions">
        <button type="button" onclick={selectAll}>Select all</button>
        <button type="button" onclick={clearToppings}>Clear</button>
      </div>
      <p class="state">
        Selected ({toppings.length}):
        <strong>{toppings.join(', ') || 'none'}</strong>
      </p>
    </section>

    <section>
      <h2>4. Single select — <code>bind:value</code></h2>
      <label>
        Pizza size
        <select bind:value={size}>
          <option value="small">Small ($9)</option>
          <option value="medium">Medium ($12)</option>
          <option value="large">Large ($15)</option>
        </select>
      </label>
      <p class="state">
        size: <strong>{size}</strong>,
        base: <strong>\${sizePrice[size]}</strong>
      </p>
    </section>

    <section>
      <h2>5. Multi select — <code>bind:value</code> with an array</h2>
      <p class="hint">
        <code>&lt;select multiple&gt;</code> binds to a
        <code>string[]</code>. Ctrl/Cmd-click to pick several.
      </p>
      <label>
        Languages you know
        <select multiple bind:value={languages} size="6">
          {#each allLanguages as lang (lang.id)}
            <option value={lang.id}>{lang.label}</option>
          {/each}
        </select>
      </label>
      <p class="state">
        Selected: <strong>{languages.join(', ') || 'none'}</strong>
      </p>
    </section>

    <section class="total-card">
      <h2>Your order</h2>
      <dl>
        <dt>Plan</dt><dd>{plan} ({planDetails[plan].price})</dd>
        <dt>Size</dt><dd>{size} (\${sizePrice[size]})</dd>
        <dt>Toppings</dt><dd>{toppings.length} &times; $1.50 = \${toppingPrice.toFixed(2)}</dd>
        <dt>Newsletter</dt><dd>{subscribed ? 'yes' : 'no'}</dd>
      </dl>
      <p class="total">Total: <strong>\${total.toFixed(2)}</strong></p>
    </section>
  </div>

  <section class="faq">
    <h2>6. <code>&lt;details&gt;</code> — <code>bind:open</code></h2>
    <div class="faq-actions">
      <button type="button" onclick={expandAll}>Expand all</button>
      <button type="button" onclick={collapseAll}>Collapse all</button>
      <span class="state">
        open: <strong>{faqOpen.filter(Boolean).length}/{faqOpen.length}</strong>
      </span>
    </div>
    {#each faqs as faq, i (faq.q)}
      <details bind:open={faqOpen[i]}>
        <summary>{faq.q}</summary>
        <p>{faq.a}</p>
      </details>
    {/each}
    <p class="hint">
      Clicking a <code>&lt;details&gt;</code> updates the array;
      clicking "Expand all" writes to the array and opens every
      one. Two-way binding in both directions.
    </p>
  </section>
</main>

<style>
  main {
    max-width: 880px;
    margin: 0 auto;
    padding: 1.25rem;
    font-family: system-ui, sans-serif;
    transition: background 0.2s, color 0.2s;
  }
  main.dark { background: #0f172a; color: #e2e8f0; }
  main.dark section { background: #1e293b; border-color: #334155; }
  main.dark .state, main.dark .hint { color: #94a3b8; }
  main.dark select { background: #0f172a; color: #e2e8f0; border-color: #475569; }
  h1 { margin-top: 0; }
  .lede { color: #555; }
  main.dark .lede { color: #94a3b8; }
  .theme-toggle {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.5rem 0.75rem; margin-bottom: 1rem;
    border: 1px solid #e5e7eb; border-radius: 6px; background: #fff;
    cursor: pointer;
  }
  main.dark .theme-toggle { background: #1e293b; border-color: #334155; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }
  section {
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
  }
  h2 { margin: 0 0 0.6rem; font-size: 1rem; }
  label { display: block; margin: 0.35rem 0; cursor: pointer; font-size: 0.9rem; }
  select { width: 100%; padding: 0.4rem; font-size: 0.9rem; margin-top: 0.2rem; }
  .state { font-size: 0.85rem; color: #4b5563; margin-top: 0.5rem; }
  .hint { font-size: 0.78rem; color: #6b7280; margin: 0.25rem 0 0.5rem; }
  button {
    padding: 0.4rem 0.8rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 0.85rem;
    margin-right: 0.4rem;
  }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .radios { display: flex; flex-direction: column; gap: 0.4rem; }
  .radios label {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.5rem 0.6rem; border: 1px solid #e5e7eb;
    border-radius: 4px; transition: all 0.15s;
  }
  .radios label.active { border-color: #6690ff; background: #eff6ff; }
  main.dark .radios label.active { background: #1e3a8a; }
  .plan-name { text-transform: capitalize; font-weight: 600; flex: 1; }
  .plan-price { color: #6b7280; font-size: 0.85rem; }
  .perks { margin: 0.5rem 0 0; padding-left: 1.1rem; font-size: 0.85rem; }
  .toppings {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.2rem;
  }
  .topping-actions { margin-top: 0.4rem; }
  .total-card { background: #f0fdf4; border-color: #86efac; }
  main.dark .total-card { background: #14532d; border-color: #166534; }
  dl { display: grid; grid-template-columns: auto 1fr; gap: 0.2rem 0.75rem; font-size: 0.85rem; margin: 0.5rem 0; }
  dt { font-weight: 600; color: #4b5563; }
  main.dark dt { color: #cbd5e1; }
  .total { font-size: 1.1rem; margin-top: 0.5rem; }
  .faq { margin-top: 1rem; }
  .faq-actions { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
  details {
    border: 1px solid #e5e7eb; border-radius: 6px;
    padding: 0.6rem 0.8rem; margin-bottom: 0.4rem; background: #fff;
  }
  main.dark details { background: #1e293b; border-color: #334155; }
  details[open] { border-color: #6690ff; background: #eff6ff; }
  main.dark details[open] { background: #1e3a8a; }
  summary { cursor: pointer; font-weight: 500; }
  details p { margin: 0.5rem 0 0; font-size: 0.88rem; }
  code {
    background: #f3f4f6;
    padding: 0 0.25rem;
    border-radius: 3px;
    font-size: 0.85em;
  }
  main.dark code { background: #334155; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
