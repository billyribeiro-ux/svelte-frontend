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

WCAG (Web Content Accessibility Guidelines) provides the standard. Focus management, semantic HTML, proper ARIA attributes, and keyboard navigation are the pillars. SvelteKit's $props.id() helper generates unique IDs for form label associations.

For media-heavy apps, the svelte-audio-ui community library is a reference example of accessible, composable component design — players, waveforms, and volume sliders that ship with keyboard controls, ARIA wiring, and focus management out of the box. Worth studying even if you don't use it directly.`,
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
  let nameInput = $state<HTMLInputElement | undefined>();
  let successMessage = $state<HTMLDivElement | undefined>();

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

  // Focus trap for modal — capture all tabbable descendants
  let modalEl: HTMLDivElement | undefined = $state();
  function trapFocus(e: KeyboardEvent) {
    if (e.key !== 'Tab' || !modalEl) return;
    const tabbable = modalEl.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (tabbable.length === 0) return;
    const first = tabbable[0];
    const last = tabbable[tabbable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  }

  // WCAG contrast ratio checker
  let fgColor = $state('#111111');
  let bgColor = $state('#ffffff');

  function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  function luminance(rgb: [number, number, number]): number {
    const [r, g, b] = rgb.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  let contrastRatio = $derived.by(() => {
    try {
      const l1 = luminance(hexToRgb(fgColor));
      const l2 = luminance(hexToRgb(bgColor));
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    } catch {
      return 1;
    }
  });

  let contrastGrade = $derived(
    contrastRatio >= 7 ? 'AAA' : contrastRatio >= 4.5 ? 'AA' : contrastRatio >= 3 ? 'AA Large' : 'Fail'
  );

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
      {#each accordionItems as item (item.id)}
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
        tabindex="-1"
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
        <div
          bind:this={modalEl}
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabindex="-1"
          onclick={(e) => e.stopPropagation()}
          onkeydown={(e) => { handleModalKeydown(e); trapFocus(e); }}
        >
          <h3 id="modal-title">Modal Title</h3>
          <p>This modal traps Tab focus and closes on Escape.</p>
          <div class="modal-actions">
            <button onclick={closeModal}>Cancel</button>
            <button class="primary" onclick={closeModal}>Confirm</button>
          </div>
        </div>
      </div>
    {/if}
  </section>

  <!-- WCAG Contrast Checker -->
  <section>
    <h2>WCAG Contrast Checker</h2>
    <p>WCAG AA requires 4.5:1 for normal text; AAA raises the bar to 7:1.</p>
    <div class="contrast">
      <div class="contrast-controls">
        <label>Foreground <input type="color" bind:value={fgColor} /></label>
        <label>Background <input type="color" bind:value={bgColor} /></label>
      </div>
      <div class="contrast-preview" style="background: {bgColor}; color: {fgColor};">
        <h3>Sample heading</h3>
        <p>The quick brown fox jumps over the lazy dog.</p>
      </div>
      <div class="contrast-result">
        <span class="ratio">{contrastRatio.toFixed(2)}:1</span>
        <span class="grade grade-{contrastGrade.split(' ')[0].toLowerCase()}">{contrastGrade}</span>
      </div>
    </div>
  </section>

  <!-- Compiler Warnings -->
  <section>
    <h2>Svelte Compiler A11y Warnings</h2>
    <table>
      <thead>
        <tr><th>Warning</th><th>Problem</th><th>Fix</th></tr>
      </thead>
      <tbody>
        {#each a11yWarnings as warning (warning.code)}
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

  .modal-actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; }
  .modal-actions button {
    padding: 0.45rem 1rem;
    border: 1px solid #ccc;
    background: #f8f9fa;
    border-radius: 6px;
    cursor: pointer;
  }
  .modal-actions .primary { background: #4a90d9; color: white; border-color: #4a90d9; }

  .contrast {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  @media (max-width: 700px) { .contrast { grid-template-columns: 1fr; } }
  .contrast-controls { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem; }
  .contrast-controls input { width: 64px; height: 34px; border: 1px solid #ccc; border-radius: 6px; }
  .contrast-preview {
    padding: 1rem;
    border-radius: 8px;
    grid-row: 1 / 3;
    grid-column: 2;
  }
  .contrast-preview h3 { margin: 0 0 0.5rem; }
  .contrast-preview p { margin: 0; }
  .contrast-result {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-family: monospace;
  }
  .ratio { font-size: 1.4rem; font-weight: 700; }
  .grade { padding: 0.3rem 0.7rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; }
  .grade-aaa { background: #dcfce7; color: #166534; }
  .grade-aa { background: #dbeafe; color: #1e40af; }
  .grade-fail { background: #fee2e2; color: #991b1b; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
