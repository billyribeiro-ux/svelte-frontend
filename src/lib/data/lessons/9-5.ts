import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '9-5',
		title: 'Files, Dimensions & DOM References',
		phase: 3,
		module: 9,
		lessonIndex: 5
	},
	description: `Not every binding is about a simple value. Svelte also exposes bindings that bridge the reactive world to browser APIs you'd normally reach via imperative code:

- **\`bind:files\`** — reads the \`FileList\` from an \`<input type="file">\`. Use \`Array.from()\` or \`[...files]\` to iterate.
- **\`bind:clientWidth\` / \`bind:clientHeight\`** — the element's live pixel dimensions, backed by a \`ResizeObserver\`. Read-only. No need to listen for \`window.resize\`.
- **\`bind:offsetWidth\` / \`bind:offsetHeight\` / \`bind:contentRect\`** — other shapes of the same idea.
- **\`bind:this\`** — a direct reference to the DOM node itself, so you can call \`.focus()\`, \`.getContext()\`, \`.scrollIntoView()\`, or any other imperative API.

This lesson builds a file upload with image previews and automatic object URL cleanup, a live-measured resizable box, an input you can focus from a button, and a canvas you draw into via \`bind:this\`. It also covers the memory-leak pitfall of \`URL.createObjectURL\` and how to fix it with an \`$effect\` cleanup.`,
	objectives: [
		'Use bind:files to read FileList from an <input type="file">',
		'Iterate a FileList via Array.from() and derive preview data with $derived',
		'Create and properly revoke object URLs for image previews',
		'Use bind:clientWidth / bind:clientHeight for live element dimensions',
		'Use bind:this to obtain a direct HTMLElement reference',
		'Call imperative DOM APIs (focus, getContext, scrollIntoView) through bind:this'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // Files, dimensions, and bind:this
  // ============================================================
  //
  // Some bindings go beyond "value":
  //
  //   bind:files            — the FileList from <input type="file">
  //   bind:clientWidth      — element pixel width  (read-only)
  //   bind:clientHeight     — element pixel height (read-only)
  //   bind:offsetWidth      — including borders
  //   bind:offsetHeight     — including borders
  //   bind:contentRect      — a DOMRectReadOnly with everything
  //   bind:contentBoxSize   — ResizeObserver-style box info
  //   bind:this             — a direct reference to the DOM node
  //
  // The dimension bindings update automatically via
  // ResizeObserver — you do NOT need to listen for window
  // resize events. They're read-only, so writing to them
  // doesn't do anything.
  //
  // bind:this is how you reach out and touch the DOM
  // imperatively: focus an input, play a video, measure a
  // canvas, etc.

  // --- File input -------------------------------------------
  let files: FileList | null = $state(null);

  type Preview = {
    name: string;
    size: string;
    type: string;
    isImage: boolean;
    url: string | null;
  };

  // Convert the FileList into a stable array of preview data.
  // Object URLs are created lazily and revoked in an $effect
  // cleanup so we don't leak memory.
  const previews: Preview[] = $derived.by(() => {
    if (!files) return [];
    return Array.from(files).map((f) => ({
      name: f.name,
      size: formatSize(f.size),
      type: f.type || 'unknown',
      isImage: f.type.startsWith('image/'),
      url: f.type.startsWith('image/') ? URL.createObjectURL(f) : null
    }));
  });

  $effect(() => {
    // Cleanup: revoke object URLs when previews change or the
    // component unmounts.
    return () => {
      for (const p of previews) {
        if (p.url) URL.revokeObjectURL(p.url);
      }
    };
  });

  function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  const totalSize: number = $derived(
    files ? Array.from(files).reduce((sum, f) => sum + f.size, 0) : 0
  );

  // --- Dimension bindings ------------------------------------
  let boxWidth: number = $state(0);
  let boxHeight: number = $state(0);
  let resizableText: string = $state(
    'Edit this text or drag the resize handle in the corner. ' +
    'Svelte updates boxWidth and boxHeight in real time via a ' +
    'ResizeObserver — no manual event listeners required.'
  );

  // --- bind:this -------------------------------------------
  let inputEl: HTMLInputElement | null = $state(null);
  let canvasEl: HTMLCanvasElement | null = $state(null);
  let videoEl: HTMLDivElement | null = $state(null);

  function focusInput() {
    inputEl?.focus();
    inputEl?.select();
  }

  function drawCanvas() {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvasEl;
    ctx.clearRect(0, 0, width, height);
    // Draw a gradient circle at a random position.
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = 20 + Math.random() * 40;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'hsl(' + Math.floor(Math.random() * 360) + ' 80% 60%)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  $effect(() => {
    // Draw something on mount.
    if (canvasEl) drawCanvas();
  });

  function scrollToVideo() {
    videoEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
</script>

<main>
  <h1>Files, Dimensions &amp; DOM References</h1>
  <p class="lede">
    Bindings that bridge Svelte's reactive state to the DOM:
    <code>bind:files</code> gives you a <code>FileList</code>,
    <code>bind:clientWidth</code>/<code>clientHeight</code>
    expose live element dimensions, and <code>bind:this</code>
    hands you the raw node so you can call imperative APIs.
  </p>

  <section>
    <h2>1. <code>bind:files</code></h2>
    <label class="drop">
      <input
        type="file"
        multiple
        accept="image/*,.pdf,.txt,.md"
        bind:files
      />
      <span>Choose files (images are previewed)</span>
    </label>

    {#if previews.length > 0}
      <p class="meta">
        {previews.length} files ·
        <strong>{formatSize(totalSize)}</strong> total
      </p>
      <ul class="files">
        {#each previews as file (file.name)}
          <li>
            {#if file.isImage && file.url}
              <img src={file.url} alt={file.name} />
            {:else}
              <div class="icon">{file.type.includes('pdf') ? 'PDF' : 'TXT'}</div>
            {/if}
            <div>
              <strong>{file.name}</strong><br />
              <span class="muted">{file.size} · {file.type}</span>
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="muted">No files selected.</p>
    {/if}

    <p class="hint">
      <code>bind:files</code> is shorthand for
      <code>bind:files={files}</code>. The bound value is a
      <code>FileList | null</code>. Wrap it in
      <code>Array.from()</code> to iterate.
    </p>
  </section>

  <section>
    <h2>2. <code>bind:clientWidth</code> &amp; <code>bind:clientHeight</code></h2>
    <div
      class="measured"
      bind:clientWidth={boxWidth}
      bind:clientHeight={boxHeight}
    >
      <textarea bind:value={resizableText} rows="4"></textarea>
    </div>
    <p class="meta">
      Size: <strong>{boxWidth} × {boxHeight}px</strong>
      ({(boxWidth * boxHeight).toLocaleString()} pixels)
    </p>
    <p class="hint">
      Backed by <code>ResizeObserver</code>. Edit the textarea,
      resize the window, or change the font — the values update
      automatically. They are <strong>read-only</strong>:
      assigning to them has no effect.
    </p>
  </section>

  <section>
    <h2>3. <code>bind:this</code> — imperative DOM access</h2>
    <input
      bind:this={inputEl}
      type="text"
      placeholder="Click the button to focus and select me"
    />
    <button type="button" onclick={focusInput}>Focus &amp; select</button>
    <p class="hint">
      <code>bind:this={'{inputEl}'}</code> gives you the actual
      <code>HTMLInputElement</code> once it's mounted. You can
      call <code>.focus()</code>, <code>.select()</code>,
      <code>.scrollIntoView()</code>, or anything else the DOM
      API offers.
    </p>
  </section>

  <section>
    <h2>4. <code>bind:this</code> on a <code>&lt;canvas&gt;</code></h2>
    <canvas bind:this={canvasEl} width="400" height="160"></canvas>
    <button type="button" onclick={drawCanvas}>Draw a blob</button>
    <p class="hint">
      Canvas and WebGL are inherently imperative — you need a
      real element reference to call <code>getContext()</code>.
      <code>bind:this</code> is the bridge.
    </p>
  </section>

  <section>
    <h2>5. Scrolling to an element</h2>
    <button type="button" onclick={scrollToVideo}>
      Scroll to the placeholder below
    </button>
    <div style="height: 200px;"></div>
    <div
      bind:this={videoEl}
      class="video-placeholder"
    >
      (pretend this is a &lt;video&gt; element)
    </div>
    <p class="hint">
      Real <code>&lt;video&gt;</code> and <code>&lt;audio&gt;</code>
      elements also support <code>bind:currentTime</code>,
      <code>bind:paused</code>, <code>bind:volume</code>, and
      <code>bind:duration</code> — covered in the next lesson.
    </p>
  </section>
</main>

<style>
  main { max-width: 780px; margin: 0 auto; padding: 1.25rem; font-family: system-ui, sans-serif; }
  h1 { margin-top: 0; }
  .lede { color: #555; }
  section {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
  }
  h2 { margin: 0 0 0.75rem; font-size: 1rem; }
  .drop {
    display: block;
    padding: 1.25rem;
    border: 2px dashed #9ca3af;
    border-radius: 8px;
    background: #f9fafb;
    text-align: center;
    cursor: pointer;
    transition: all 0.15s;
  }
  .drop:hover { background: #f3f4f6; border-color: #6690ff; }
  .drop input[type="file"] { display: block; margin: 0 auto 0.5rem; }
  .meta { font-size: 0.85rem; color: #4b5563; margin: 0.5rem 0; }
  .muted { color: #9ca3af; font-size: 0.8rem; }
  .hint {
    font-size: 0.78rem;
    color: #6b7280;
    margin-top: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #f9fafb;
    border-left: 3px solid #6690ff;
    border-radius: 3px;
  }
  .files { list-style: none; padding: 0; margin: 0.5rem 0 0; display: flex; flex-direction: column; gap: 0.5rem; }
  .files li {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #fafafa;
  }
  .files img {
    width: 56px; height: 56px;
    object-fit: cover;
    border-radius: 4px;
  }
  .icon {
    width: 56px; height: 56px;
    display: flex; align-items: center; justify-content: center;
    background: #e5e7eb;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #4b5563;
  }
  .measured {
    resize: both;
    overflow: auto;
    padding: 1rem;
    min-width: 200px;
    min-height: 80px;
    width: 100%;
    max-width: 100%;
    background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
    border: 2px solid #6690ff;
    border-radius: 6px;
    box-sizing: border-box;
  }
  .measured textarea {
    width: 100%;
    min-height: 80px;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.9rem;
    resize: none;
    outline: none;
  }
  canvas {
    display: block;
    width: 100%;
    max-width: 400px;
    height: auto;
    background: #111827;
    border-radius: 6px;
  }
  input[type="text"] {
    width: 100%;
    padding: 0.5rem 0.65rem;
    font-size: 0.95rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    box-sizing: border-box;
    margin-bottom: 0.5rem;
  }
  button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    border: 1px solid #6690ff;
    border-radius: 4px;
    background: #6690ff;
    color: white;
    cursor: pointer;
  }
  button:hover { background: #4f75d6; }
  .video-placeholder {
    padding: 2rem;
    background: #0f172a;
    color: #94a3b8;
    border-radius: 6px;
    text-align: center;
    font-style: italic;
  }
  code {
    background: #f3f4f6;
    padding: 0 0.3rem;
    border-radius: 3px;
    font-size: 0.85em;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
