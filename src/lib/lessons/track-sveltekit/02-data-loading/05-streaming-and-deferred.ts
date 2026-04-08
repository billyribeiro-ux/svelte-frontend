import type { Lesson } from '$types/lesson';

export const streamingAndDeferred: Lesson = {
	id: 'sveltekit.data-loading.streaming-and-deferred',
	slug: 'streaming-and-deferred',
	title: 'Streaming & Deferred Loading',
	description:
		'Use SvelteKit\'s deferred loading to stream slow data progressively, so fast content renders immediately while slower API calls resolve in the background.',
	trackId: 'sveltekit',
	moduleId: 'data-loading',
	order: 5,
	estimatedMinutes: 20,
	concepts: ['sveltekit.load.deferred', 'sveltekit.load.streaming', 'sveltekit.load.await'],
	prerequisites: ['sveltekit.load.server', 'sveltekit.load.universal'],

	content: [
		{
			type: 'text',
			content: `# Streaming & Deferred Loading

Consider a product page that needs to show:
1. **Product details** — fast, comes from an in-memory cache (10ms)
2. **Reviews** — slow, queried from a separate reviews service (800ms)
3. **Recommendations** — very slow, ML-powered endpoint (1.5s)

If your \`load\` function awaits all three before rendering, the page is blank for 1.5 seconds. But the user could be reading the product details, viewing images, and making a decision while the slow data loads in the background.

SvelteKit solves this with **deferred/streamed data** — returning unresolved \`Promise\`s from your load function.

## How Deferred Loading Works

In a standard \`load\` function, you \`await\` everything:

\`\`\`ts
// ❌ Waits 1.5s before the page renders at all
export const load = async () => {
  const product     = await getProduct(id);       // 10ms
  const reviews     = await getReviews(id);       // 800ms
  const recommended = await getRecommended(id);   // 1500ms
  return { product, reviews, recommended };
};
\`\`\`

With deferred loading, you only await the fast data:

\`\`\`ts
// ✅ Page renders in ~10ms, slow data streams in later
export const load = async ({ params }) => {
  const product = await getProduct(params.id);  // await this — needed for initial render

  return {
    product,                           // immediately available
    reviews: getReviews(params.id),    // NOT awaited — returns a Promise
    recommended: getRecommended(params.id) // NOT awaited — returns a Promise
  };
};
\`\`\`

SvelteKit serialises the page with \`product\` available immediately, then streams the \`reviews\` and \`recommended\` Promises over the same HTTP connection as they resolve.

## Handling Promises in Templates

In your page component, deferred data arrives as Promises. Handle them with \`{#await}\`:

\`\`\`svelte
<script>
  let { data } = $props();
</script>

<!-- Immediately rendered (was awaited in load) -->
<h1>{data.product.name}</h1>
<p>{data.product.description}</p>

<!-- Streams in asynchronously -->
{#await data.reviews}
  <div class="skeleton">Loading reviews...</div>
{:then reviews}
  {#each reviews as review}
    <ReviewCard {review} />
  {/each}
{:catch error}
  <p class="error">Could not load reviews: {error.message}</p>
{/await}

{#await data.recommended}
  <div class="skeleton">Finding recommendations...</div>
{:then products}
  <RecommendedGrid {products} />
{:catch}
  <!-- Silently fail for recommendations -->
{/await}
\`\`\`

Each \`{#await}\` block independently shows its loading state, then transitions to the resolved content when its Promise settles. The user sees product details immediately, then reviews appear around 800ms, then recommendations around 1500ms.

## Error Handling in Deferred Data

If a deferred Promise rejects, the \`{:catch}\` branch renders. Unlike top-level load errors (which trigger error pages), deferred Promise rejections are handled inline. This is deliberate: a failed reviews load should not kill the entire product page.

\`\`\`svelte
{#await data.reviews}
  <Skeleton lines={3} />
{:then reviews}
  <ReviewList {reviews} />
{:catch error}
  <Alert type="warning">
    Reviews are temporarily unavailable. {error.message}
  </Alert>
{/await}
\`\`\`

## Using \`$derived\` with Streaming Data

In Svelte 5, you can combine deferred data with \`$derived\` by awaiting inside the derived:

\`\`\`svelte
<script>
  let { data } = $props();
  
  // data.reviews is a Promise — derive from it using async $derived
  let reviewStats = $derived.by(async () => {
    const reviews = await data.reviews;
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    return { count: reviews.length, average: avg.toFixed(1) };
  });
</script>
\`\`\`

## When to Use Deferred vs Parallel Fetching

Deferred streaming is different from **parallel \`await\`**:

\`\`\`ts
// ✅ Parallel awaiting — starts both at the same time, waits for slower
const [fast, slow] = await Promise.all([getFast(), getSlow()]);
// Page still waits for getSlow() to render

// ✅ Deferred — page renders with fast data immediately
const fast = await getFast();
return { fast, slow: getSlow() }; // getSlow() runs in background
\`\`\`

Use **parallel \`Promise.all\`** when you need all data for the initial render but want to minimise total wait time.

Use **deferred Promises** when some data is optional or secondary — the page is useful without it, and you want the fastest possible first render.

## SvelteKit's Streaming Mechanism

Under the hood, SvelteKit uses **HTTP streaming** (chunked transfer encoding). The server sends the initial HTML as soon as the awaited data is ready, then pushes additional chunks as the Promises resolve. This works without any WebSocket or special infrastructure — just a standard HTTP 1.1 connection.

For SSR (server-side rendering), streaming is transparent. For static prerendering, Promises must be awaited at build time. For client-side navigation, deferred Promises resolve normally since the data is fetched client-side.`
		},
		{
			type: 'checkpoint',
			content: 'cp-streaming-load'
		},
		{
			type: 'checkpoint',
			content: 'cp-streaming-template'
		}
	],

	starterFiles: [
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `// Simulated API functions with different latencies
async function getUser(id: string) {
  await new Promise(r => setTimeout(r, 50));
  return { id, name: 'Alex Johnson', role: 'Senior Developer', avatar: '👤' };
}

async function getActivity(userId: string) {
  await new Promise(r => setTimeout(r, 900));
  return [
    { type: 'commit', repo: 'svelte-frontend', message: 'Fix hydration mismatch', time: '2h ago' },
    { type: 'pr', repo: 'sveltekit', message: 'Add streaming docs', time: '5h ago' },
    { type: 'review', repo: 'svelte', message: 'Reviewed #1234', time: '1d ago' },
  ];
}

async function getStats(userId: string) {
  await new Promise(r => setTimeout(r, 1400));
  return { commits: 847, prs: 63, reviews: 124, streak: 12 };
}

export const load = async ({ params }) => {
  // TODO: Await the user (fast), but defer activity and stats
  // Right now everything is awaited — change it to defer the slow calls
  const user     = await getUser('1');
  const activity = await getActivity('1');
  const stats    = await getStats('1');

  return { user, activity, stats };
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script>
  let { data } = $props();
</script>

<div class="profile">
  <div class="header">
    <span class="avatar">{data.user.avatar}</span>
    <div>
      <h1>{data.user.name}</h1>
      <p class="role">{data.user.role}</p>
    </div>
  </div>

  <!-- TODO: Wrap this section in {#await data.activity} ... {/await} -->
  <!-- Show a loading skeleton while pending, then render the activity list -->
  <section class="activity">
    <h2>Recent Activity</h2>
    {#each data.activity as item}
      <div class="item">{item.type}: {item.message} — {item.time}</div>
    {/each}
  </section>

  <!-- TODO: Wrap this section in {#await data.stats} ... {/await} -->
  <!-- Show a loading skeleton while pending, then render the stats grid -->
  <section class="stats">
    <h2>Statistics</h2>
    <div class="grid">
      <div class="stat"><span>{data.stats.commits}</span>Commits</div>
      <div class="stat"><span>{data.stats.prs}</span>Pull Requests</div>
      <div class="stat"><span>{data.stats.reviews}</span>Reviews</div>
      <div class="stat"><span>{data.stats.streak}</span>Day Streak</div>
    </div>
  </section>
</div>

<style>
  .profile { max-width: 600px; margin: 2rem auto; font-family: system-ui, sans-serif; display: flex; flex-direction: column; gap: 1.5rem; }
  .header { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; }
  .avatar { font-size: 3rem; }
  h1 { margin: 0; font-size: 1.25rem; }
  .role { margin: 0.25rem 0 0; color: #64748b; font-size: 0.875rem; }
  section { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; }
  h2 { margin: 0 0 1rem; font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .item { padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; color: #475569; }
  .item:last-child { border: none; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
  .stat { text-align: center; }
  .stat span { display: block; font-size: 1.5rem; font-weight: 700; color: #6366f1; }
  .stat { font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `async function getUser(id: string) {
  await new Promise(r => setTimeout(r, 50));
  return { id, name: 'Alex Johnson', role: 'Senior Developer', avatar: '👤' };
}

async function getActivity(userId: string) {
  await new Promise(r => setTimeout(r, 900));
  return [
    { type: 'commit', repo: 'svelte-frontend', message: 'Fix hydration mismatch', time: '2h ago' },
    { type: 'pr', repo: 'sveltekit', message: 'Add streaming docs', time: '5h ago' },
    { type: 'review', repo: 'svelte', message: 'Reviewed #1234', time: '1d ago' },
  ];
}

async function getStats(userId: string) {
  await new Promise(r => setTimeout(r, 1400));
  return { commits: 847, prs: 63, reviews: 124, streak: 12 };
}

export const load = async () => {
  // Only await the fast user data — page renders immediately
  const user = await getUser('1');

  return {
    user,
    activity: getActivity('1'),  // deferred — returns a Promise
    stats: getStats('1')         // deferred — returns a Promise
  };
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script>
  let { data } = $props();
</script>

<div class="profile">
  <div class="header">
    <span class="avatar">{data.user.avatar}</span>
    <div>
      <h1>{data.user.name}</h1>
      <p class="role">{data.user.role}</p>
    </div>
  </div>

  {#await data.activity}
    <section class="section-skeleton">
      <div class="skeleton-bar" style="width: 120px; height: 12px; margin-bottom: 1rem;"></div>
      {#each [1,2,3] as _}
        <div class="skeleton-bar" style="width: 100%; height: 36px; margin-bottom: 0.5rem;"></div>
      {/each}
    </section>
  {:then activity}
    <section class="section">
      <h2>Recent Activity</h2>
      {#each activity as item}
        <div class="item">{item.type}: {item.message} — {item.time}</div>
      {/each}
    </section>
  {:catch error}
    <section class="section error-section">
      <p>Could not load activity: {error.message}</p>
    </section>
  {/await}

  {#await data.stats}
    <section class="section-skeleton">
      <div class="skeleton-bar" style="width: 100px; height: 12px; margin-bottom: 1rem;"></div>
      <div class="grid">
        {#each [1,2,3,4] as _}
          <div class="skeleton-bar" style="height: 60px;"></div>
        {/each}
      </div>
    </section>
  {:then stats}
    <section class="section">
      <h2>Statistics</h2>
      <div class="grid">
        <div class="stat"><span>{stats.commits}</span>Commits</div>
        <div class="stat"><span>{stats.prs}</span>Pull Requests</div>
        <div class="stat"><span>{stats.reviews}</span>Reviews</div>
        <div class="stat"><span>{stats.streak}</span>Day Streak</div>
      </div>
    </section>
  {:catch}
    <!-- Stats failure is non-critical, fail silently -->
  {/await}
</div>

<style>
  .profile { max-width: 600px; margin: 2rem auto; font-family: system-ui, sans-serif; display: flex; flex-direction: column; gap: 1.5rem; }
  .header { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; }
  .avatar { font-size: 3rem; }
  h1 { margin: 0; font-size: 1.25rem; }
  .role { margin: 0.25rem 0 0; color: #64748b; font-size: 0.875rem; }
  .section { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; }
  .section-skeleton { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; }
  .skeleton-bar { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); border-radius: 4px; animation: shimmer 1.5s infinite; background-size: 200% 100%; }
  @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
  h2 { margin: 0 0 1rem; font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .item { padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.875rem; color: #475569; }
  .item:last-child { border: none; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
  .stat { text-align: center; }
  .stat span { display: block; font-size: 1.5rem; font-weight: 700; color: #6366f1; }
  .error-section { color: #dc2626; font-size: 0.875rem; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-streaming-load',
			description: 'Modify the load function to defer slow data by not awaiting it',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'await getUser' },
						{ type: 'not-contains', value: 'await getActivity' },
						{ type: 'not-contains', value: 'await getStats' }
					]
				}
			},
			hints: [
				'Only `await` the fast `getUser()` call — the page needs this data for its initial render.',
				'For `getActivity` and `getStats`, just call the functions WITHOUT `await`. They return Promises.',
				'Return `{ user, activity: getActivity("1"), stats: getStats("1") }` — the Promises stream in automatically.'
			],
			conceptsTested: ['sveltekit.load.deferred', 'sveltekit.load.server']
		},
		{
			id: 'cp-streaming-template',
			description: 'Use {#await} blocks in the template to handle the streaming Promises',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#await data.activity}' },
						{ type: 'contains', value: '{#await data.stats}' },
						{ type: 'contains', value: '{:then' }
					]
				}
			},
			hints: [
				'Wrap each slow section in `{#await data.X}...{:then result}...{:catch error}...{/await}`.',
				'The `{#await}` branch shows while the Promise is pending — show a skeleton or spinner here.',
				'The `{:catch}` branch is optional but important — decide whether to show an error or silently fail.'
			],
			conceptsTested: ['sveltekit.load.await', 'sveltekit.load.deferred']
		}
	]
};
