import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '13-5',
		title: 'Redirects & Post-Action Loading',
		phase: 4,
		module: 13,
		lessonIndex: 5
	},
	description: `After a successful mutation you rarely want the user to sit on the form page — you want to send them somewhere (a detail page, a dashboard, a list). And you want the data that appears there to be fresh, not the pre-mutation cache.

SvelteKit gives you redirect(303, '/somewhere') to bounce the user after a successful action. Why 303 specifically? Because it forces the browser to follow with a GET — the classic Post/Redirect/Get pattern that has prevented accidental double-submits since the 1990s. And for the cases where you stay on the same page, invalidate() / invalidateAll() re-run load functions so the page reflects the mutation.

This lesson ties modules 12 and 13 together: actions mutate, redirects and invalidation refresh, and the user sees correct data.`,
	objectives: [
		'Use redirect(303, url) inside an action to follow the POST/Redirect/GET pattern',
		'Know why 303 (and not 301/302) is the right status',
		'Trigger invalidateAll() after an in-place mutation to refresh load data',
		'Use invalidate(urlOrTag) for targeted refresh',
		'Choose between redirect, invalidate, and neither',
		'Preserve form state (flash messages) across redirects'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ---------------------------------------------------------------
  // This playground simulates a two-page app with a list and a
  // "new item" form. In real SvelteKit:
  //   • /items          has a +page.server.ts load() that lists items
  //   • /items/new      has an action that creates one
  //
  // After success the action runs:
  //     throw redirect(303, '/items');
  //
  // The browser follows with a GET /items, which re-runs load() —
  // and the new item is there. Classic PRG.
  // ---------------------------------------------------------------

  interface Item {
    id: number;
    title: string;
  }

  type Page = 'list' | 'new';

  let page: Page = $state('list');
  let items: Item[] = $state([
    { id: 1, title: 'Buy milk' },
    { id: 2, title: 'Write lesson 13-5' }
  ]);
  let nextId: number = $state(3);
  let draft: string = $state('');
  let flash: string = $state('');

  // Simulated action: create an item, then "redirect" by flipping
  // the page and setting a flash message.
  async function submitNew(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const title = (data.get('title') ?? '').toString().trim();
    if (!title) return;

    // Pretend server work
    await new Promise((r) => setTimeout(r, 300));
    items = [...items, { id: nextId, title }];
    nextId++;
    draft = '';

    // 303 See Other → GET /items
    flash = 'Created "' + title + '"';
    page = 'list';
  }

  // In-place mutation: delete an item and "invalidate" the list.
  // In real SvelteKit this would be an action + invalidateAll().
  async function deleteItem(id: number): Promise<void> {
    await new Promise((r) => setTimeout(r, 150));
    items = items.filter((i) => i.id !== id);
    flash = 'Deleted item #' + id;
  }

  function dismissFlash(): void {
    flash = '';
  }
</script>

<main>
  <h1>Redirects & Post-Action Loading</h1>

  <section>
    <h2>1. redirect(303) — Post/Redirect/Get</h2>
    <pre>{\`// src/routes/items/new/+page.server.ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const title = data.get('title')?.toString().trim();

    if (!title) return fail(400, { error: 'Title required' });

    const item = await db.item.create({ data: { title } });

    // 303 See Other — tells the browser to follow with a GET.
    // This prevents F5 from re-submitting the form.
    throw redirect(303, '/items/' + item.id);
  }
};\`}</pre>
    <div class="callout">
      <strong>Why 303?</strong><br />
      301 / 302 historically preserved the HTTP method on redirect, so a POST would
      re-POST — exactly what you don't want after a mutation. 303 was added
      specifically to say "I got your POST, now GET this URL". Always 303 after an action.
    </div>
  </section>

  <section>
    <h2>2. invalidate() — staying put but refreshing data</h2>
    <pre>{\`// When you don't want to redirect, but DO want the page's
// load data to reflect the mutation:
import { enhance } from '$app/forms';
import { invalidateAll, invalidate } from '$app/navigation';

<form method="POST" action="?/toggle" use:enhance={() => {
  return async ({ update }) => {
    await update();         // default: invalidates everything anyway
  };
}}>

// For surgical refresh — only re-run loads that depend on a tag:
await invalidate('app:todos');

// Or a specific URL — re-runs loads that fetched it:
await invalidate('/api/items');

// Nuclear option — re-run every load on the current page:
await invalidateAll();\`}</pre>
  </section>

  <section>
    <h2>3. redirect vs invalidate vs nothing</h2>
    <table>
      <thead>
        <tr><th>Situation</th><th>Use</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Created a new resource, user should see its detail page</td>
          <td><code>redirect(303, '/items/' + id)</code></td>
        </tr>
        <tr>
          <td>Login succeeded, go back to the dashboard</td>
          <td><code>redirect(303, '/dashboard')</code></td>
        </tr>
        <tr>
          <td>Toggled a "like" — stay on the page, refresh counts</td>
          <td><code>invalidate('app:likes')</code> (or let <code>update()</code> do it)</td>
        </tr>
        <tr>
          <td>Deleted an item in a list — stay on the list, refresh it</td>
          <td><code>invalidateAll()</code> or <code>invalidate('/api/items')</code></td>
        </tr>
        <tr>
          <td>Pure client-side UI change (expand/collapse)</td>
          <td>Nothing — don't use an action at all</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>4. Live Demo — Create with Redirect</h2>
    <p class="hint">
      Navigate to the "new" page, submit, and watch yourself land back on the list
      with the new item and a flash message.
    </p>

    <div class="app-shell">
      <nav class="app-nav">
        <button class:active={page === 'list'} onclick={() => (page = 'list')}>Items</button>
        <button class:active={page === 'new'} onclick={() => (page = 'new')}>+ New</button>
      </nav>

      {#if flash}
        <div class="flash">
          {flash}
          <button class="flash-close" onclick={dismissFlash}>×</button>
        </div>
      {/if}

      {#if page === 'list'}
        <div class="page">
          <h3>Items</h3>
          {#if items.length === 0}
            <p class="muted">No items yet.</p>
          {:else}
            <ul>
              {#each items as item (item.id)}
                <li>
                  <span>{item.title}</span>
                  <button class="link" onclick={() => deleteItem(item.id)}>
                    delete
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {:else}
        <div class="page">
          <h3>New item</h3>
          <form onsubmit={submitNew} class="new-form">
            <label>
              Title
              <input name="title" bind:value={draft} placeholder="e.g. Buy coffee" />
            </label>
            <button>Create</button>
          </form>
        </div>
      {/if}
    </div>
  </section>

  <section>
    <h2>5. Flash Messages Across Redirects</h2>
    <p class="hint">
      After a redirect, the original action's return value is gone — the browser
      has GET'd a new page. To keep a "just saved!" message, use a flash cookie or
      the community library <code>sveltekit-flash-message</code>.
    </p>
    <pre>{\`// Without a library — quick DIY with a short-lived cookie
import { redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, cookies }) => {
    // ...create the item...
    cookies.set('flash', 'Item created!', {
      path: '/',
      maxAge: 5,          // 5 seconds
      httpOnly: false     // readable from the next page's load
    });
    throw redirect(303, '/items');
  }
};

// In the destination load():
export const load = ({ cookies }) => {
  const flash = cookies.get('flash');
  if (flash) cookies.delete('flash', { path: '/' });
  return { flash };
};\`}</pre>
  </section>
</main>

<style>
  main { max-width: 720px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  h2 { margin-top: 0; }
  .hint { color: #555; font-size: 0.9rem; margin: 0 0 0.75rem; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.82rem; }
  .callout { margin-top: 0.5rem; padding: 0.75rem 1rem; background: #fff3e0; border-left: 3px solid #ff9800; border-radius: 4px; font-size: 0.85rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; vertical-align: top; }
  th { background: #f5f5f5; }
  .app-shell { border: 1px solid #ccc; border-radius: 6px; background: white; overflow: hidden; }
  .app-nav { display: flex; background: #1565c0; }
  .app-nav button { flex: 1; padding: 0.6rem; background: transparent; border: none; color: #cfe2ff; cursor: pointer; font-weight: bold; }
  .app-nav button.active { background: rgba(255,255,255,0.15); color: white; }
  .flash { background: #e8f5e9; border-bottom: 1px solid #4caf50; padding: 0.6rem 0.8rem; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center; }
  .flash-close { background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #2e7d32; line-height: 1; padding: 0 0.4rem; }
  .page { padding: 1rem; }
  .page h3 { margin: 0 0 0.5rem; }
  .page ul { list-style: none; padding: 0; margin: 0; }
  .page li { display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; border-bottom: 1px solid #eee; font-size: 0.9rem; }
  .link { background: none; border: none; color: #c62828; cursor: pointer; text-decoration: underline; font-size: 0.8rem; }
  .muted { color: #888; font-style: italic; }
  .new-form { display: flex; flex-direction: column; gap: 0.6rem; }
  .new-form label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.85rem; }
  .new-form input { padding: 0.45rem; font-size: 0.9rem; border: 1px solid #bbb; border-radius: 3px; }
  .new-form button { align-self: flex-start; padding: 0.5rem 1rem; cursor: pointer; background: #1565c0; color: white; border: none; border-radius: 4px; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
