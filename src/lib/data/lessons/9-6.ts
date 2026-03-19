import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '9-6',
		title: 'Contenteditable & Special Bindings',
		phase: 3,
		module: 9,
		lessonIndex: 6
	},
	description: `Svelte supports binding to contenteditable elements, giving you rich text editing with bind:innerHTML or bind:textContent. These bindings let you capture user edits in a div or paragraph without traditional input elements. Additionally, media elements like <audio> and <video> expose bindings for currentTime, duration, paused, and volume.

This lesson explores these specialized bindings that unlock advanced interactivity beyond standard form controls.`,
	objectives: [
		'Use bind:innerHTML on contenteditable elements for rich text editing',
		'Understand the difference between bind:innerHTML and bind:textContent',
		'Learn about audio/video element bindings for media playback control',
		'Combine contenteditable bindings with reactive display'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Contenteditable bindings
  let richContent: string = $state('<b>Bold</b> and <em>italic</em> text');
  let plainContent: string = $state('Just plain text here');

  // Simulated media state (audio/video bindings work on real media elements)
  let currentTime: number = $state(0);
  let duration: number = $state(120);
  let paused: boolean = $state(true);
  let volume: number = $state(0.75);

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + secs.toString().padStart(2, '0');
  }
</script>

<main>
  <h1>Contenteditable & Special Bindings</h1>

  <!-- bind:innerHTML on contenteditable -->
  <section>
    <h2>bind:innerHTML</h2>
    <div
      class="editable"
      contenteditable="true"
      bind:innerHTML={richContent}
    ></div>
    <h3>Raw HTML:</h3>
    <pre>{richContent}</pre>
  </section>

  <!-- bind:textContent on contenteditable -->
  <section>
    <h2>bind:textContent</h2>
    <div
      class="editable"
      contenteditable="true"
      bind:textContent={plainContent}
    ></div>
    <p>Text content: "{plainContent}"</p>
    <p><em>HTML tags are stripped — only plain text is captured</em></p>
  </section>

  <!-- Audio/Video binding concepts -->
  <section>
    <h2>Media Bindings (Concept)</h2>
    <p><em>Audio/video elements support these bindings:</em></p>
    <div class="media-demo">
      <label>
        Current Time: {formatTime(currentTime)} / {formatTime(duration)}
        <input type="range" bind:value={currentTime} min={0} max={duration} step={1} />
      </label>
      <label>
        Volume: {Math.round(volume * 100)}%
        <input type="range" bind:value={volume} min={0} max={1} step={0.01} />
      </label>
      <button onclick={() => paused = !paused}>
        {paused ? '▶ Play' : '⏸ Pause'}
      </button>
      <p><em>On a real &lt;audio&gt; or &lt;video&gt;, use bind:currentTime, bind:duration, bind:paused, bind:volume</em></p>
    </div>
  </section>
</main>

<style>
  main { max-width: 550px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  .editable {
    border: 2px solid #6690ff;
    border-radius: 4px;
    padding: 0.75rem;
    min-height: 3rem;
    background: #fafbff;
  }
  pre { background: #f5f5f5; padding: 0.5rem; overflow-x: auto; font-size: 0.85rem; }
  .media-demo label { display: block; margin: 0.5rem 0; }
  .media-demo input[type="range"] { width: 100%; }
  button { padding: 0.5rem 1rem; cursor: pointer; font-size: 1rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
