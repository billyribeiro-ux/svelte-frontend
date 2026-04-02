import type { Lesson } from '$types/lesson';

export const realTimeUpdates: Lesson = {
	id: 'projects.build-a-dashboard.real-time-updates',
	slug: 'real-time-updates',
	title: 'Real-Time Updates',
	description:
		'Add live data feeds to your dashboard with simulated WebSocket connections, auto-refreshing charts, and an activity log using $effect.',
	trackId: 'projects',
	moduleId: 'build-a-dashboard',
	order: 4,
	estimatedMinutes: 30,
	concepts: ['svelte5.runes.effect', 'svelte5.runes.state', 'svelte5.lifecycle.cleanup'],
	prerequisites: ['projects.build-a-dashboard.data-tables'],

	content: [
		{
			type: 'text',
			content: `# Real-Time Updates

A static dashboard is a snapshot; a live dashboard is a pulse. In this lesson you will add real-time behavior to your dashboard: a simulated data feed that pushes new values at regular intervals, a live-updating chart that shifts as new data arrives, an activity log that streams events with timestamps, and proper cleanup when components unmount. This is where \`$effect\` truly shines.

## Simulating a Data Feed

In production, real-time data arrives via WebSockets, Server-Sent Events (SSE), or polling. For this lesson we simulate a WebSocket by using \`setInterval\` inside a \`$effect\`:

\`\`\`ts
let revenueData = $state<{ time: string; value: number }[]>([]);

$effect(() => {
  const interval = setInterval(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const value = Math.floor(Math.random() * 5000) + 1000;
    revenueData.push({ time: timeStr, value });

    // Keep only the last 20 points for a sliding window
    if (revenueData.length > 20) {
      revenueData.shift();
    }
  }, 2000);

  return () => clearInterval(interval);
});
\`\`\`

The critical detail is the **cleanup function**. When you return a function from \`$effect\`, Svelte calls it when the effect re-runs or when the component is destroyed. This prevents memory leaks from orphaned intervals — a common bug in front-end applications.

Without cleanup, every time the component re-mounts (or in development with hot module replacement), a new interval starts *on top of* the old one. After a few reloads you have dozens of intervals firing simultaneously, thrashing the DOM and consuming memory.

## The Sliding Window Pattern

Real-time charts need a fixed viewport. If you keep appending data forever, the chart becomes illegible and memory grows without bound. The sliding window pattern maintains a fixed number of recent data points by removing the oldest when a new one arrives:

\`\`\`ts
if (revenueData.length > 20) {
  revenueData.shift();
}
\`\`\`

The chart always shows the last 20 data points. As new data pushes in from the right, old data scrolls off the left. This is the same technique used by monitoring tools like Grafana, Datadog, and New Relic.

Because \`revenueData\` is a \`$state\` array, both the \`.push()\` and \`.shift()\` mutations trigger reactive updates. The chart re-derives its SVG path, and the UI updates smoothly.

## Live Chart Component

Build a \`LiveChart\` component that renders the revenue data as a line chart. It derives the path from the data array:

\`\`\`ts
let { data }: { data: { time: string; value: number }[] } = $props();

const WIDTH = 600;
const HEIGHT = 200;
const PADDING = 30;

let maxValue = $derived(Math.max(...data.map(d => d.value), 1));

let linePath = $derived(
  data.map((d, i) => {
    const x = PADDING + (i / Math.max(data.length - 1, 1)) * (WIDTH - PADDING * 2);
    const y = HEIGHT - PADDING - (d.value / maxValue) * (HEIGHT - PADDING * 2);
    return \`\${i === 0 ? 'M' : 'L'} \${x} \${y}\`;
  }).join(' ')
);
\`\`\`

Every 2 seconds when new data arrives, the path re-derives and the chart smoothly redraws. No imperative animation code, no manual DOM manipulation — just reactive data flowing through derived computations.

## The Activity Log

Dashboards often include a live activity log — a stream of events like "New order placed", "User signed up", or "Payment received". We model this as a \`$state\` array with a similar interval-based feed:

\`\`\`ts
interface ActivityEvent {
  id: string;
  message: string;
  timestamp: string;
  type: 'order' | 'user' | 'payment' | 'error';
}

let events = $state<ActivityEvent[]>([]);

const eventTemplates = [
  { message: 'New order placed', type: 'order' as const },
  { message: 'User signed up', type: 'user' as const },
  { message: 'Payment received', type: 'payment' as const },
  { message: 'Failed login attempt', type: 'error' as const },
];

$effect(() => {
  const interval = setInterval(() => {
    const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    events = [{
      id: crypto.randomUUID(),
      message: template.message,
      timestamp: new Date().toLocaleTimeString(),
      type: template.type,
    }, ...events.slice(0, 49)];
  }, 3000);

  return () => clearInterval(interval);
});
\`\`\`

New events are prepended (newest first), and we cap the array at 50 entries to prevent unbounded growth. Each event has a type that maps to a colored icon in the UI.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.effect'
		},
		{
			type: 'text',
			content: `## Your Task: Add Real-Time Features

Open the starter code. You will find \`App.svelte\` with a dashboard layout, a \`LiveChart.svelte\` shell, and an \`ActivityLog.svelte\` shell.

1. Set up a \`$effect\` with \`setInterval\` in \`App.svelte\` to generate revenue data every 2 seconds. Include a cleanup function.
2. Complete \`LiveChart.svelte\` to render the streaming data as a line chart with \`$derived\` path.
3. Set up a second \`$effect\` for the activity log feed with proper cleanup.
4. Complete \`ActivityLog.svelte\` to display events with type-based styling.`
		},
		{
			type: 'checkpoint',
			content: 'cp-rt-feed'
		},
		{
			type: 'text',
			content: `## Pause and Resume Controls

Give users control over the data feed with pause/resume buttons. This requires a \`$state\` boolean that gates the interval:

\`\`\`ts
let paused = $state(false);

$effect(() => {
  if (paused) return;

  const interval = setInterval(() => {
    // ... generate data
  }, 2000);

  return () => clearInterval(interval);
});
\`\`\`

When \`paused\` changes from \`false\` to \`true\`, the effect re-runs, the cleanup fires (clearing the interval), and the new run exits early without creating a new interval. When \`paused\` changes back to \`false\`, the effect re-runs and starts a fresh interval. This is elegant — the same \`$effect\` handles both states without any if/else branching for start/stop logic.

## Connection Status Indicator

Add a status indicator that shows whether the feed is "connected" (running) or "paused". This is a simple \`$derived\` value:

\`\`\`ts
let connectionStatus = $derived(paused ? 'Paused' : 'Live');
\`\`\`

Render it as a colored dot: green for live, yellow for paused. This small UI detail makes the dashboard feel professional and gives users confidence that data is flowing.

## Summary Stats

Add live summary statistics that derive from the streaming data: current value, average over the window, minimum, and maximum:

\`\`\`ts
let currentValue = $derived(revenueData.at(-1)?.value ?? 0);
let avgValue = $derived(
  revenueData.length > 0
    ? Math.round(revenueData.reduce((sum, d) => sum + d.value, 0) / revenueData.length)
    : 0
);
let minValue = $derived(Math.min(...revenueData.map(d => d.value)));
let maxValue = $derived(Math.max(...revenueData.map(d => d.value)));
\`\`\`

Display these in stat cards above the chart. As data streams in, every stat recalculates automatically. This is the Svelte 5 reactive model at its best — you declare what each value *is*, and the framework handles *when* to update.

This lesson completes the dashboard module. You have built a responsive layout, SVG charts, an interactive data table, and a real-time data feed with proper lifecycle management. These patterns form the backbone of any data-intensive application.`
		},
		{
			type: 'checkpoint',
			content: 'cp-rt-chart'
		},
		{
			type: 'checkpoint',
			content: 'cp-rt-activity'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import LiveChart from './LiveChart.svelte';
  import ActivityLog from './ActivityLog.svelte';

  interface DataPoint {
    time: string;
    value: number;
  }

  interface ActivityEvent {
    id: string;
    message: string;
    timestamp: string;
    type: 'order' | 'user' | 'payment' | 'error';
  }

  let revenueData = $state<DataPoint[]>([]);
  let events = $state<ActivityEvent[]>([]);
  let paused = $state(false);

  // TODO: Set up $effect with setInterval for revenue data feed (2s interval)
  // TODO: Include cleanup function that clears the interval
  // TODO: Respect the paused state

  // TODO: Set up $effect with setInterval for activity events (3s interval)
  // TODO: Include cleanup function
</script>

<div class="dashboard">
  <div class="header">
    <h1>Live Dashboard</h1>
    <button onclick={() => paused = !paused}>
      {paused ? 'Resume' : 'Pause'}
    </button>
  </div>

  <div class="grid">
    <LiveChart data={revenueData} />
    <ActivityLog {events} />
  </div>
</div>

<style>
  .dashboard {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .header button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
  }
</style>`
		},
		{
			name: 'LiveChart.svelte',
			path: '/LiveChart.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface DataPoint {
    time: string;
    value: number;
  }

  let { data }: { data: DataPoint[] } = $props();

  const WIDTH = 600;
  const HEIGHT = 200;
  const PADDING = 30;

  // TODO: Derive maxValue, linePath, and points from data
</script>

<div class="chart-card">
  <h3>Revenue Stream</h3>
  <!-- TODO: Render SVG line chart -->
  <p class="empty">{data.length === 0 ? 'Waiting for data...' : ''}</p>
</div>

<style>
  .chart-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.25rem;
  }

  h3 {
    margin: 0 0 0.75rem;
    color: #374151;
  }

  .empty {
    color: #94a3b8;
    text-align: center;
    padding: 2rem;
  }
</style>`
		},
		{
			name: 'ActivityLog.svelte',
			path: '/ActivityLog.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface ActivityEvent {
    id: string;
    message: string;
    timestamp: string;
    type: 'order' | 'user' | 'payment' | 'error';
  }

  let { events }: { events: ActivityEvent[] } = $props();

  // TODO: Add type-to-icon mapping
</script>

<div class="log-card">
  <h3>Activity Log</h3>
  <!-- TODO: Render event list with type-based styling -->
</div>

<style>
  .log-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.25rem;
    max-height: 400px;
    overflow-y: auto;
  }

  h3 {
    margin: 0 0 0.75rem;
    color: #374151;
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import LiveChart from './LiveChart.svelte';
  import ActivityLog from './ActivityLog.svelte';

  interface DataPoint {
    time: string;
    value: number;
  }

  interface ActivityEvent {
    id: string;
    message: string;
    timestamp: string;
    type: 'order' | 'user' | 'payment' | 'error';
  }

  let revenueData = $state<DataPoint[]>([]);
  let events = $state<ActivityEvent[]>([]);
  let paused = $state(false);

  const eventTemplates = [
    { message: 'New order placed', type: 'order' as const },
    { message: 'User signed up', type: 'user' as const },
    { message: 'Payment received', type: 'payment' as const },
    { message: 'Failed login attempt', type: 'error' as const },
  ];

  $effect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      const now = new Date();
      revenueData.push({
        time: now.toLocaleTimeString(),
        value: Math.floor(Math.random() * 5000) + 1000,
      });
      if (revenueData.length > 20) {
        revenueData.shift();
      }
    }, 2000);

    return () => clearInterval(interval);
  });

  $effect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
      events = [{
        id: crypto.randomUUID(),
        message: template.message,
        timestamp: new Date().toLocaleTimeString(),
        type: template.type,
      }, ...events.slice(0, 49)];
    }, 3000);

    return () => clearInterval(interval);
  });

  let connectionStatus = $derived(paused ? 'Paused' : 'Live');
</script>

<div class="dashboard">
  <div class="header">
    <h1>Live Dashboard</h1>
    <div class="controls">
      <span class="status" class:live={!paused}>{connectionStatus}</span>
      <button onclick={() => paused = !paused}>
        {paused ? 'Resume' : 'Pause'}
      </button>
    </div>
  </div>

  <div class="grid">
    <LiveChart data={revenueData} />
    <ActivityLog {events} />
  </div>
</div>

<style>
  .dashboard {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .status {
    font-size: 0.85rem;
    color: #f59e0b;
    font-weight: 600;
  }

  .status.live {
    color: #16a34a;
  }

  .header button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
  }
</style>`
		},
		{
			name: 'LiveChart.svelte',
			path: '/LiveChart.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface DataPoint {
    time: string;
    value: number;
  }

  let { data }: { data: DataPoint[] } = $props();

  const WIDTH = 600;
  const HEIGHT = 200;
  const PADDING = 30;

  let maxValue = $derived(Math.max(...data.map(d => d.value), 1));

  let points = $derived(
    data.map((d, i) => ({
      x: PADDING + (i / Math.max(data.length - 1, 1)) * (WIDTH - PADDING * 2),
      y: HEIGHT - PADDING - (d.value / maxValue) * (HEIGHT - PADDING * 2),
      time: d.time,
      value: d.value,
    }))
  );

  let linePath = $derived(
    points.map((p, i) => \`\${i === 0 ? 'M' : 'L'} \${p.x} \${p.y}\`).join(' ')
  );

  let currentValue = $derived(data.at(-1)?.value ?? 0);
  let avgValue = $derived(
    data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length) : 0
  );
</script>

<div class="chart-card">
  <div class="chart-header">
    <h3>Revenue Stream</h3>
    <div class="stats">
      <span>Current: <strong>\${currentValue.toLocaleString()}</strong></span>
      <span>Avg: <strong>\${avgValue.toLocaleString()}</strong></span>
    </div>
  </div>

  {#if data.length > 0}
    <svg width={WIDTH} height={HEIGHT}>
      <path d={linePath} fill="none" stroke="#6366f1" stroke-width="2" />
      {#each points as point, i}
        {#if i === points.length - 1}
          <circle cx={point.x} cy={point.y} r="4" fill="#6366f1" />
        {/if}
      {/each}
      <line x1={PADDING} y1={HEIGHT - PADDING} x2={WIDTH - PADDING} y2={HEIGHT - PADDING} stroke="#e2e8f0" />
    </svg>
  {:else}
    <p class="empty">Waiting for data...</p>
  {/if}
</div>

<style>
  .chart-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.25rem;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  h3 {
    margin: 0;
    color: #374151;
  }

  .stats {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: #64748b;
  }

  .stats strong {
    color: #1e293b;
  }

  .empty {
    color: #94a3b8;
    text-align: center;
    padding: 2rem;
  }
</style>`
		},
		{
			name: 'ActivityLog.svelte',
			path: '/ActivityLog.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface ActivityEvent {
    id: string;
    message: string;
    timestamp: string;
    type: 'order' | 'user' | 'payment' | 'error';
  }

  let { events }: { events: ActivityEvent[] } = $props();

  const typeIcons: Record<string, string> = {
    order: '🛒',
    user: '👤',
    payment: '💳',
    error: '⚠️',
  };
</script>

<div class="log-card">
  <h3>Activity Log</h3>
  {#if events.length === 0}
    <p class="empty">No events yet...</p>
  {:else}
    <ul class="event-list">
      {#each events as event (event.id)}
        <li class="event" class:error={event.type === 'error'}>
          <span class="icon">{typeIcons[event.type]}</span>
          <div class="details">
            <span class="message">{event.message}</span>
            <span class="time">{event.timestamp}</span>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .log-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.25rem;
    max-height: 400px;
    overflow-y: auto;
  }

  h3 {
    margin: 0 0 0.75rem;
    color: #374151;
  }

  .empty {
    color: #94a3b8;
    text-align: center;
  }

  .event-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .event {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 6px;
    background: #f8fafc;
    font-size: 0.85rem;
  }

  .event.error {
    background: #fef2f2;
  }

  .icon {
    font-size: 1rem;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .message {
    color: #374151;
  }

  .time {
    color: #94a3b8;
    font-size: 0.75rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-rt-feed',
			description: 'Set up a $effect with setInterval for the data feed and include cleanup',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$effect' },
						{ type: 'contains', value: 'setInterval' },
						{ type: 'contains', value: 'clearInterval' }
					]
				}
			},
			hints: [
				'Use `$effect(() => { const interval = setInterval(...); return () => clearInterval(interval); })` to create a self-cleaning data feed.',
				'Check `if (paused) return;` at the top of the effect so no interval is created when paused.',
				'The full pattern: `$effect(() => { if (paused) return; const interval = setInterval(() => { revenueData.push({ time: new Date().toLocaleTimeString(), value: Math.floor(Math.random() * 5000) + 1000 }); if (revenueData.length > 20) revenueData.shift(); }, 2000); return () => clearInterval(interval); });`'
			],
			conceptsTested: ['svelte5.runes.effect', 'svelte5.lifecycle.cleanup']
		},
		{
			id: 'cp-rt-chart',
			description: 'Complete LiveChart with $derived SVG path from streaming data',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$derived' },
						{ type: 'contains', value: 'linePath' },
						{ type: 'contains', value: '<path' }
					]
				}
			},
			hints: [
				'Derive `maxValue`, `points`, and `linePath` from the `data` prop using `$derived`.',
				'Build the path string with move (M) and line-to (L) commands, mapping data indices to x coordinates and values to y coordinates.',
				'Use `let linePath = $derived(points.map((p, i) => \\`${i === 0 ? \'M\' : \'L\'} ${p.x} ${p.y}\\`).join(\' \'))` and render `<path d={linePath} fill="none" stroke="#6366f1" stroke-width="2" />`.'
			],
			conceptsTested: ['svelte5.runes.derived']
		},
		{
			id: 'cp-rt-activity',
			description: 'Build ActivityLog component that renders typed events with styling',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$props()' },
						{ type: 'contains', value: '#each events' },
						{ type: 'contains', value: 'event.type' }
					]
				}
			},
			hints: [
				'Accept `events` via `$props()` and iterate with `{#each events as event (event.id)}`.',
				'Create a type-to-icon mapping object and render each event with its icon, message, and timestamp.',
				'Use `class:error={event.type === \'error\'}` for conditional styling and `{typeIcons[event.type]}` for the icon display.'
			],
			conceptsTested: ['svelte5.runes.state']
		}
	]
};
