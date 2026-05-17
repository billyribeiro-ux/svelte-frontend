import type { Lesson } from '$types/lesson';

export const serviceWorkers: Lesson = {
	id: 'sveltekit.advanced-sveltekit.service-workers',
	slug: 'service-workers',
	title: 'Service Workers & Offline Support',
	description: 'Build offline-capable PWAs with SvelteKit service workers, caching strategies, and the $service-worker module.',
	trackId: 'sveltekit',
	moduleId: 'advanced-sveltekit',
	order: 7,
	estimatedMinutes: 20,
	concepts: ['sveltekit.advanced.service-workers', 'sveltekit.advanced.caching-strategies'],
	prerequisites: ['sveltekit.loading.server'],

	content: [
		{
			type: 'text',
			content: `# Service Workers & Offline Support

## Why Service Workers Matter

A service worker is a script that runs in the background, separate from your web page, intercepting network requests and controlling how they are fulfilled. It sits between your application and the network, acting as a programmable proxy. When the network is available, it can pass requests through or serve cached responses. When the network is gone, it can serve cached content, making your application work offline.

For SvelteKit applications, service workers enable:

- **Offline access.** Users can browse previously visited pages without a network connection. For content-heavy sites (documentation, blogs, reference material), this is transformative.
- **Instant repeat visits.** Cached assets load from disk, not the network. Second visits are nearly instantaneous regardless of network speed.
- **Background sync.** Pending mutations (form submissions, data changes) can be queued and sent when the network returns.
- **Push notifications.** The service worker can receive push events even when the app is not open.
- **Progressive Web App (PWA) support.** Service workers are a core requirement for installable PWAs. Combined with a web manifest, they let users install your SvelteKit app on their home screen.

## Why Service Workers Are Different from Web Workers

Both service workers and web workers run JavaScript off the main thread, but they serve fundamentally different purposes and have different lifecycles:

**Web Workers** are created by a page and live as long as that page is open. They are designed for CPU-intensive computation -- parsing large files, running algorithms, processing images. A web worker is tied to a single page tab. When the tab closes, the worker is terminated. Web workers cannot intercept network requests or access the Cache API.

**Service Workers** are registered once and persist across page loads and even across tab closures. They are designed for network-related tasks -- caching, offline support, push notifications, background sync. A service worker is shared across all tabs of the same origin. It runs independently of any page and can receive events (push, sync, fetch) even when no page is open. Service workers can intercept every network request your application makes and decide how to respond.

Key differences:

| Feature | Web Worker | Service Worker |
|---|---|---|
| Lifecycle | Tied to page | Persists across pages |
| Network interception | No | Yes (fetch events) |
| Cache API access | No | Yes |
| Push notifications | No | Yes |
| Background sync | No | Yes |
| Multiple tabs | One per page | Shared across tabs |
| Registration | \`new Worker()\` | \`navigator.serviceWorker.register()\` |
| HTTPS required | No | Yes (except localhost) |

Service workers are not simple. They have a complex lifecycle (install, activate, fetch), caching requires careful strategy, and bugs in service workers can break your entire application in ways that are hard to debug (stale caches serving old code, infinite loops, etc.). SvelteKit simplifies this significantly by providing built-in module access to your app's build artifacts.

## Service Worker Lifecycle: Install, Waiting, Activate, Fetch

Understanding the service worker lifecycle is essential for debugging and for implementing correct update behavior. Unlike regular JavaScript that runs when a page loads, a service worker goes through a multi-stage lifecycle with specific states:

### 1. Registration
When SvelteKit registers your service worker (automatically, from \`src/service-worker.ts\`), the browser downloads the script and begins installation. Registration happens once per service worker file -- if the file has not changed since the last registration, the browser skips the rest.

### 2. Install
The \`install\` event fires when the browser detects a new or changed service worker script. This is where you pre-cache assets -- downloading and storing all the files your app needs to work offline.

\`\`\`typescript
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});
\`\`\`

\`event.waitUntil()\` tells the browser "do not consider installation complete until this promise resolves." If the promise rejects (e.g., one of the assets fails to download), the installation fails and the service worker is discarded.

### 3. Waiting
After installation, the new service worker enters a **waiting** state. It does NOT take control immediately. The old service worker (if any) continues to serve requests. The new service worker waits until all tabs using the old service worker are closed. This prevents the nightmare scenario of two versions of your app running simultaneously -- one tab using the old service worker and another using the new one.

You can skip the waiting phase with \`self.skipWaiting()\`, which is useful during development but should be used cautiously in production. Skipping the wait means the new service worker takes control mid-session, which can cause inconsistencies if the new worker expects resources that the old page does not have.

### 4. Activate
The \`activate\` event fires when the waiting service worker takes control. This is where you clean up old caches from previous versions:

\`\`\`typescript
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});
\`\`\`

After activation, the service worker controls all pages under its scope.

### 5. Fetch (Ongoing)
The \`fetch\` event fires for every network request made by controlled pages. This is where your caching strategy lives -- deciding whether to serve from cache, fetch from network, or some combination.

The complete lifecycle for an update looks like this:

\`\`\`
Old SW active, serving requests
  ↓
User visits site → browser checks for updated SW script
  ↓
New SW detected → install event fires → assets pre-cached
  ↓
New SW enters "waiting" state
  ↓
All tabs using old SW close
  ↓
New SW activates → activate event fires → old caches deleted
  ↓
New SW now handles all fetch events
\`\`\`

## SvelteKit's Service Worker Support

SvelteKit recognizes a special file: \`src/service-worker.ts\` (or \`.js\`). If this file exists, SvelteKit:

1. Bundles it separately from the main application
2. Registers it automatically in the client
3. Provides special modules (\`$service-worker\`) with build-time information
4. Handles the registration lifecycle

You do not need to manually register the service worker or deal with \`navigator.serviceWorker.register()\`. SvelteKit does this for you.

\`\`\`typescript
// src/service-worker.ts
// This file is automatically registered by SvelteKit

import { build, files, version } from '$service-worker';

const CACHE_NAME = \`cache-\${version}\`;

// 'build' contains the hashed app files (JS, CSS)
// 'files' contains the static files from /static
// 'version' is a unique identifier for the current deployment
\`\`\`

## The $service-worker Module

SvelteKit provides three exports from \`$service-worker\`:

**\`build\`** -- An array of URL strings for the files generated by your SvelteKit build. These are the JavaScript chunks, CSS files, and other assets that make up your application. They have hashed filenames, so they are safe to cache indefinitely.

\`\`\`typescript
// Example build contents:
// [
//   '/_app/immutable/entry/app.abc123.js',
//   '/_app/immutable/chunks/index.def456.js',
//   '/_app/immutable/assets/app.ghi789.css'
// ]
\`\`\`

**\`files\`** -- An array of URL strings for the files in your \`static\` directory. These are your images, fonts, favicon, robots.txt, and any other static assets. Unlike build files, these do not have hashed names, so caching strategy needs more care.

\`\`\`typescript
// Example files contents:
// [
//   '/favicon.png',
//   '/robots.txt',
//   '/images/logo.svg',
//   '/fonts/inter.woff2'
// ]
\`\`\`

**\`version\`** -- A string that uniquely identifies the current build. This changes every time you deploy. Use it to namespace your caches so old deployments do not serve stale content.`
		},
		{
			type: 'text',
			content: `## Caching Strategies

Different types of content demand different caching approaches. Here are the three fundamental strategies:

### Cache-First (Cache Falling Back to Network)

Check the cache first. If the asset is cached, serve it immediately. If not, fetch from the network, cache the response, and serve it.

**Best for:** Build assets (JS, CSS with hashed filenames), fonts, images that rarely change. These files are immutable -- the filename changes when the content changes.

\`\`\`typescript
async function cacheFirst(request: Request): Promise<Response> {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, networkResponse.clone());
  return networkResponse;
}
\`\`\`

### Network-First (Network Falling Back to Cache)

Try the network first. If the network responds, cache the response and serve it. If the network fails, serve the cached version.

**Best for:** HTML pages, API responses, any content that changes frequently. The user gets the freshest content when online and the last-known-good content when offline.

\`\`\`typescript
async function networkFirst(request: Request): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline', { status: 503 });
  }
}
\`\`\`

### Stale-While-Revalidate

Serve the cached version immediately (fast), then fetch from the network in the background and update the cache. The next request gets the updated content.

**Best for:** Content that benefits from speed but should eventually update -- avatars, non-critical API data, user profiles.

\`\`\`typescript
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await caches.match(request);

  // Fetch from network in background
  const networkPromise = fetch(request).then((networkResponse) => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  });

  // Return cached immediately if available, otherwise wait for network
  return cachedResponse ?? networkPromise;
}
\`\`\`

### Choosing the Right Strategy for Each Resource Type

| Resource Type | Strategy | Why |
|---|---|---|
| Build assets (hashed JS/CSS) | Cache-first | Immutable filenames; cache forever |
| Static files (images, fonts) | Cache-first | Rarely change; fast repeat loads |
| HTML pages (navigation) | Network-first | Freshness matters; offline fallback |
| API data (\`__data.json\`) | Network-first | Data changes frequently |
| User avatars | Stale-while-revalidate | Speed matters; eventual consistency ok |
| Third-party CDN assets | Cache-first | Not under your control; cache what you get |

## Version-Based Cache Invalidation with $service-worker.version

The \`version\` from \`$service-worker\` is the key to safe cache management. Each deployment gets a unique version string. The pattern:

1. **Install:** Create a new cache named \`app-cache-\${version}\` and fill it with all current assets
2. **Activate:** Delete all caches whose name does not match the current version
3. **Fetch:** Serve from the current cache

This ensures that after a deployment, the old cache is cleaned up and users get fresh content. Without version-based invalidation, users could be stuck on stale cached content indefinitely.

The version string changes every time you run \`npm run build\`. Even if your code has not changed, a new build produces a new version. This is intentional -- it ensures that any change in dependencies, configuration, or environment is captured.

\`\`\`typescript
// The naming pattern ensures cache isolation between versions
const CACHE_NAME = \`app-cache-\${version}\`;

// During install, the new version's cache is populated
// The old version's cache still exists and serves the old SW

// During activate, old caches are cleaned up
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME) // Keep only current
          .map((key) => caches.delete(key))    // Delete all others
      )
    )
  );
});
\`\`\`

**What happens without version-based naming:** If you used a fixed cache name like \`"app-cache"\`, the new service worker would overwrite entries in the same cache. But the old service worker (still active in other tabs) might expect specific files that are now gone. The old tabs could break with missing asset errors. Version-based naming keeps each version's cache completely separate until the old version is fully deactivated.`
		},
		{
			type: 'text',
			content: `## Complete Service Worker Implementation

Here is a production-quality service worker for a SvelteKit app:

\`\`\`typescript
// src/service-worker.ts
import { build, files, version } from '$service-worker';

const CACHE_NAME = \`app-cache-\${version}\`;
const ASSETS = [...build, ...files];

// Install: pre-cache all build assets and static files
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate: delete old caches from previous versions
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

// Fetch: serve cached assets, network-first for everything else
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Serve build/static assets from cache (cache-first)
  if (ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached ?? fetch(event.request)
      )
    );
    return;
  }

  // For navigation requests, try network first with offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline') ?? new Response('Offline'))
    );
    return;
  }

  // For everything else: network first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const cache = caches.open(CACHE_NAME);
        cache.then((c) => c.put(event.request, response.clone()));
        return response;
      })
      .catch(() => caches.match(event.request))
      .then((response) => response ?? new Response('Offline', { status: 503 }))
  );
});
\`\`\`

## Offline Fallback Page Implementation

For a complete offline experience, create a fallback page that is pre-cached and shown when the user navigates to a page that has not been cached. This page should be helpful, not just an error message:

\`\`\`svelte
<!-- src/routes/offline/+page.svelte -->
<script lang="ts">
  let retrying = $state(false);

  async function retry() {
    retrying = true;
    try {
      // Try to fetch the current URL
      const response = await fetch(window.location.href);
      if (response.ok) {
        window.location.reload();
      } else {
        retrying = false;
      }
    } catch {
      retrying = false;
    }
  }
</script>

<div class="offline-page">
  <h1>You are Offline</h1>
  <p>This page is not available without an internet connection.</p>
  <p>Pages you have previously visited may still be accessible.</p>

  <button onclick={retry} disabled={retrying}>
    {retrying ? 'Checking...' : 'Try Again'}
  </button>

  <nav>
    <h2>Cached Pages</h2>
    <p>Try navigating to a page you have visited before:</p>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</div>
\`\`\`

Pre-cache the offline page during installation so it is always available:

\`\`\`typescript
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([...ASSETS, '/offline'])
    )
  );
});
\`\`\`

Then serve it as a fallback for failed navigation requests:

\`\`\`typescript
if (event.request.mode === 'navigate') {
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match('/offline');
      return cached ?? new Response('Offline');
    })
  );
}
\`\`\``
		},
		{
			type: 'text',
			content: `## Background Sync for Offline Form Submissions

One of the most powerful service worker capabilities is background sync -- the ability to queue network requests that failed (because the user is offline) and replay them automatically when the connection returns. This is critical for form submissions, data mutations, and any write operations that the user expects to succeed.

The pattern works like this:

1. User submits a form while offline
2. The service worker intercepts the failed POST request
3. The request is stored in IndexedDB
4. The service worker registers a sync event
5. When the network returns, the browser fires the sync event
6. The service worker replays the stored request

\`\`\`typescript
// In your service worker: intercept failed POST requests
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.method === 'POST') {
    event.respondWith(
      fetch(event.request.clone()).catch(async () => {
        // Store the request for later replay
        const body = await event.request.text();
        const serializedRequest = {
          url: event.request.url,
          method: event.request.method,
          headers: Object.fromEntries(event.request.headers.entries()),
          body
        };

        // Store in IndexedDB (simplified -- use idb library in production)
        const db = await openDB();
        await db.put('pending-requests', serializedRequest);

        // Register sync
        await (self as any).registration.sync.register('replay-requests');

        // Return a response indicating the request is queued
        return new Response(
          JSON.stringify({ queued: true, message: 'Saved for later' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }
});

// Handle the sync event when network returns
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'replay-requests') {
    event.waitUntil(replayPendingRequests());
  }
});

async function replayPendingRequests() {
  const db = await openDB();
  const pending = await db.getAll('pending-requests');

  for (const req of pending) {
    try {
      await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body
      });
      await db.delete('pending-requests', req.id);
    } catch {
      // Still offline, will retry on next sync
      break;
    }
  }
}
\`\`\`

**Important limitations:** Background sync is not universally supported (Safari has limited support). Always provide a fallback UX that tells the user their data was saved locally and will sync when they reconnect. Never silently fail.

## Push Notifications Architecture Overview

Service workers can receive push notifications from a server even when the web app is not open. The architecture involves three parties:

1. **Your SvelteKit app** -- subscribes to push notifications via the Push API
2. **A push service** (provided by the browser vendor -- Google for Chrome, Mozilla for Firefox) -- receives push messages from your server and delivers them to the service worker
3. **Your backend server** -- sends push messages to the push service when events occur

\`\`\`typescript
// In your SvelteKit client code: subscribe to push
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: PUBLIC_VAPID_KEY
  });
  // Send subscription to your server
  await fetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription)
  });
}

// In your service worker: handle incoming push
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() ?? { title: 'Notification', body: '' };

  event.waitUntil(
    (self as any).registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      data: { url: data.url }
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    (self as any).clients.openWindow(event.notification.data.url)
  );
});
\`\`\`

Push notifications require VAPID keys (Voluntary Application Server Identification) for authentication. The server signs push messages with a private key, and the push service verifies them with the corresponding public key. This is a topic that deserves its own lesson, but knowing that service workers are the receiving end of push notifications helps you understand their role in the larger PWA architecture.

## Cache Storage Limits and Eviction Strategies

Browsers impose limits on how much data a service worker can cache. The limits vary by browser and platform:

- **Chrome:** Uses a percentage of available disk space per origin (typically up to several GB)
- **Firefox:** Up to 50% of free disk space, with a per-origin cap
- **Safari:** Much more restrictive -- approximately 50 MB per origin, and caches may be evicted after 7 days of non-use

When cache storage is full, the browser may evict entire origins (all cached data for your site) without warning. To manage this:

**Monitor cache size:**
\`\`\`typescript
async function checkStorageUsage() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const percentUsed = ((estimate.usage ?? 0) / (estimate.quota ?? 1)) * 100;
    console.log(\`Storage: \${percentUsed.toFixed(1)}% used\`);
    console.log(\`Used: \${((estimate.usage ?? 0) / 1024 / 1024).toFixed(1)} MB\`);
    console.log(\`Quota: \${((estimate.quota ?? 0) / 1024 / 1024).toFixed(1)} MB\`);
  }
}
\`\`\`

**Implement cache limits:**
\`\`\`typescript
async function trimCache(cacheName: string, maxEntries: number) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    // Delete oldest entries (FIFO)
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}
\`\`\`

**Be selective about what you cache:** Do not cache large images, videos, or binary files in the service worker cache unless they are essential for offline use. Use lazy caching (cache on first access) rather than eager caching (cache everything upfront) for non-critical assets.

## Debugging Service Workers

Service workers are notoriously tricky to debug. Key tips:

- **Chrome DevTools > Application > Service Workers** shows the current registration, status, and lets you trigger update, unregister, or simulate offline.
- **Cache Storage** (also in Application tab) shows exactly what is cached.
- Use \`skipWaiting()\` during development to immediately activate new service workers instead of waiting for all tabs to close.
- In development, SvelteKit does not register the service worker by default. It only activates in production builds (\`npm run build && npm run preview\`).

\`\`\`typescript
// During development, skip waiting for faster iteration
self.addEventListener('install', (event: ExtendableEvent) => {
  // @ts-ignore
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.advanced.service-workers'
		},
		{
			type: 'text',
			content: `## Exercise: Build an Offline-Capable App

Create a service worker that pre-caches your SvelteKit app's build assets and static files, serves them cache-first, and provides an offline fallback for uncached navigation requests. Use different caching strategies for different resource types.

**Your task:**
1. Import \`build\`, \`files\`, and \`version\` from \`$service-worker\`
2. Pre-cache all assets during the install event (include the offline page)
3. Delete old caches during the activate event
4. Serve cached assets with a cache-first strategy`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Adding Network-First for Navigation and API Requests

Enhance your service worker to handle navigation requests (HTML pages) with a network-first strategy, falling back to an offline page when the network is unavailable. Also handle API data requests (\`__data.json\`) with network-first caching so offline users get the last-fetched data.

**Task:** Add a fetch event listener that distinguishes between asset requests (cache-first), navigation requests (network-first with offline fallback), and data requests (network-first with cache fallback).`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Adding Cache Size Management

Implement a cache trimming function that limits the number of dynamically cached entries (API responses, navigation pages) to prevent unbounded cache growth. Call this function after each dynamic cache write.

**Task:** Create a \`trimCache\` function that removes the oldest entries when the cache exceeds a configurable maximum size (e.g., 50 entries). Call it after caching API or navigation responses.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'xray-prompt',
			content: `Explain the service worker lifecycle (install, waiting, activate) and why a new service worker does not take control immediately. What problems would arise if SvelteKit automatically activated new service workers without waiting? How does version-based cache naming prevent serving stale assets after a deployment? What are the tradeoffs between cache-first and network-first strategies for different resource types?`
		},
		{
			type: 'text',
			content: `## Summary

SvelteKit makes service workers practical by providing the \`$service-worker\` module with build-time access to your application's assets. The \`build\` array gives you hashed JS/CSS files (safe to cache forever), \`files\` gives you static assets, and \`version\` provides a deployment-unique identifier for cache namespacing. Understanding the service worker lifecycle -- install, waiting, activate, fetch -- is essential for debugging update issues and cache staleness. Service workers differ fundamentally from web workers: they persist across page loads, intercept network requests, and enable offline functionality. Combine cache-first for immutable assets, network-first for dynamic content, and an offline fallback page for uncached navigations to build a production-quality offline experience. For advanced use cases, background sync enables offline form submissions, and push notifications enable real-time engagement. Monitor cache sizes and implement eviction strategies to stay within browser limits. Remember: service workers only activate in production builds, so always test with \`npm run build && npm run preview\`.`
		}
	],

	starterFiles: [
		{
			name: 'service-worker.ts',
			path: '/src/service-worker.ts',
			language: 'typescript',
			content: `// TODO: Import build, files, version from '$service-worker'

// TODO: Create a versioned cache name
// const CACHE_NAME = ...

// TODO: Combine build and files into a single ASSETS array

// TODO: Install event: pre-cache all assets (include '/offline')
self.addEventListener('install', (event) => {
  // Open the cache and add all assets
});

// TODO: Activate event: delete old caches
self.addEventListener('activate', (event) => {
  // Get all cache keys and delete ones that don't match CACHE_NAME
});

// TODO: Fetch event: serve from cache or network
self.addEventListener('fetch', (event) => {
  // For GET requests only:
  // - Cached assets: cache-first
  // - Navigation: network-first with offline fallback
  // - API data (__data.json): network-first with cache fallback
  // - Everything else: network-first
});

// TODO: Implement cache trimming function
// async function trimCache(cacheName: string, maxEntries: number) { ... }`
		},
		{
			name: 'offline/+page.svelte',
			path: '/src/routes/offline/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let retrying = $state(false);

  async function retry() {
    retrying = true;
    try {
      const response = await fetch(window.location.href);
      if (response.ok) {
        window.location.reload();
      } else {
        retrying = false;
      }
    } catch {
      retrying = false;
    }
  }
</script>

<h1>You are Offline</h1>
<p>This page is not available without an internet connection.</p>
<p>Pages you have previously visited may still be accessible.</p>
<button onclick={retry} disabled={retrying}>
  {retrying ? 'Checking...' : 'Try Again'}
</button>`
		}
	],

	solutionFiles: [
		{
			name: 'service-worker.ts',
			path: '/src/service-worker.ts',
			language: 'typescript',
			content: `import { build, files, version } from '$service-worker';

const CACHE_NAME = \`app-cache-\${version}\`;
const ASSETS = [...build, ...files];
const MAX_DYNAMIC_CACHE_ENTRIES = 50;

async function trimCache(cacheName: string, maxEntries: number) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([...ASSETS, '/offline'])
    )
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Cache-first for build/static assets
  if (ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached ?? fetch(event.request)
      )
    );
    return;
  }

  // Network-first for navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
            trimCache(CACHE_NAME, MAX_DYNAMIC_CACHE_ENTRIES);
          });
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const offline = await caches.match('/offline');
          return offline ?? new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Network-first for API data requests
  if (url.pathname.endsWith('__data.json')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
            trimCache(CACHE_NAME, MAX_DYNAMIC_CACHE_ENTRIES);
          });
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          return cached ?? new Response('{}', { status: 503 });
        })
    );
    return;
  }

  // Network-first for everything else
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        return cached ?? new Response('Offline', { status: 503 });
      })
  );
});`
		},
		{
			name: 'offline/+page.svelte',
			path: '/src/routes/offline/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let retrying = $state(false);

  async function retry() {
    retrying = true;
    try {
      const response = await fetch(window.location.href);
      if (response.ok) {
        window.location.reload();
      } else {
        retrying = false;
      }
    } catch {
      retrying = false;
    }
  }
</script>

<h1>You are Offline</h1>
<p>This page is not available without an internet connection.</p>
<p>Pages you have previously visited may still be accessible.</p>
<button onclick={retry} disabled={retrying}>
  {retrying ? 'Checking...' : 'Try Again'}
</button>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Implement install and activate events with versioned caching',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$service-worker' },
						{ type: 'contains', value: 'CACHE_NAME' },
						{ type: 'contains', value: 'cache.addAll' }
					]
				}
			},
			hints: [
				'Import `build`, `files`, and `version` from `$service-worker` at the top of the file.',
				'Create `const CACHE_NAME = `app-cache-${version}`` and `const ASSETS = [...build, ...files]`.',
				'In the install listener, use `event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll([...ASSETS, \'/offline\'])))`.'
			],
			conceptsTested: ['sveltekit.advanced.service-workers']
		},
		{
			id: 'cp-2',
			description: 'Add fetch handler with cache-first for assets and network-first for navigation',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'event.request.mode' },
						{ type: 'contains', value: 'navigate' },
						{ type: 'contains', value: 'caches.match' }
					]
				}
			},
			hints: [
				'Check `event.request.method !== "GET"` and return early for non-GET requests.',
				'For assets in the ASSETS array, use `event.respondWith(caches.match(request).then(cached => cached ?? fetch(request)))`.',
				'For navigation requests (`event.request.mode === "navigate"`), try `fetch` first, and `.catch()` to serve the offline page from cache.'
			],
			conceptsTested: ['sveltekit.advanced.caching-strategies']
		},
		{
			id: 'cp-3',
			description: 'Implement cache trimming to limit dynamic cache entries',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'trimCache' },
						{ type: 'contains', value: 'cache.keys' }
					]
				}
			},
			hints: [
				'Create an `async function trimCache(cacheName: string, maxEntries: number)` that opens the cache and checks its size.',
				'Use `cache.keys()` to get all entries, then delete the oldest ones if the count exceeds `maxEntries`.',
				'Call `trimCache` after each `cache.put` in your dynamic caching handlers.'
			],
			conceptsTested: ['sveltekit.advanced.caching-strategies']
		}
	]
};
