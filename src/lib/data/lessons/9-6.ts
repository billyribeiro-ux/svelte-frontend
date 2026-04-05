import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '9-6',
		title: 'Contenteditable & Special Bindings',
		phase: 3,
		module: 9,
		lessonIndex: 6
	},
	description: `A handful of bindings exist for elements that aren't traditional form controls. Any element with \`contenteditable="true"\` supports **\`bind:innerHTML\`**, **\`bind:textContent\`**, and **\`bind:innerText\`** — perfect for rich text editors, inline-editable titles, or note-taking UIs. Media elements (\`<audio>\` and \`<video>\`) expose a suite of bindings for playback: \`bind:currentTime\`, \`bind:duration\`, \`bind:paused\`, \`bind:volume\`, \`bind:muted\`, \`bind:playbackRate\`, \`bind:ended\`, \`bind:played\`, \`bind:buffered\`, \`bind:seekable\`, and \`bind:readyState\`.

**Security note:** \`bind:innerHTML\` captures whatever HTML the user's browser produces. If you ever render that HTML back with \`{@html ...}\` in another context, sanitise it first — libraries like DOMPurify are the standard choice. In this lesson we only render markdown that *we* generated from escaped text, so \`{@html}\` is safe.

This lesson builds three editors (rich HTML, plain text, mini-markdown) and a full audio player where every knob is a two-way binding, so you can see media state flowing both directions at once.`,
	objectives: [
		'Use bind:innerHTML to capture rich content from a contenteditable element',
		'Understand the difference between bind:innerHTML, bind:textContent, and bind:innerText',
		'Know when user HTML must be sanitised and when it is safe',
		'Bind currentTime, duration, paused, volume, muted, and playbackRate on media elements',
		'Build a working audio/video player where every control is a bind:*'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // Contenteditable and media bindings
  // ============================================================
  //
  // Contenteditable elements (divs with contenteditable="true")
  // support three bindings:
  //
  //   bind:innerHTML    — the HTML content (string)
  //   bind:textContent  — plain text (HTML stripped)
  //   bind:innerText    — rendered text (respects CSS)
  //
  // SECURITY: innerHTML bypasses Svelte's usual text escaping.
  // NEVER write user-supplied HTML straight into another element
  // via {@html ...} without sanitising first (use DOMPurify or
  // a server-side allowlist). Within bind:innerHTML the risk is
  // lower because the user is editing their OWN document in
  // place, but if you later display that HTML elsewhere, sanitise.
  //
  // Media elements (<audio>, <video>) expose a whole suite of
  // bindings:
  //
  //   bind:currentTime  — playback position in seconds (read/write)
  //   bind:duration     — total length in seconds   (read-only)
  //   bind:paused       — boolean playback state    (read/write)
  //   bind:played       — TimeRanges of watched bits (read-only)
  //   bind:buffered     — TimeRanges of buffered bits
  //   bind:seekable     — TimeRanges available to seek
  //   bind:volume       — 0..1 audio volume         (read/write)
  //   bind:muted        — boolean                    (read/write)
  //   bind:playbackRate — playback speed multiplier
  //   bind:ended        — boolean (read-only)
  //   bind:readyState   — 0..4    (read-only)

  // --- Rich contenteditable with bind:innerHTML -------------
  let richContent: string = $state(
    '<p>This is an editable area. Try <b>bold</b>, <i>italic</i>, and pasting content!</p>'
  );

  // --- Plain contenteditable with bind:textContent ----------
  let plainContent: string = $state('Plain text only — HTML tags are stripped');

  // --- Markdown-ish live preview ----------------------------
  let markdownish: string = $state(
    'Type some text. Lines starting with # become headings, ' +
    '*asterisks* become italics, and **double asterisks** become bold.'
  );

  // Tiny, safe renderer (no HTML from user — we generate the
  // tags ourselves, so there's nothing to sanitise).
  function renderMarkdown(src: string): string {
    const escape = (s: string) =>
      s.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return src
      .split('\\n')
      .map((line) => {
        const safe = escape(line);
        if (line.startsWith('# ')) return '<h3>' + escape(line.slice(2)) + '</h3>';
        return '<p>' + safe
          .replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>')
          .replace(/\\*([^*]+)\\*/g, '<em>$1</em>') + '</p>';
      })
      .join('');
  }

  const rendered: string = $derived(renderMarkdown(markdownish));

  // --- Audio element with real media bindings ---------------
  // Using a tiny silent tone generated as a data URI so the
  // lesson works without network access. In a real app this
  // would be a normal <audio src="..."> or <video src="...">.
  let currentTime: number = $state(0);
  let duration: number = $state(0);
  let paused: boolean = $state(true);
  let volume: number = $state(0.75);
  let muted: boolean = $state(false);
  let playbackRate: number = $state(1);

  function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + secs.toString().padStart(2, '0');
  }

  // A small silent MP3 data URL (works offline in the browser).
  const audioSrc =
    'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7097v+S3d//';

  const progress = $derived(
    duration > 0 ? (currentTime / duration) * 100 : 0
  );
</script>

<main>
  <h1>Contenteditable &amp; Special Bindings</h1>
  <p class="lede">
    Some elements go beyond traditional form inputs.
    Contenteditable divs, audio/video players, and range
    sliders all speak fluent <code>bind:*</code>.
  </p>

  <section>
    <h2>1. <code>bind:innerHTML</code> on contenteditable</h2>
    <div class="editor"
      contenteditable="true"
      bind:innerHTML={richContent}
    ></div>

    <details>
      <summary>Raw HTML stored in <code>richContent</code></summary>
      <pre>{richContent}</pre>
    </details>

    <p class="warn">
      <strong>Security:</strong> <code>bind:innerHTML</code>
      captures whatever the browser considers the element's HTML.
      If you render that HTML elsewhere via <code>{'{@html ...}'}</code>,
      sanitise it first with a library like
      <code>DOMPurify</code>. Never trust user HTML.
    </p>
  </section>

  <section>
    <h2>2. <code>bind:textContent</code></h2>
    <div class="editor"
      contenteditable="true"
      bind:textContent={plainContent}
    ></div>
    <p class="echo">
      Text: <code>"{plainContent}"</code>
    </p>
    <p class="hint">
      <code>textContent</code> captures only the plain text —
      try pasting formatted content and watch the formatting
      vanish.
    </p>
  </section>

  <section>
    <h2>3. Mini markdown live preview</h2>
    <div class="split">
      <textarea bind:value={markdownish} rows="6"></textarea>
      <div class="preview">{@html rendered}</div>
    </div>
    <p class="hint">
      We generate the HTML ourselves from a <code>$derived</code>
      — user input is escaped first, so <code>{'{@html}'}</code>
      is safe here.
    </p>
  </section>

  <section>
    <h2>4. Media bindings on a real <code>&lt;audio&gt;</code></h2>
    <audio
      src={audioSrc}
      bind:currentTime
      bind:duration
      bind:paused
      bind:volume
      bind:muted
      bind:playbackRate
      preload="metadata"
    ></audio>

    <div class="player">
      <button type="button" onclick={() => (paused = !paused)}>
        {paused ? 'Play' : 'Pause'}
      </button>

      <div class="track">
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.01"
          bind:value={currentTime}
          disabled={!duration}
        />
        <div class="times">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>

    <div class="knobs">
      <label>
        Volume {Math.round(volume * 100)}%
        <input type="range" min="0" max="1" step="0.01" bind:value={volume} />
      </label>
      <label>
        Speed {playbackRate}×
        <input type="range" min="0.5" max="2" step="0.1" bind:value={playbackRate} />
      </label>
      <label>
        <input type="checkbox" bind:checked={muted} />
        Muted
      </label>
    </div>

    <div class="progress"><div style="width: {progress}%"></div></div>

    <p class="hint">
      Every knob on this player is a <code>bind:*</code>.
      <code>bind:duration</code> is read-only (the browser
      tells us after loading metadata), but
      <code>currentTime</code>, <code>volume</code>, and
      <code>paused</code> are all two-way — set them and the
      media element obeys.
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
  h2 { margin: 0 0 0.6rem; font-size: 1rem; }
  .editor {
    min-height: 4rem;
    padding: 0.75rem 1rem;
    border: 2px solid #6690ff;
    border-radius: 6px;
    background: #fafbff;
    outline: none;
  }
  .editor:focus { background: #fff; box-shadow: 0 0 0 3px rgba(102, 144, 255, 0.2); }
  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.78rem;
    overflow-x: auto;
    white-space: pre-wrap;
  }
  details { margin: 0.5rem 0; }
  summary { cursor: pointer; font-size: 0.85rem; color: #4b5563; }
  .warn {
    font-size: 0.78rem;
    padding: 0.6rem 0.8rem;
    background: #fef3c7;
    color: #78350f;
    border-left: 3px solid #f59e0b;
    border-radius: 3px;
    margin-top: 0.6rem;
  }
  .hint {
    font-size: 0.78rem;
    color: #6b7280;
    margin-top: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #f9fafb;
    border-left: 3px solid #6690ff;
    border-radius: 3px;
  }
  .echo { font-size: 0.85rem; margin: 0.5rem 0; }
  .split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .split textarea {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-family: ui-monospace, monospace;
    font-size: 0.85rem;
    resize: vertical;
  }
  .preview {
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    background: #fafafa;
    font-size: 0.9rem;
  }
  .preview :global(h3) { margin: 0.3rem 0; font-size: 1.05rem; }
  .preview :global(p) { margin: 0.3rem 0; }
  .player {
    display: flex; align-items: center; gap: 0.75rem;
    margin-bottom: 0.6rem;
  }
  .track { flex: 1; }
  .track input[type="range"] { width: 100%; }
  .times {
    display: flex; justify-content: space-between;
    font-size: 0.75rem; color: #6b7280;
    font-variant-numeric: tabular-nums;
  }
  .knobs {
    display: flex; flex-wrap: wrap; gap: 1rem;
    align-items: center;
    font-size: 0.78rem;
    color: #4b5563;
  }
  .knobs label { display: flex; flex-direction: column; gap: 0.2rem; min-width: 10rem; }
  .progress {
    height: 0.3rem;
    background: #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
    margin-top: 0.5rem;
  }
  .progress div {
    height: 100%;
    background: #6690ff;
    transition: width 0.1s;
  }
  button {
    padding: 0.55rem 1.1rem;
    font-size: 0.95rem;
    border: 1px solid #6690ff;
    background: #6690ff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    min-width: 4.5rem;
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
