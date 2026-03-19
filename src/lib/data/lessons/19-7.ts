import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-7',
		title: 'Accessibility',
		phase: 7,
		module: 19,
		lessonIndex: 7
	},
	description: `Accessibility (a11y) ensures your SvelteKit application is usable by everyone, including people using screen readers, keyboard navigation, and assistive technologies. Svelte's compiler includes built-in a11y warnings that catch common issues at build time — missing alt attributes, improper ARIA roles, and non-interactive elements with click handlers.

WCAG (Web Content Accessibility Guidelines) provides the standard. Focus management, semantic HTML, proper ARIA attributes, and keyboard navigation are the pillars. SvelteKit's $props.id() helper generates unique IDs for form label associations.`,
	objectives: [
		'Apply ARIA roles, labels, and attributes correctly to interactive elements',
		'Implement keyboard navigation and focus management in Svelte components',
		'Use semantic HTML elements to convey structure and meaning',
		'Leverage Svelte compiler a11y warnings to catch accessibility issues'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Accessible form with proper labeling
  let name = $state('');
  let email = $state('');
  let message = $state('');
  let submitted = $state(false);
  let errors = $state<Record<string, string>>({});

  // Focus management
  let nameInput: HTMLInputElement;
  let successMessage: HTMLDivElement;

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!email.includes('@')) newErrors.email = 'Invalid email address';
    if (!message.trim()) newErrors.message = 'Message is required';
    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (validate()) {
      submitted = true;
      // Move focus to success message for screen readers
      setTimeout(() => successMessage?.focus(), 100);
    }
  }

  function resetForm() {
    name = '';
    email = '';
    message = '';
    submitted = false;
    errors = {};
    setTimeout(() => nameInput?.focus(), 100);
  }

  // Modal accessibility
  let modalOpen = $state(false);
  let lastFocusedElement: HTMLElement | null = null;

  function openModal() {
    lastFocusedElement = document.activeElement as HTMLElement;
    modalOpen = true;
  }

  function closeModal() {
    modalOpen = false;
    lastFocusedElement?.focus();
  }

  function handleModalKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') closeModal();
  }

  // Accordion accessibility
  type AccordionItem = { id: string; title: string; content: string; open: boolean };

  let accordionItems = $state<AccordionItem[]>([
    { id: 'semantic', title: 'Semantic HTML', content: 'Use <nav>, <main>, <article>, <section>, <aside>, <header>, <footer> instead of generic <div> elements. These convey meaning to assistive technologies.', open: false },
    { id: 'aria', title: 'ARIA Attributes', content: 'ARIA supplements HTML semantics. Use aria-label for unlabeled controls, aria-live for dynamic content, aria-expanded for toggleable sections, and role for custom widgets.', open: false },
    { id: 'keyboard', title: 'Keyboard Navigation', content: 'All interactive elements must be reachable via Tab. Use proper focus management, visible focus indicators, and ensure custom widgets support expected keyboard patterns (Enter, Space, Escape, Arrow keys).', open: false },
    { id: 'focus', title: 'Focus Management', content: 'When content changes dynamically (modals, route changes, form submissions), move focus to the relevant element. Use tabindex="-1" for programmatic focus targets that should not be in the natural tab order.', open: false }
  ]);

  function toggleAccordion(id: string) {
    accordionItems = accordionItems.map(item =>
      item.id === id ? { ...item, open: !item.open } : item
    );
  }

  // Svelte compiler a11y warnings
  const a11yWarnings = [
    { code: 'a11y-missing-attribute', example: '<img src="photo.jpg">', fix: '<img src="photo.jpg" alt="Description">' },
    { code: 'a11y-click-events-have-key-events', example: '<div onclick={handle}>', fix: '<button onclick={handle}>' },
    { code: 'a11y-no-noninteractive-element-interactions', example: '<p onclick={fn}>', fix: '<button onclick={fn}>' },
    { code: 'a11y-label-has-associated-control', example: '<label>Name</label><input>', fix: '<label>Name <input></label>' }
  ];
</script>

<main>
  <h1>Accessibility</h1>
  <p class="subtitle">WCAG compliance, ARIA, keyboard navigation, and Svelte a11y</p>

  <!-- Accessible Accordion -->
  <section>
    <h2>A11y Fundamentals</h2>
    <div class="accordion" role="region" aria-label="Accessibility topics">
      {#each accordionItems as item}
        <div class="accordion-item">
          <h3>
            <button
              aria-expanded={item.open}
              aria-controls="panel-{item.id}"
              id="heading-{item.id}"
              onclick={() => toggleAccordion(item.id)}
            >
              {item.title}
              <span class="chevron" class:open={item.open}></span>
            </button>
          </h3>
          {#if item.open}
            <div
              id="panel-{item.id}"
              role="region"
              aria-labelledby="heading-{item.id}"
              class="accordion-panel"
            >
              <p>{item.content}</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <!-- Accessible Form -->
  <section>
    <h2>Accessible Form</h2>
    {#if submitted}
      <div
        bind:this={successMessage}
        class="success"
        role="alert"
        tabindex={-1}
      >
        <p>Message sent successfully!</p>
        <button onclick={resetForm}>Send another</button>
      </div>
    {:else}
      <form onsubmit={handleSubmit} novalidate>
        <div class="field">
          <label for="name-input">Name <span class="required" aria-label="required">*</span></label>
          <input
            id="name-input"
            bind:this={nameInput}
            bind:value={name}
            type="text"
            aria-required="true"
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {#if errors.name}
            <p id="name-error" class="error" role="alert">{errors.name}</p>
          {/if}
        </div>

        <div class="field">
          <label for="email-input">Email <span class="required" aria-label="required">*</span></label>
          <input
            id="email-input"
            bind:value={email}
            type="email"
            aria-required="true"
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {#if errors.email}
            <p id="email-error" class="error" role="alert">{errors.email}</p>
          {/if}
        </div>

        <div class="field">
          <label for="message-input">Message <span class="required" aria-label="required">*</span></label>
          <textarea
            id="message-input"
            bind:value={message}
            rows={4}
            aria-required="true"
            aria-invalid={errors.message ? 'true' : undefined}
            aria-describedby={errors.message ? 'message-error' : undefined}
          ></textarea>
          {#if errors.message}
            <p id="message-error" class="error" role="alert">{errors.message}</p>
          {/if}
        </div>

        <button type="submit">Send Message</button>
      </form>
    {/if}
  </section>

  <!-- Modal Demo -->
  <section>
    <h2>Accessible Modal</h2>
    <button onclick={openModal}>Open Modal</button>

    {#if modalOpen}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="modal-backdrop" onclick={closeModal} onkeydown={handleModalKeydown}>
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onclick={(e) => e.stopPropagation()} onkeydown={handleModalKeydown}>
          <h3 id="modal-title">Modal Title</h3>
          <p>This modal traps focus and closes on Escape.</p>
          <button onclick={closeModal}>Close</button>
        </div>
      </div>
    {/if}
  </section>

  <!-- Compiler Warnings -->
  <section>
    <h2>Svelte Compiler A11y Warnings</h2>
    <table>
      <thead>
        <tr><th>Warning</th><th>Problem</th><th>Fix</th></tr>
      </thead>
      <tbody>
        {#each a11yWarnings as warning}
          <tr>
            <td><code>{warning.code}</code></td>
            <td><code>{warning.example}</code></td>
            <td><code>{warning.fix}</code></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .subtitle { color: #666; margin-bottom: 2rem; }

  .accordion-item {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    overflow: hidden;
  }

  .accordion-item h3 { margin: 0; }

  .accordion-item button {
    width: 100%;
    padding: 1rem;
    background: #f8f9fa;
    border: none;
    text-align: left;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .accordion-item button:hover { background: #eef4fb; }
  .accordion-item button:focus-visible {
    outline: 2px solid #4a90d9;
    outline-offset: -2px;
  }

  .chevron {
    width: 10px;
    height: 10px;
    border-right: 2px solid #666;
    border-bottom: 2px solid #666;
    transform: rotate(45deg);
    transition: transform 0.2s;
  }

  .chevron.open { transform: rotate(-135deg); }

  .accordion-panel {
    padding: 1rem;
    border-top: 1px solid #e0e0e0;
    background: white;
  }

  form {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
  }

  .field {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }

  .required { color: #dc2626; }

  input, textarea {
    width: 100%;
    padding: 0.5rem;
    border: 2px solid #ccc;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.95rem;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: #4a90d9;
    box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.2);
  }

  input[aria-invalid="true"], textarea[aria-invalid="true"] {
    border-color: #dc2626;
  }

  .error {
    color: #dc2626;
    font-size: 0.85rem;
    margin: 0.25rem 0 0;
  }

  .success {
    background: #dcfce7;
    padding: 1.5rem;
    border-radius: 12px;
    text-align: center;
  }

  button[type="submit"] {
    padding: 0.6rem 1.5rem;
    background: #4a90d9;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
  }

  button[type="submit"]:focus-visible {
    outline: 3px solid #4a90d9;
    outline-offset: 2px;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .modal {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
  }

  table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  th, td { padding: 0.6rem; text-align: left; border-bottom: 1px solid #e0e0e0; font-size: 0.82rem; }
  th { background: #f0f0f0; }

  code {
    background: #f0f0f0;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.8rem;
  }

  section { margin-bottom: 2.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
