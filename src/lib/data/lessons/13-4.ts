import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '13-4',
		title: 'use:enhance',
		phase: 4,
		module: 13,
		lessonIndex: 4
	},
	description: `By default, SvelteKit form submissions cause a full page reload (like traditional HTML). The enhance action from $app/forms upgrades forms to use fetch instead — no page reload, automatic form prop updates, and smooth pending states. You can also pass a custom callback to control exactly what happens before and after submission.

This is progressive enhancement in action: the form works without JavaScript, but becomes better with it.`,
	objectives: [
		'Apply use:enhance to forms for JavaScript-powered submissions',
		'Understand what enhance does automatically (no reload, update form prop)',
		'Write custom enhance callbacks for loading states and validation',
		'Maintain progressive enhancement — forms still work without JS'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let submitting: boolean = $state(false);
  let formResult: string = $state('');
</script>

<main>
  <h1>use:enhance</h1>

  <section>
    <h2>Basic enhance</h2>
    <pre>{\`<!-- +page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
</script>

<!-- Just add use:enhance — that's it! -->
<form method="POST" use:enhance>
  <input name="email" type="email" required />
  <button>Subscribe</button>
</form>

<!-- What enhance does automatically:
  1. Prevents full page reload
  2. Submits via fetch instead
  3. Updates the form prop with the result
  4. Invalidates load functions (refreshes data)
  5. Handles redirects
  6. Resets the form on success
-->\`}</pre>
  </section>

  <section>
    <h2>Custom Callback</h2>
    <pre>{\`<script lang="ts">
  import { enhance } from '$app/forms';

  let submitting = $state(false);
</script>

<form
  method="POST"
  use:enhance={() => {
    // BEFORE submission
    submitting = true;

    // Return a callback for AFTER submission
    return async ({ result, update }) => {
      submitting = false;

      if (result.type === 'success') {
        // Custom success handling
        showToast('Saved!');
      }

      // Call update() to apply default behavior
      // (update form prop, invalidate, etc.)
      await update();

      // Or skip update() for full control:
      // await applyAction(result);
    };
  }}
>
  <input name="title" required />
  <button disabled={submitting}>
    {submitting ? 'Saving...' : 'Save'}
  </button>
</form>\`}</pre>
  </section>

  <section>
    <h2>Result Types</h2>
    <pre>{\`// The result object in enhance callback:
use:enhance={() => {
  return async ({ result }) => {
    switch (result.type) {
      case 'success':
        // Action returned data (no fail, no redirect)
        console.log(result.data);
        break;

      case 'failure':
        // Action called fail(400, {...})
        console.log(result.data); // error data
        console.log(result.status); // 400
        break;

      case 'redirect':
        // Action called redirect(303, '/somewhere')
        console.log(result.location); // '/somewhere'
        break;

      case 'error':
        // Action threw an unexpected error
        console.log(result.error);
        break;
    }
  };
}}\`}</pre>
  </section>

  <section>
    <h2>Common Patterns</h2>
    <pre>{\`<!-- Confirmation before delete -->
<form
  method="POST"
  action="?/delete"
  use:enhance={() => {
    if (!confirm('Are you sure?')) {
      // Return a cancel function to abort
      return ({ cancel }) => cancel();
    }
    // Proceed with submission
    return async ({ update }) => {
      await update();
    };
  }}
>
  <button>Delete</button>
</form>

<!-- Keep form values after error (don't reset) -->
<form
  method="POST"
  use:enhance={() => {
    return async ({ update }) => {
      // reset: false keeps input values on failure
      await update({ reset: false });
    };
  }}
>
  ...
</form>\`}</pre>
  </section>

  <section>
    <h2>Progressive Enhancement Summary</h2>
    <div class="comparison">
      <div class="col">
        <h3>Without JS</h3>
        <ul>
          <li>Form posts normally</li>
          <li>Full page reload</li>
          <li>Server handles everything</li>
          <li>Still works!</li>
        </ul>
      </div>
      <div class="col enhanced">
        <h3>With enhance</h3>
        <ul>
          <li>Fetch-based submission</li>
          <li>No page reload</li>
          <li>Loading indicators</li>
          <li>Smooth UX</li>
        </ul>
      </div>
    </div>
  </section>
</main>

<style>
  main { max-width: 650px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .col { padding: 0.75rem; border-radius: 4px; background: #f9f9f9; }
  .col.enhanced { background: #e8f5e9; }
  .col h3 { margin-top: 0; }
  .col ul { padding-left: 1.25rem; margin-bottom: 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
