import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '12-8',
		title: 'Universal vs Server: The Decision',
		phase: 4,
		module: 12,
		lessonIndex: 8
	},
	description: `Choosing between universal load (+page.ts) and server load (+page.server.ts) is a common decision in SvelteKit. Universal load runs on both server and client, making it faster for client-side navigation since it can call APIs directly from the browser. Server load runs only on the server, providing access to databases, secrets, and other server-only resources.

This lesson provides a decision framework to help you choose the right approach for each situation.`,
	objectives: [
		'Compare universal and server load function capabilities',
		'Understand the serialization boundary and its implications',
		'Apply a decision framework to choose the right load type',
		'Know how to combine both load types when needed'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  interface Scenario {
    title: string;
    description: string;
    recommendation: 'universal' | 'server';
    reason: string;
  }

  const scenarios: Scenario[] = [
    {
      title: 'Fetching from a public API',
      description: 'Loading posts from a public REST API with no authentication',
      recommendation: 'universal',
      reason: 'No secrets needed. Universal load can fetch directly from the browser during client navigation, skipping your server.'
    },
    {
      title: 'Database queries',
      description: 'Loading user data from PostgreSQL/MongoDB',
      recommendation: 'server',
      reason: 'Database connections must stay on the server. DB credentials must never reach the browser.'
    },
    {
      title: 'Authenticated API calls',
      description: 'Fetching user-specific data from an API using a secret key',
      recommendation: 'server',
      reason: 'API keys and secrets must stay server-side. Use server load to add auth headers.'
    },
    {
      title: 'Static content transformation',
      description: 'Loading and transforming markdown files into HTML',
      recommendation: 'universal',
      reason: 'No server-only resources needed. Universal load lets the transformation happen on either side.'
    },
    {
      title: 'Reading cookies/sessions',
      description: 'Checking if a user is logged in via cookies',
      recommendation: 'server',
      reason: 'The cookies object is only available in server load. HTTPOnly cookies are inaccessible in the browser.'
    },
    {
      title: 'Returning component instances',
      description: 'Choosing which Svelte component to render based on data',
      recommendation: 'universal',
      reason: 'Server load can only return serializable data. Components, functions, and classes require universal load.'
    }
  ];

  let selectedScenario: number = $state(0);
</script>

<main>
  <h1>Universal vs Server: The Decision</h1>

  <section>
    <h2>Side-by-Side Comparison</h2>
    <table>
      <thead>
        <tr><th></th><th>+page.ts (Universal)</th><th>+page.server.ts (Server)</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Runs on</strong></td>
          <td>Server (SSR) + Browser</td>
          <td>Server only</td>
        </tr>
        <tr>
          <td><strong>Can access</strong></td>
          <td>fetch, params, url</td>
          <td>fetch, params, url + cookies, locals, env, request</td>
        </tr>
        <tr>
          <td><strong>Can return</strong></td>
          <td>Anything (functions, components, classes)</td>
          <td>Serializable data only (JSON-safe)</td>
        </tr>
        <tr>
          <td><strong>Client navigation</strong></td>
          <td>Runs in browser (fast, no server round-trip)</td>
          <td>Calls server via internal fetch</td>
        </tr>
        <tr>
          <td><strong>Best for</strong></td>
          <td>Public APIs, non-sensitive data</td>
          <td>Databases, secrets, auth</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>Decision Scenarios</h2>
    <div class="scenarios">
      {#each scenarios as scenario, i}
        <button
          class:active={selectedScenario === i}
          onclick={() => selectedScenario = i}
        >
          {scenario.title}
        </button>
      {/each}
    </div>

    {#each scenarios as scenario, i}
      {#if selectedScenario === i}
        <div class="scenario-detail" class:universal={scenario.recommendation === 'universal'} class:server={scenario.recommendation === 'server'}>
          <h3>{scenario.title}</h3>
          <p>{scenario.description}</p>
          <p class="recommendation">
            Use: <strong>+page.{scenario.recommendation === 'server' ? 'server.' : ''}ts</strong>
          </p>
          <p class="reason">{scenario.reason}</p>
        </div>
      {/if}
    {/each}
  </section>

  <section>
    <h2>Combining Both</h2>
    <pre>{\`// You can use BOTH for the same route!

// +page.server.ts — loads sensitive data
export const load: PageServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');
  const user = await db.users.find(session);
  return { user }; // serialized to client
};

// +page.ts — adds non-serializable data
export const load: PageLoad = async ({ data }) => {
  // 'data' contains what +page.server.ts returned
  return {
    ...data,
    // Add things server load can't return:
    formatDate: (d: string) => new Date(d).toLocaleDateString(),
    Component: data.user.role === 'admin' ? AdminPanel : UserPanel
  };
};\`}</pre>
  </section>

  <section>
    <h2>Quick Decision</h2>
    <div class="decision-tree">
      <p>Do you need <strong>cookies, database, or secrets</strong>?</p>
      <p class="answer yes">YES → <code>+page.server.ts</code></p>
      <p class="answer no">NO → Do you need to return <strong>functions or components</strong>?</p>
      <p class="answer yes" style="margin-left: 2rem;">YES → <code>+page.ts</code></p>
      <p class="answer no" style="margin-left: 2rem;">NO → Either works! <code>+page.ts</code> is slightly faster for client nav.</p>
    </div>
  </section>
</main>

<style>
  main { max-width: 700px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; }
  th { background: #f5f5f5; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; }
  .scenarios { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  .scenarios button { padding: 0.4rem 0.75rem; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: white; font-size: 0.85rem; }
  .scenarios button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  .scenario-detail { padding: 1rem; border-radius: 4px; }
  .scenario-detail.universal { background: #e8f5e9; border: 1px solid #4caf50; }
  .scenario-detail.server { background: #e3f2fd; border: 1px solid #2196f3; }
  .recommendation { font-size: 1.1rem; }
  .reason { font-style: italic; color: #555; }
  .decision-tree { background: #f9f9f9; padding: 1rem; border-radius: 4px; }
  .answer { margin-left: 1rem; }
  .answer.yes { color: #2e7d32; }
  .answer.no { color: #1565c0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
