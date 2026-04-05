import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '16-6',
		title: 'Symbol, WeakMap & Iterators',
		phase: 5,
		module: 16,
		lessonIndex: 6
	},
	description: `Advanced JavaScript primitives are extremely useful once you start building reactive classes and libraries in Svelte 5. Symbols give you unique, collision-free keys — perfect for marking metadata on objects without touching their public shape. WeakMap lets you associate data with objects without preventing garbage collection, ideal for caches and per-instance metadata.

Iterators and generator functions let your classes opt into the for..of protocol. By implementing [Symbol.iterator]() a class becomes iterable, and Array.from or spread will happily walk it. Generators (function*) make writing iterators trivial — \`yield\` values one at a time, even lazily for infinite sequences.

In this lesson we build: a Playlist class that is iterable, a registry using WeakMap for object metadata (so entries vanish when objects are GC'd), and a handful of generator functions producing ranges, Fibonacci, and paginated chunks.`,
	objectives: [
		'Create unique keys with Symbol() and well-known symbols',
		'Implement [Symbol.iterator] to make a class iterable',
		'Write generator functions with function* and yield',
		'Use WeakMap to attach metadata to objects without leaking memory',
		'Combine iterable classes with Svelte {#each} blocks'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // 1) Symbol — unique, collision-free keys
  // ============================================================
  const STATUS = Symbol('status');
  const STATUS_OTHER = Symbol('status');
  const symbolsEqual = (STATUS as unknown) === (STATUS_OTHER as unknown);

  type Tagged = { name: string; [STATUS]?: 'draft' | 'published' };
  const doc: Tagged = { name: 'Intro to Runes' };
  doc[STATUS] = 'draft';

  // ============================================================
  // 2) Iterable class — Playlist implements [Symbol.iterator]
  // ============================================================
  class Track {
    readonly title: string;
    readonly artist: string;
    readonly seconds: number;
    constructor(title: string, artist: string, seconds: number) {
      this.title = title;
      this.artist = artist;
      this.seconds = seconds;
    }
    get formatted(): string {
      const m = Math.floor(this.seconds / 60);
      const s = this.seconds % 60;
      return \`\${m}:\${String(s).padStart(2, '0')}\`;
    }
  }

  class Playlist {
    tracks: Track[] = $state([]);
    name: string;

    constructor(name: string, tracks: Track[] = []) {
      this.name = name;
      this.tracks = tracks;
    }

    add(track: Track): void {
      this.tracks = [...this.tracks, track];
    }

    get totalSeconds(): number {
      return this.tracks.reduce((sum, t) => sum + t.seconds, 0);
    }

    // Making Playlist iterable — for..of and Array.from work
    [Symbol.iterator](): Iterator<Track> {
      let i = 0;
      const tracks = this.tracks;
      return {
        next(): IteratorResult<Track> {
          return i < tracks.length
            ? { value: tracks[i++], done: false }
            : { value: undefined, done: true };
        }
      };
    }
  }

  const playlist = new Playlist('Focus Mix', [
    new Track('Resonance', 'Home', 211),
    new Track('Nightcall', 'Kavinsky', 253),
    new Track('Midnight City', 'M83', 244),
    new Track('Intro', 'The xx', 127)
  ]);

  // Iterate via spread (uses [Symbol.iterator])
  let iteratedTitles = $derived([...playlist].map((t) => t.title).join(', '));

  // ============================================================
  // 3) Generator functions — lazy sequences
  // ============================================================
  function* range(start: number, end: number, step: number = 1): Generator<number> {
    for (let i = start; i < end; i += step) yield i;
  }

  function* fibonacci(limit: number): Generator<number> {
    let [a, b] = [0, 1];
    let count = 0;
    while (count < limit) {
      yield a;
      [a, b] = [b, a + b];
      count++;
    }
  }

  function* chunk<T>(arr: T[], size: number): Generator<T[]> {
    for (let i = 0; i < arr.length; i += size) {
      yield arr.slice(i, i + size);
    }
  }

  let rangeLimit: number = $state(10);
  let fibLimit: number = $state(10);
  let chunkSize: number = $state(3);

  let rangeValues = $derived([...range(0, rangeLimit)]);
  let fibValues = $derived([...fibonacci(fibLimit)]);
  let chunks = $derived([...chunk([...range(1, 16)], chunkSize)]);

  // ============================================================
  // 4) WeakMap — associate data with objects without leaking
  // ============================================================
  type Meta = { createdAt: number; views: number };
  const metadata = new WeakMap<object, Meta>();

  function tagObject(obj: object): void {
    metadata.set(obj, { createdAt: Date.now(), views: 0 });
  }

  function viewObject(obj: object): void {
    const m = metadata.get(obj);
    if (m) m.views += 1;
  }

  let demoObjects: { id: number; label: string }[] = $state([
    { id: 1, label: 'Article A' },
    { id: 2, label: 'Article B' },
    { id: 3, label: 'Article C' }
  ]);
  $effect(() => {
    for (const o of demoObjects) {
      if (!metadata.has(o)) tagObject(o);
    }
  });

  let metaTick: number = $state(0);
  function touch(obj: object): void {
    viewObject(obj);
    metaTick += 1;
  }
  function removeObject(id: number): void {
    demoObjects = demoObjects.filter((o) => o.id !== id);
    // The removed object is no longer referenced — WeakMap entry
    // will be garbage-collected automatically. No cleanup needed!
  }

  function getMeta(obj: object): Meta | undefined {
    metaTick; // create reactive dep
    return metadata.get(obj);
  }

  let nextObjectId: number = $state(4);
  function addObject(): void {
    const letter = String.fromCharCode(64 + nextObjectId);
    demoObjects = [...demoObjects, { id: nextObjectId, label: \`Article \${letter}\` }];
    nextObjectId += 1;
  }
</script>

<h1>Symbol, WeakMap &amp; Iterators</h1>

<section>
  <h2>1. Symbol — unique keys</h2>
  <div class="box">
    <p>
      <code>Symbol('status') === Symbol('status')</code>:
      <strong>{symbolsEqual}</strong>
    </p>
    <p>
      <code>Object.keys(doc)</code>:
      <code>{JSON.stringify(Object.keys(doc))}</code>
      — the Symbol key is invisible.
    </p>
    <p>
      <code>doc[STATUS]</code>: <strong>{doc[STATUS]}</strong>
    </p>
  </div>
</section>

<section>
  <h2>2. Iterable Playlist — Symbol.iterator</h2>
  <div class="playlist">
    <strong>{playlist.name}</strong>
    <ol>
      {#each playlist.tracks as track, i (i)}
        <li>
          <span class="title">{track.title}</span>
          <span class="artist">{track.artist}</span>
          <span class="duration">{track.formatted}</span>
        </li>
      {/each}
    </ol>
    <p class="meta">
      Total: {Math.floor(playlist.totalSeconds / 60)}m {playlist.totalSeconds % 60}s
    </p>
    <p class="meta">
      Spread into array via [...playlist]:
      <em>{iteratedTitles}</em>
    </p>
  </div>
</section>

<section>
  <h2>3. Generator functions — lazy sequences</h2>

  <div class="gen-row">
    <label>
      range(0, n):
      <input type="number" min="1" max="50" bind:value={rangeLimit} />
    </label>
    <div class="numbers">
      {#each rangeValues as n (n)}
        <span class="num">{n}</span>
      {/each}
    </div>
  </div>

  <div class="gen-row">
    <label>
      fibonacci(n):
      <input type="number" min="1" max="30" bind:value={fibLimit} />
    </label>
    <div class="numbers">
      {#each fibValues as n, i (i)}
        <span class="num fib">{n}</span>
      {/each}
    </div>
  </div>

  <div class="gen-row">
    <label>
      chunk([1..15], size):
      <input type="number" min="1" max="10" bind:value={chunkSize} />
    </label>
    <div class="chunks">
      {#each chunks as c, i (i)}
        <div class="chunk">[{c.join(', ')}]</div>
      {/each}
    </div>
  </div>
</section>

<section>
  <h2>4. WeakMap — per-object metadata without leaks</h2>
  <p class="note">
    Metadata is stored in a WeakMap keyed by the object itself. When we
    remove an object from the array, its WeakMap entry becomes eligible
    for garbage collection automatically.
  </p>
  <button class="add" onclick={addObject}>+ Add object</button>
  <div class="objects">
    {#each demoObjects as obj (obj.id)}
      {@const meta = getMeta(obj)}
      <div class="obj-card">
        <div class="obj-label">{obj.label}</div>
        {#if meta}
          <div class="obj-meta">
            Views: <strong>{meta.views}</strong><br />
            Created: {new Date(meta.createdAt).toLocaleTimeString()}
          </div>
        {/if}
        <div class="obj-actions">
          <button onclick={() => touch(obj)}>View</button>
          <button class="danger" onclick={() => removeObject(obj.id)}>x</button>
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #6c5ce7; font-size: 1.05rem; }
  .box { background: white; padding: 0.75rem; border-radius: 6px; }
  .box p { margin: 0.3rem 0; font-size: 0.9rem; }
  code {
    background: #dfe6e9; padding: 0.1rem 0.3rem;
    border-radius: 3px; font-size: 0.8rem;
  }
  .playlist { background: white; padding: 1rem; border-radius: 6px; }
  .playlist ol { margin: 0.5rem 0; padding-left: 1.25rem; }
  .playlist li {
    display: flex; gap: 0.75rem; padding: 0.25rem 0; font-size: 0.9rem;
  }
  .title { flex: 1; font-weight: 600; }
  .artist { color: #636e72; }
  .duration { font-family: monospace; color: #b2bec3; }
  .meta { font-size: 0.8rem; color: #636e72; margin: 0.25rem 0; }
  .gen-row { margin-bottom: 0.75rem; }
  .gen-row label {
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 0.85rem; margin-bottom: 0.3rem;
  }
  .gen-row input {
    width: 4rem; padding: 0.2rem; border: 1px solid #ddd;
    border-radius: 4px; text-align: center;
  }
  .numbers { display: flex; flex-wrap: wrap; gap: 0.25rem; }
  .num {
    display: inline-block; padding: 0.2rem 0.5rem;
    background: #74b9ff; color: white; border-radius: 3px;
    font-size: 0.8rem; font-family: monospace;
  }
  .num.fib { background: #a29bfe; }
  .chunks { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .chunk {
    padding: 0.3rem 0.6rem; background: #55efc4; color: #00695c;
    border-radius: 4px; font-family: monospace; font-size: 0.85rem;
  }
  .note { font-size: 0.85rem; color: #636e72; margin: 0 0 0.75rem 0; }
  .add {
    padding: 0.4rem 0.8rem; background: #00b894; color: white;
    border: none; border-radius: 4px; cursor: pointer;
    font-weight: 600; margin-bottom: 0.75rem;
  }
  .objects {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.5rem;
  }
  .obj-card {
    background: white; padding: 0.75rem; border-radius: 6px;
    border: 1px solid #dfe6e9;
  }
  .obj-label { font-weight: 600; margin-bottom: 0.25rem; color: #2d3436; }
  .obj-meta { font-size: 0.75rem; color: #636e72; margin-bottom: 0.5rem; }
  .obj-actions { display: flex; gap: 0.25rem; }
  .obj-actions button {
    padding: 0.2rem 0.5rem; border: none; border-radius: 3px;
    background: #74b9ff; color: white; cursor: pointer;
    font-size: 0.75rem; font-weight: 600;
  }
  .obj-actions button.danger { background: #ff7675; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
