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

## WHY Media Bindings Are Special

Building a custom audio or video player in vanilla JavaScript is surprisingly tedious. The HTMLMediaElement API has dozens of properties, events, and state machines. Just tracking playback position requires listening to the \`timeupdate\` event, reading \`currentTime\`, and coordinating with a range slider. Seeking requires listening to the slider's \`input\` event and setting \`currentTime\`. Volume requires a separate slider bound to a different property. Pausing requires toggling the \`paused\` property via \`play()\` and \`pause()\` methods (you cannot set \`paused\` directly in the DOM API).

Svelte's media bindings collapse all of this into declarative two-way bindings:

\`\`\`svelte
<audio bind:currentTime bind:duration bind:paused bind:volume />
\`\`\`

Four declarations replace what would be ~40 lines of imperative event listener code.

### Read-Only vs. Read-Write Bindings

Not all media bindings are created equal. Some are **read-write** (you can both read the current value and set it), while others are **read-only** (they reflect the media element's state but cannot be changed by assignment).

**Read-write bindings** (you can set these to control playback):
- \`currentTime\` -- seek to a position by assigning a number
- \`paused\` -- pause or resume by assigning true/false
- \`volume\` -- change volume by assigning 0-1
- \`muted\` -- mute/unmute by assigning boolean
- \`playbackRate\` -- change speed by assigning a number (0.5 = half speed, 2 = double)

**Read-only bindings** (these reflect state you cannot directly set):
- \`duration\` -- total media length in seconds (only known after metadata loads)
- \`buffered\` -- array of buffered time ranges
- \`seeking\` -- whether the media is currently seeking
- \`ended\` -- whether playback has reached the end
- \`readyState\` -- how much data is available (0-4)

### How Media Bindings Differ from Element Bindings

Regular \`bind:value\` compiles to a simple event listener + property assignment. Media bindings are more complex because:

1. **Multiple events needed.** \`currentTime\` changes trigger both \`timeupdate\` (periodic during playback, roughly 4 times per second) and \`seeked\` (after a seek completes) events. Svelte listens to both.

2. **Timing sensitivity.** \`duration\` is \`NaN\` until the media metadata loads. Svelte handles this by only updating the bound variable after the \`loadedmetadata\` event.

3. **Bidirectional control methods.** Setting \`paused = false\` must call \`element.play()\`, not just set a property. The \`paused\` property on HTMLMediaElement is actually read-only in the DOM API -- you control it via \`play()\` and \`pause()\`. Svelte's binding abstracts this into a simple boolean assignment.

4. **Animation frame coordination.** For smooth progress bar updates, Svelte may use \`requestAnimationFrame\` to batch updates rather than firing on every \`timeupdate\` event.

### Building a Custom Player: Architecture Decisions

When building a media player, you face a key architectural question: how much of the player state lives in bindings vs. derived state?

**Bindings** handle the low-level media state: currentTime, duration, paused, volume. These are your source of truth.

**Derived values** compute display-ready data from bindings: formatted time strings, progress percentages, "remaining time" counters. Use \`$derived\` for these:

\`\`\`typescript
let progress = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);
let remaining = $derived(duration - currentTime);
\`\`\`

This separation keeps the template clean and the logic testable.`
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

### The Power of Shared State

Because \`currentTime\` is a regular \`$state\` variable, you can bind it to multiple UI elements simultaneously. A range slider and a progress bar can both read from the same \`currentTime\` variable. Setting \`currentTime\` from the slider automatically updates both the audio playback position and the progress bar -- no manual synchronization needed.

This is a concrete example of how Svelte's reactivity model shines. In vanilla JavaScript, you would need to:
1. Listen to the range slider's \`input\` event
2. Set \`audio.currentTime\` to the slider's value
3. Update the progress bar width
4. Update the time display text

With bindings and derived state, you write:
\`\`\`svelte
<audio bind:currentTime />
<input type="range" bind:value={currentTime} max={duration} />
<div style:width="{progress}%"></div>
<span>{formatTime(currentTime)}</span>
\`\`\`

All four elements stay in sync automatically because they all reference the same reactive variable.

**Your task:** Create a custom audio player with play/pause, a progress bar, and time display. Bind \`currentTime\`, \`duration\`, and \`paused\` to the audio element and use those values to build the player UI.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Seeking with a Range Input

Bind the same \`currentTime\` state to both the audio element and a range input to create a seekable progress bar. This is one of the most elegant examples of Svelte's binding system: two different DOM elements sharing the same reactive variable, each updating the other.

\`\`\`svelte
<input type="range" min="0" max={duration} bind:value={currentTime} step="0.1" />
\`\`\`

### WHY This Works So Well

When the user drags the range slider:
1. The slider's \`input\` event fires
2. \`bind:value\` updates \`currentTime\`
3. The audio element's \`bind:currentTime\` sees the change and seeks to the new position
4. The time display (which references \`currentTime\`) updates

When the audio plays normally:
1. The \`timeupdate\` event fires on the audio element
2. \`bind:currentTime\` updates the \`currentTime\` variable
3. The range slider (which reads \`currentTime\` via \`bind:value\`) moves
4. The time display updates

Both directions work automatically. No event listeners, no manual DOM manipulation, no state synchronization logic.

### Volume Control

Volume works the same way: bind a range input to the same \`volume\` variable that is bound to the audio element:

\`\`\`svelte
<audio bind:volume />
<input type="range" min="0" max="1" bind:value={volume} step="0.01" />
\`\`\`

### Common Pitfalls

1. **Duration is NaN initially.** Before metadata loads, \`duration\` is \`NaN\`. Guard your formatTime function: \`if (isNaN(seconds)) return '0:00'\`.

2. **Autoplay restrictions.** Browsers block autoplay unless the user has interacted with the page. Starting with \`paused = true\` and letting the user click play respects this policy.

3. **Range slider step.** Use \`step="0.1"\` or smaller for smooth seeking. The default step of 1 creates jerky seeking in short audio clips.

**Task:** Add a range slider that lets users seek to any position in the audio, and add a volume control. Verify that dragging the seek slider immediately changes the playback position.`
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
