import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '13-5',
		title: 'Redirects & Post-Action Loading',
		phase: 4,
		module: 13,
		lessonIndex: 5
	},
	description: `After a form action succeeds — like creating a new post or logging in — you usually want to redirect the user to a different page. SvelteKit's redirect() function sends a 303 redirect response, implementing the Post-Redirect-Get (PRG) pattern. This prevents the "resubmit form?" dialog when refreshing and keeps your URL history clean.

This lesson covers redirecting after actions, the PRG pattern, and how SvelteKit re-runs load functions after form submissions to keep data fresh.`,
	objectives: [
		'Use redirect() after successful form actions',
		'Understand the Post-Redirect-Get (PRG) pattern and why it matters',
		'Know how SvelteKit invalidates and re-runs load functions after actions',
		'Handle different redirect scenarios (login, create, delete)'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let currentPage: string = $state('form');
  let actionLog: string[] = $state([]);

  function addLog(msg: string) {
    actionLog = [...actionLog, msg];
  }

  function simulateCreatePost() {
    addLog('1. Form submitted to ?/create');
    addLog('2. Action validates data');
    addLog('3. Action saves to database');
    addLog('4. redirect(303, "/blog/new-post")');
    addLog('5. Browser follows redirect');
    addLog('6. /blog/new-post load() runs');
    addLog('7. New page renders');
    currentPage = 'result';
  }

  function reset() {
    actionLog = [];
    currentPage = 'form';
  }
</script>

<main>
  <h1>Redirects & Post-Action Loading</h1>

  <section>
    <h2>redirect() in Actions</h2>
    <pre>{\`// +page.server.ts
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const title = data.get('title') as string;

    if (!title) {
      return fail(400, { error: 'Title required' });
    }

    const post = await db.posts.create({
      data: { title }
    });

    // 303 = "See Other" — the correct status for PRG
    redirect(303, '/blog/' + post.slug);
  },

  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const user = await authenticate(data);

    if (!user) {
      return fail(401, { error: 'Invalid credentials' });
    }

    cookies.set('session', user.sessionId, { path: '/' });
    redirect(303, '/dashboard');
  },

  delete: async ({ params }) => {
    await db.posts.delete({ where: { id: params.id } });
    redirect(303, '/blog');  // back to listing
  }
};\`}</pre>
  </section>

  <section>
    <h2>Post-Redirect-Get (PRG) Pattern</h2>
    <div class="prg-flow">
      <div class="step">
        <div class="step-num">1</div>
        <div>
          <strong>POST</strong>
          <p>Form submits data to server</p>
        </div>
      </div>
      <div class="arrow">→</div>
      <div class="step">
        <div class="step-num">2</div>
        <div>
          <strong>Redirect (303)</strong>
          <p>Server sends redirect response</p>
        </div>
      </div>
      <div class="arrow">→</div>
      <div class="step">
        <div class="step-num">3</div>
        <div>
          <strong>GET</strong>
          <p>Browser loads the new page</p>
        </div>
      </div>
    </div>
    <p><em>Without PRG: refreshing the page would resubmit the form. With PRG: refreshing just reloads the destination page.</em></p>
  </section>

  <section>
    <h2>Simulated Flow</h2>
    {#if currentPage === 'form'}
      <button onclick={simulateCreatePost}>Submit "Create Post" Form</button>
    {:else}
      <button onclick={reset}>Reset Demo</button>
    {/if}

    {#if actionLog.length > 0}
      <div class="log">
        {#each actionLog as entry}
          <div class="log-entry">{entry}</div>
        {/each}
      </div>
    {/if}
  </section>

  <section>
    <h2>After Actions: Load Invalidation</h2>
    <pre>{\`// After a form action completes (without redirect),
// SvelteKit automatically re-runs load functions
// so your page data stays fresh.

// +page.server.ts
export const load: PageServerLoad = async () => {
  const posts = await db.posts.findMany();
  return { posts };  // re-fetched after action
};

export const actions: Actions = {
  like: async ({ request }) => {
    const data = await request.formData();
    const postId = data.get('postId');
    await db.posts.incrementLikes(postId);
    // No redirect — stays on same page
    // load() re-runs, page shows updated like count
    return { liked: true };
  }
};

// You can also manually invalidate:
// import { invalidateAll } from '$app/navigation';
// await invalidateAll();\`}</pre>
  </section>
</main>

<style>
  main { max-width: 650px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  .prg-flow { display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0; flex-wrap: wrap; }
  .step { display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.75rem; background: #f0f7ff; border-radius: 4px; border: 1px solid #bbdefb; flex: 1; min-width: 120px; }
  .step-num { background: #4a90d9; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; flex-shrink: 0; }
  .step p { margin: 0.25rem 0 0; font-size: 0.85rem; color: #555; }
  .arrow { font-size: 1.5rem; color: #4a90d9; }
  .log { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 4px; font-family: monospace; font-size: 0.85rem; margin-top: 0.5rem; }
  .log-entry { padding: 0.15rem 0; }
  button { padding: 0.5rem 1rem; cursor: pointer; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
