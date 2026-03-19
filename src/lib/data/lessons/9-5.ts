import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '9-5',
		title: 'Files, Dimensions & DOM References',
		phase: 3,
		module: 9,
		lessonIndex: 5
	},
	description: `Some bindings go beyond simple values. File inputs use bind:files to give you a FileList. Dimension bindings like bind:clientWidth and bind:clientHeight let you read the pixel dimensions of any block-level element reactively. These read-only bindings update automatically when the element resizes.

This lesson covers these specialized bindings that bridge the gap between Svelte's reactive world and the browser's DOM APIs.`,
	objectives: [
		'Use bind:files on file inputs to access selected files',
		'Read element dimensions reactively with bind:clientWidth and bind:clientHeight',
		'Understand which dimension bindings are available and their read-only nature',
		'Combine file and dimension bindings in a practical example'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // File input binding gives you a FileList
  let files: FileList | undefined = $state();

  // Dimension bindings (read-only, updated automatically)
  let boxWidth: number = $state(0);
  let boxHeight: number = $state(0);

  // Derive file info from the bound FileList
  let fileInfo = $derived(
    files && files.length > 0
      ? Array.from(files).map((f) => ({
          name: f.name,
          size: (f.size / 1024).toFixed(1) + ' KB',
          type: f.type || 'unknown'
        }))
      : []
  );

  let resizableText: string = $state('Resize the browser window and watch the dimensions update in real time. This box will report its own width and height.');
</script>

<main>
  <h1>Files, Dimensions & DOM References</h1>

  <!-- File input with bind:files -->
  <section>
    <h2>File Input (bind:files)</h2>
    <input type="file" bind:files multiple accept="image/*,.pdf,.txt" />

    {#if fileInfo.length > 0}
      <ul>
        {#each fileInfo as file}
          <li>
            <strong>{file.name}</strong> — {file.size} ({file.type})
          </li>
        {/each}
      </ul>
    {:else}
      <p>No files selected</p>
    {/if}
  </section>

  <!-- Dimension bindings -->
  <section>
    <h2>Dimension Bindings</h2>
    <div
      class="measured-box"
      bind:clientWidth={boxWidth}
      bind:clientHeight={boxHeight}
    >
      <textarea bind:value={resizableText} rows={4}></textarea>
    </div>
    <p>
      Box dimensions: <strong>{boxWidth}px</strong> × <strong>{boxHeight}px</strong>
    </p>
    <p><em>Try resizing the window or editing the text to see dimensions change</em></p>
  </section>
</main>

<style>
  main { max-width: 550px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  .measured-box {
    padding: 1rem;
    background: #f0f4ff;
    border: 2px dashed #6690ff;
    border-radius: 4px;
  }
  textarea { width: 100%; box-sizing: border-box; font-size: 1rem; padding: 0.5rem; }
  ul { padding-left: 1.25rem; }
  li { margin: 0.25rem 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
