import type { Lesson } from '$types/lesson';

export const dataVisualization: Lesson = {
	id: 'projects.build-a-dashboard.data-visualization',
	slug: 'data-visualization',
	title: 'Data Visualization',
	description:
		'Build interactive SVG charts — bar charts and line graphs — driven by reactive Svelte 5 state with smooth transitions.',
	trackId: 'projects',
	moduleId: 'build-a-dashboard',
	order: 2,
	estimatedMinutes: 35,
	concepts: ['svelte5.runes.derived', 'svelte5.svg.bindings', 'svelte5.transitions.tweened'],
	prerequisites: ['projects.build-a-dashboard.dashboard-layout'],

	content: [
		{
			type: 'text',
			content: `# Data Visualization with SVG and Svelte 5

Charts are the centerpiece of any dashboard. In this lesson you will build two chart types from scratch using SVG: a vertical bar chart and a line graph. Both will be driven entirely by reactive \`$state\` and \`$derived\` values, so the charts update automatically when the underlying data changes.

Why SVG rather than a charting library? Building charts by hand teaches you how data maps to visual coordinates — a skill that transcends any specific tool. You will understand scaling, axes, and labels at a fundamental level. And because Svelte compiles to surgical DOM updates, SVG-based charts render and update with excellent performance.

## Data Shape and Scaling

Every chart starts with data. For our bar chart, we use an array of labeled values:

\`\`\`ts
interface DataPoint {
  label: string;
  value: number;
}

let data = $state<DataPoint[]>([
  { label: 'Jan', value: 4200 },
  { label: 'Feb', value: 5800 },
  { label: 'Mar', value: 3900 },
  { label: 'Apr', value: 7100 },
  { label: 'May', value: 6500 },
  { label: 'Jun', value: 8200 },
]);
\`\`\`

To map values onto an SVG canvas, we need two things: the maximum value (for y-axis scaling) and the width available for each bar (for x-axis spacing). Both are derived:

\`\`\`ts
const CHART_WIDTH = 600;
const CHART_HEIGHT = 300;
const PADDING = 40;

let maxValue = $derived(Math.max(...data.map(d => d.value)));

let barWidth = $derived((CHART_WIDTH - PADDING * 2) / data.length - 8);

let bars = $derived(
  data.map((d, i) => ({
    x: PADDING + i * ((CHART_WIDTH - PADDING * 2) / data.length) + 4,
    y: CHART_HEIGHT - PADDING - (d.value / maxValue) * (CHART_HEIGHT - PADDING * 2),
    width: barWidth,
    height: (d.value / maxValue) * (CHART_HEIGHT - PADDING * 2),
    label: d.label,
    value: d.value,
  }))
);
\`\`\`

Each bar's \`y\` position and \`height\` are proportional to its value relative to the maximum. This normalization ensures the tallest bar always touches the top of the chart area, and all others scale proportionally.

## Rendering the Bar Chart

SVG in Svelte is first-class — you write SVG elements directly in your template, and they support the same reactive bindings as HTML elements:

\`\`\`svelte
<svg width={CHART_WIDTH} height={CHART_HEIGHT}>
  {#each bars as bar}
    <rect
      x={bar.x}
      y={bar.y}
      width={bar.width}
      height={bar.height}
      fill="#6366f1"
      rx="4"
    />
    <text
      x={bar.x + bar.width / 2}
      y={CHART_HEIGHT - PADDING + 16}
      text-anchor="middle"
      font-size="12"
    >{bar.label}</text>
    <text
      x={bar.x + bar.width / 2}
      y={bar.y - 6}
      text-anchor="middle"
      font-size="11"
      fill="#64748b"
    >{bar.value.toLocaleString()}</text>
  {/each}
</svg>
\`\`\`

Because \`bars\` is \`$derived\` from \`data\`, changing any value in the data array causes the chart to re-render with updated bar positions. Push a new data point, remove one, or modify a value — the chart responds instantly.

## The Line Graph

A line graph connects data points with a continuous path. The SVG \`<path>\` element accepts a \`d\` attribute describing the line using move (\`M\`) and line-to (\`L\`) commands:

\`\`\`ts
let linePath = $derived(
  data.map((d, i) => {
    const x = PADDING + i * ((CHART_WIDTH - PADDING * 2) / (data.length - 1));
    const y = CHART_HEIGHT - PADDING - (d.value / maxValue) * (CHART_HEIGHT - PADDING * 2);
    return \`\${i === 0 ? 'M' : 'L'} \${x} \${y}\`;
  }).join(' ')
);
\`\`\`

Render it with:

\`\`\`svelte
<path d={linePath} fill="none" stroke="#6366f1" stroke-width="2" />
\`\`\`

Add circles at each data point for interactivity:

\`\`\`svelte
{#each points as point}
  <circle cx={point.x} cy={point.y} r="4" fill="#6366f1" />
{/each}
\`\`\`

## Interactivity: Hover Tooltips

A chart without tooltips forces users to read axis values — tedious and error-prone. We add hover tooltips using \`$state\` to track the hovered data point:

\`\`\`ts
let hoveredIndex = $state<number | null>(null);
\`\`\`

On each bar or circle, add mouse event handlers:

\`\`\`svelte
<rect
  ...
  onmouseenter={() => hoveredIndex = i}
  onmouseleave={() => hoveredIndex = null}
  opacity={hoveredIndex === null || hoveredIndex === i ? 1 : 0.4}
/>
\`\`\`

When a bar is hovered, all other bars fade — a simple but effective visual cue. Display the tooltip as an absolutely positioned HTML element (or an SVG \`<foreignObject>\`) near the hovered bar.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.svg.bindings'
		},
		{
			type: 'text',
			content: `## Your Task: Build Both Charts

Open the starter code. You will find \`BarChart.svelte\` and \`LineChart.svelte\` shells, plus an \`App.svelte\` that hosts both.

1. Complete \`BarChart.svelte\` with \`$derived\` bar positions and SVG \`<rect>\` elements.
2. Complete \`LineChart.svelte\` with a \`$derived\` path string and data point circles.
3. Add hover interactivity to both charts using \`$state\` for the hovered index.
4. Add controls in \`App.svelte\` to modify the data and watch the charts update live.`
		},
		{
			type: 'checkpoint',
			content: 'cp-viz-bar'
		},
		{
			type: 'text',
			content: `## Dynamic Data Controls

Add buttons that let the user manipulate the data: "Add Month" appends a random data point, "Randomize" replaces all values with new random numbers, and "Remove Last" pops the last entry. These controls exercise the reactivity — you modify \`$state\` and both charts update simultaneously because they derive from the same data source.

\`\`\`ts
function addMonth() {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const next = months[data.length - 6] ?? 'New';
  data.push({ label: next, value: Math.floor(Math.random() * 10000) });
}

function randomize() {
  data = data.map(d => ({ ...d, value: Math.floor(Math.random() * 10000) }));
}
\`\`\`

Notice that \`randomize\` reassigns the entire array (creating a new reference) while \`addMonth\` mutates in place. Svelte 5's deep reactivity handles both. However, reassignment is sometimes clearer and avoids gotchas with reference equality.

## Chart Axes

For polish, add y-axis tick marks. Compute five evenly spaced ticks from 0 to maxValue:

\`\`\`ts
let yTicks = $derived(
  Array.from({ length: 5 }, (_, i) => {
    const value = (maxValue / 4) * i;
    const y = CHART_HEIGHT - PADDING - (value / maxValue) * (CHART_HEIGHT - PADDING * 2);
    return { value, y };
  })
);
\`\`\`

Render each tick as a horizontal line and a label on the left. This transforms a bare chart into something that communicates data clearly — a critical detail for dashboard usability.`
		},
		{
			type: 'checkpoint',
			content: 'cp-viz-line'
		},
		{
			type: 'checkpoint',
			content: 'cp-viz-hover'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import BarChart from './BarChart.svelte';
  import LineChart from './LineChart.svelte';

  interface DataPoint {
    label: string;
    value: number;
  }

  let data = $state<DataPoint[]>([
    { label: 'Jan', value: 4200 },
    { label: 'Feb', value: 5800 },
    { label: 'Mar', value: 3900 },
    { label: 'Apr', value: 7100 },
    { label: 'May', value: 6500 },
    { label: 'Jun', value: 8200 },
  ]);

  // TODO: Add functions for addMonth, randomize, removeLast
</script>

<div class="app">
  <h1>Data Visualization</h1>

  <div class="controls">
    <!-- TODO: Add data control buttons -->
  </div>

  <div class="charts">
    <BarChart {data} />
    <LineChart {data} />
  </div>
</div>

<style>
  .app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .charts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
</style>`
		},
		{
			name: 'BarChart.svelte',
			path: '/BarChart.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface DataPoint {
    label: string;
    value: number;
  }

  let { data }: { data: DataPoint[] } = $props();

  const CHART_WIDTH = 500;
  const CHART_HEIGHT = 300;
  const PADDING = 40;

  // TODO: Add $derived maxValue, barWidth, bars
  // TODO: Add $state hoveredIndex for interactivity
</script>

<div class="chart-container">
  <h3>Bar Chart</h3>
  <svg width={CHART_WIDTH} height={CHART_HEIGHT}>
    <!-- TODO: Render bars, labels, and value text -->
  </svg>
</div>

<style>
  .chart-container {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
  }

  h3 {
    margin: 0 0 0.75rem;
    color: #374151;
  }
</style>`
		},
		{
			name: 'LineChart.svelte',
			path: '/LineChart.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface DataPoint {
    label: string;
    value: number;
  }

  let { data }: { data: DataPoint[] } = $props();

  const CHART_WIDTH = 500;
  const CHART_HEIGHT = 300;
  const PADDING = 40;

  // TODO: Add $derived maxValue, points, linePath
  // TODO: Add $state hoveredIndex for interactivity
</script>

<div class="chart-container">
  <h3>Line Chart</h3>
  <svg width={CHART_WIDTH} height={CHART_HEIGHT}>
    <!-- TODO: Render line path and data point circles -->
  </svg>
</div>

<style>
  .chart-container {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
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
			name: 'BarChart.svelte',
			path: '/BarChart.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface DataPoint {
    label: string;
    value: number;
  }

  let { data }: { data: DataPoint[] } = $props();

  const CHART_WIDTH = 500;
  const CHART_HEIGHT = 300;
  const PADDING = 40;

  let hoveredIndex = $state<number | null>(null);

  let maxValue = $derived(Math.max(...data.map(d => d.value)));

  let barWidth = $derived((CHART_WIDTH - PADDING * 2) / data.length - 8);

  let bars = $derived(
    data.map((d, i) => ({
      x: PADDING + i * ((CHART_WIDTH - PADDING * 2) / data.length) + 4,
      y: CHART_HEIGHT - PADDING - (d.value / maxValue) * (CHART_HEIGHT - PADDING * 2),
      width: barWidth,
      height: (d.value / maxValue) * (CHART_HEIGHT - PADDING * 2),
      label: d.label,
      value: d.value,
    }))
  );
</script>

<div class="chart-container">
  <h3>Bar Chart</h3>
  <svg width={CHART_WIDTH} height={CHART_HEIGHT}>
    {#each bars as bar, i}
      <rect
        x={bar.x}
        y={bar.y}
        width={bar.width}
        height={bar.height}
        fill="#6366f1"
        rx="4"
        opacity={hoveredIndex === null || hoveredIndex === i ? 1 : 0.4}
        onmouseenter={() => hoveredIndex = i}
        onmouseleave={() => hoveredIndex = null}
      />
      <text
        x={bar.x + bar.width / 2}
        y={CHART_HEIGHT - PADDING + 16}
        text-anchor="middle"
        font-size="12"
        fill="#374151"
      >{bar.label}</text>
      <text
        x={bar.x + bar.width / 2}
        y={bar.y - 6}
        text-anchor="middle"
        font-size="11"
        fill="#64748b"
      >{bar.value.toLocaleString()}</text>
    {/each}

    <line
      x1={PADDING}
      y1={CHART_HEIGHT - PADDING}
      x2={CHART_WIDTH - PADDING}
      y2={CHART_HEIGHT - PADDING}
      stroke="#e2e8f0"
      stroke-width="1"
    />
  </svg>
</div>

<style>
  .chart-container {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
  }

  h3 {
    margin: 0 0 0.75rem;
    color: #374151;
  }

  rect {
    transition: opacity 0.15s ease;
    cursor: pointer;
  }
</style>`
		},
		{
			name: 'LineChart.svelte',
			path: '/LineChart.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface DataPoint {
    label: string;
    value: number;
  }

  let { data }: { data: DataPoint[] } = $props();

  const CHART_WIDTH = 500;
  const CHART_HEIGHT = 300;
  const PADDING = 40;

  let hoveredIndex = $state<number | null>(null);

  let maxValue = $derived(Math.max(...data.map(d => d.value)));

  let points = $derived(
    data.map((d, i) => ({
      x: PADDING + i * ((CHART_WIDTH - PADDING * 2) / Math.max(data.length - 1, 1)),
      y: CHART_HEIGHT - PADDING - (d.value / maxValue) * (CHART_HEIGHT - PADDING * 2),
      label: d.label,
      value: d.value,
    }))
  );

  let linePath = $derived(
    points.map((p, i) => \`\${i === 0 ? 'M' : 'L'} \${p.x} \${p.y}\`).join(' ')
  );
</script>

<div class="chart-container">
  <h3>Line Chart</h3>
  <svg width={CHART_WIDTH} height={CHART_HEIGHT}>
    <path d={linePath} fill="none" stroke="#6366f1" stroke-width="2" />

    {#each points as point, i}
      <circle
        cx={point.x}
        cy={point.y}
        r={hoveredIndex === i ? 6 : 4}
        fill="#6366f1"
        onmouseenter={() => hoveredIndex = i}
        onmouseleave={() => hoveredIndex = null}
      />
      <text
        x={point.x}
        y={CHART_HEIGHT - PADDING + 16}
        text-anchor="middle"
        font-size="12"
        fill="#374151"
      >{point.label}</text>
      {#if hoveredIndex === i}
        <text
          x={point.x}
          y={point.y - 10}
          text-anchor="middle"
          font-size="11"
          fill="#6366f1"
          font-weight="600"
        >{point.value.toLocaleString()}</text>
      {/if}
    {/each}

    <line
      x1={PADDING}
      y1={CHART_HEIGHT - PADDING}
      x2={CHART_WIDTH - PADDING}
      y2={CHART_HEIGHT - PADDING}
      stroke="#e2e8f0"
      stroke-width="1"
    />
  </svg>
</div>

<style>
  .chart-container {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
  }

  h3 {
    margin: 0 0 0.75rem;
    color: #374151;
  }

  circle {
    transition: r 0.15s ease;
    cursor: pointer;
  }
</style>`
		},
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import BarChart from './BarChart.svelte';
  import LineChart from './LineChart.svelte';

  interface DataPoint {
    label: string;
    value: number;
  }

  let data = $state<DataPoint[]>([
    { label: 'Jan', value: 4200 },
    { label: 'Feb', value: 5800 },
    { label: 'Mar', value: 3900 },
    { label: 'Apr', value: 7100 },
    { label: 'May', value: 6500 },
    { label: 'Jun', value: 8200 },
  ]);

  const extraMonths = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function addMonth() {
    const next = extraMonths[data.length - 6] ?? \`M\${data.length + 1}\`;
    data.push({ label: next, value: Math.floor(Math.random() * 10000) });
  }

  function randomize() {
    data = data.map(d => ({ ...d, value: Math.floor(Math.random() * 10000) }));
  }

  function removeLast() {
    if (data.length > 1) data.pop();
  }
</script>

<div class="app">
  <h1>Data Visualization</h1>

  <div class="controls">
    <button onclick={addMonth}>Add Month</button>
    <button onclick={randomize}>Randomize</button>
    <button onclick={removeLast}>Remove Last</button>
  </div>

  <div class="charts">
    <BarChart {data} />
    <LineChart {data} />
  </div>
</div>

<style>
  .app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .controls button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .controls button:hover {
    background: #4f46e5;
  }

  .charts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-viz-bar',
			description: 'Build a reactive bar chart with $derived bar positions and SVG <rect> elements',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$derived' },
						{ type: 'contains', value: '<rect' },
						{ type: 'contains', value: 'maxValue' }
					]
				}
			},
			hints: [
				'Compute `maxValue` and `bars` array using `$derived`. Each bar object needs x, y, width, and height.',
				'Map each bar to an SVG `<rect>` element. The height should be proportional to value/maxValue.',
				'Use `let bars = $derived(data.map((d, i) => ({ x: ..., y: CHART_HEIGHT - PADDING - (d.value / maxValue) * (CHART_HEIGHT - PADDING * 2), width: barWidth, height: (d.value / maxValue) * (CHART_HEIGHT - PADDING * 2) })))` and render `{#each bars as bar}<rect x={bar.x} y={bar.y} width={bar.width} height={bar.height} fill="#6366f1" />{/each}`.'
			],
			conceptsTested: ['svelte5.runes.derived', 'svelte5.svg.bindings']
		},
		{
			id: 'cp-viz-line',
			description: 'Build a reactive line chart with a $derived SVG path string',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'linePath' },
						{ type: 'contains', value: '<path' },
						{ type: 'contains', value: '<circle' }
					]
				}
			},
			hints: [
				'Compute a `points` array and a `linePath` string using `$derived`. The path uses M (move) and L (line-to) commands.',
				'Render `<path d={linePath} fill="none" stroke="#6366f1" />` and circles at each point.',
				'Use `let linePath = $derived(points.map((p, i) => \\`${i === 0 ? \'M\' : \'L\'} ${p.x} ${p.y}\\`).join(\' \'))` and render `<path d={linePath} />` plus `{#each points as point}<circle cx={point.x} cy={point.y} r="4" />{/each}`.'
			],
			conceptsTested: ['svelte5.runes.derived', 'svelte5.svg.bindings']
		},
		{
			id: 'cp-viz-hover',
			description: 'Add hover interactivity with $state tracking and opacity/size changes',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'hoveredIndex' },
						{ type: 'contains', value: 'onmouseenter' },
						{ type: 'contains', value: 'onmouseleave' }
					]
				}
			},
			hints: [
				'Create `let hoveredIndex = $state<number | null>(null)` to track which data point is hovered.',
				'Add `onmouseenter={() => hoveredIndex = i}` and `onmouseleave={() => hoveredIndex = null}` to bars/circles.',
				'Use `opacity={hoveredIndex === null || hoveredIndex === i ? 1 : 0.4}` on bars and `r={hoveredIndex === i ? 6 : 4}` on circles for visual feedback.'
			],
			conceptsTested: ['svelte5.runes.state']
		}
	]
};
