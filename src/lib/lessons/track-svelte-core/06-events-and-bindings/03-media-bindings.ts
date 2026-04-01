import type { Lesson } from '$types/lesson';

export const mediaBindings: Lesson = {
	id: 'svelte-core.events-and-bindings.media-bindings',
	slug: 'media-bindings',
	title: 'Media Bindings',
	description:
		'Control video and audio elements with bindings for currentTime, duration, paused, and more.',
	trackId: 'svelte-core',
	moduleId: 'events-and-bindings',
	order: 3,
	estimatedMinutes: 12,
	concepts: ['svelte5.bindings.media', 'svelte5.bindings.audio-video'],
	prerequisites: ['svelte5.bindings.value', 'svelte5.runes.state'],

	content: [
		{
			type: 'text',
			content: `# Media Bindings

Svelte provides special bindings for \`<audio>\` and \`<video>\` elements that make building custom media players straightforward. You can bind to properties like \`currentTime\`, \`duration\`, \`paused\`, and \`volume\`.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.bindings.media'
		},
		{
			type: 'text',
			content: `## Audio/Video Bindings

\`\`\`svelte
<script lang="ts">
  let currentTime = $state(0);
  let duration = $state(0);
  let paused = $state(true);
</script>

<audio
  src="https://sveltejs.github.io/assets/music/strauss.mp3"
  bind:currentTime
  bind:duration
  bind:paused
/>
\`\`\`

Available bindings include:
- \`currentTime\` — current playback position (read/write)
- \`duration\` — total length (read-only)
- \`paused\` — whether playback is paused (read/write)
- \`volume\` — volume level 0-1 (read/write)
- \`muted\` — whether muted (read/write)

**Your task:** Create a custom audio player with play/pause, a progress bar, and time display.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Seeking with a Range Input

Bind the same \`currentTime\` state to both the audio element and a range input to create a seekable progress bar.

\`\`\`svelte
<input type="range" min="0" max={duration} bind:value={currentTime} step="0.1" />
\`\`\`

**Task:** Add a range slider that lets users seek to any position in the audio, and add a volume control.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let currentTime = $state(0);
  let duration = $state(0);
  let paused = $state(true);
  let volume = $state(0.5);

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + String(s).padStart(2, '0');
  }
</script>

<div>
  <h2>Custom Audio Player</h2>

  <!-- TODO: Add audio element with bindings -->

  <!-- TODO: Add play/pause button -->

  <!-- TODO: Add time display -->

  <!-- TODO: Add seek slider -->

  <!-- TODO: Add volume slider -->
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
    max-width: 400px;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 1rem 0;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  input[type="range"] {
    flex: 1;
  }

  .time {
    font-size: 0.875rem;
    color: #6b7280;
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
  let currentTime = $state(0);
  let duration = $state(0);
  let paused = $state(true);
  let volume = $state(0.5);

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + String(s).padStart(2, '0');
  }
</script>

<div>
  <h2>Custom Audio Player</h2>

  <audio
    src="https://sveltejs.github.io/assets/music/strauss.mp3"
    bind:currentTime
    bind:duration
    bind:paused
    bind:volume
  ></audio>

  <div class="controls">
    <button onclick={() => paused = !paused}>
      {paused ? 'Play' : 'Pause'}
    </button>
    <span class="time">{formatTime(currentTime)} / {formatTime(duration)}</span>
  </div>

  <div class="controls">
    <span>Seek</span>
    <input type="range" min="0" max={duration} bind:value={currentTime} step="0.1" />
  </div>

  <div class="controls">
    <span>Volume</span>
    <input type="range" min="0" max="1" bind:value={volume} step="0.01" />
  </div>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
    max-width: 400px;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 1rem 0;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  input[type="range"] {
    flex: 1;
  }

  .time {
    font-size: 0.875rem;
    color: #6b7280;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create an audio element with bind:currentTime, bind:duration, and bind:paused',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'bind:currentTime' },
						{ type: 'contains', value: 'bind:duration' },
						{ type: 'contains', value: 'bind:paused' }
					]
				}
			},
			hints: [
				'Add an `<audio>` element with a `src` attribute and media bindings.',
				'Bind all three: `bind:currentTime`, `bind:duration`, and `bind:paused`.',
				'`<audio src="..." bind:currentTime bind:duration bind:paused></audio>` and a button toggling `paused`.'
			],
			conceptsTested: ['svelte5.bindings.media']
		},
		{
			id: 'cp-2',
			description: 'Add seek and volume range sliders',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'type="range".*bind:value=\\{currentTime\\}' },
						{ type: 'regex', value: 'type="range".*bind:value=\\{volume\\}' }
					]
				}
			},
			hints: [
				'Use `<input type="range" bind:value={currentTime}>` for seeking.',
				'Set `min="0"` and `max={duration}` on the seek slider.',
				'Add a second range input with `bind:value={volume}` and `max="1"` for volume control.'
			],
			conceptsTested: ['svelte5.bindings.media', 'svelte5.bindings.audio-video']
		}
	]
};
