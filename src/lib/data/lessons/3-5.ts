import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '3-5',
		title: 'String Methods',
		phase: 1,
		module: 3,
		lessonIndex: 5
	},
	description: `Strings are everywhere in a web app — form inputs, API responses, URLs, display text, user messages. JavaScript gives you a rich toolkit for working with them, but there's one crucial thing to remember up front: **strings are immutable**. Every method returns a *new* string; none of them modify the original. That's why you must always assign the result somewhere (\`const upper = text.toUpperCase()\`) — calling a method and throwing the result away is one of the most common beginner bugs.

The toolkit divides roughly into four groups. **Transformation** methods (\`trim\`, \`toUpperCase\`, \`toLowerCase\`, \`slice\`) produce a modified copy. **Search** methods (\`includes\`, \`indexOf\`, \`startsWith\`, \`endsWith\`) answer questions about content. **Modification** methods (\`replace\`, \`replaceAll\`, \`split\`, \`padStart\`) restructure text. And **template literals** (the backtick-strings with \`\${...}\`) let you build strings dynamically by embedding expressions.

A few things trip people up. \`.replace(str, ...)\` only replaces the *first* match — if you want all matches, use \`.replaceAll()\` (or a regex with the \`g\` flag, covered in the next lesson). \`.split(' ')\` breaks on single spaces only; for any whitespace use \`.split(/\\s+/)\`. And \`.indexOf\` returns \`-1\` when not found, which is awkward in boolean contexts — prefer \`.includes()\` for yes/no questions.

Real-world string work usually comes down to pipelines. Building a URL slug? Lowercase, replace non-alphanumerics with dashes, trim dashes at the ends. Counting words? Trim, split on whitespace, filter empty, count. Title-casing? Split into words, capitalize each, rejoin. Each step is one method call, and the pipeline reads top-to-bottom.

This lesson walks through every major string method through a live text-processing tool, plus real utilities like a slug generator, word counter, and title-caser. Pitfalls to watch: forgetting that strings are immutable (assign the result!), using \`==\` on strings with different casing, and hand-rolling string concatenation when template literals would read far better.`,
	objectives: [
		'Transform strings with trim, toUpperCase, toLowerCase, and slice',
		'Search strings with includes, indexOf, startsWith, and endsWith',
		'Use replace vs replaceAll to modify matching substrings',
		'Split and join strings to convert between strings and arrays',
		'Build dynamic text with template literals using ${} interpolation',
		'Compose real-world pipelines like slug generators and title-case converters'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === STRING METHODS — text is everywhere ===
  // Strings are immutable in JavaScript: every method returns a new string,
  // never modifies the original. This makes them safe but means you must
  // assign the result if you want to keep it.

  // --- Example 1: live text processing ---
  let input = $state('  Hello, Svelte World!  ');

  // Transformation basics — every method returns a new string.
  const trimmed   = $derived(input.trim());
  const upper     = $derived(input.toUpperCase());
  const lower     = $derived(input.toLowerCase());
  const length    = $derived(input.length);

  // --- Example 2: Word count and statistics ---
  // .split(/\\s+/) splits on any whitespace; .filter(Boolean) drops empty strings.
  const words = $derived(
    trimmed.split(/\\s+/).filter(Boolean)
  );
  const wordCount  = $derived(words.length);
  const charCount  = $derived(trimmed.length);
  const charCountNoSpaces = $derived(trimmed.replace(/\\s/g, '').length);
  const longestWord = $derived(
    words.reduce((best, w) => (w.length > best.length ? w : best), '')
  );

  // --- Example 3: Slug generator (URL-safe identifiers) ---
  // Classic pipeline: lowercase → replace non-alphanumerics → trim dashes.
  const slug = $derived(
    trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')   // non-alphanumeric → dash
      .replace(/^-+|-+$/g, '')       // trim leading/trailing dashes
  );

  // --- Example 4: Title Case ---
  // Split into words, capitalize each, rejoin.
  const titleCase = $derived(
    trimmed
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );

  // --- Example 5: Search methods ---
  let searchTerm = $state('Svelte');
  const includesSearch   = $derived(input.includes(searchTerm));
  const indexOfSearch    = $derived(input.indexOf(searchTerm));
  const lastIndexSearch  = $derived(input.lastIndexOf(searchTerm));
  const startsWithSearch = $derived(trimmed.startsWith(searchTerm));
  const endsWithSearch   = $derived(trimmed.endsWith(searchTerm));

  // --- Example 6: Replace (literal) and replaceAll ---
  let replaceFrom = $state('World');
  let replaceTo   = $state('Developer');
  // .replace(str, ...) only replaces the FIRST match.
  // .replaceAll(str, ...) replaces every occurrence.
  const replacedFirst = $derived(input.replace(replaceFrom, replaceTo));
  const replacedAll   = $derived(input.replaceAll(replaceFrom, replaceTo));

  // --- Example 7: Split and join ---
  let csvInput  = $state('apple,banana,cherry,date,elderberry');
  let separator = $state(',');
  const parts  = $derived(csvInput.split(separator));
  const joined = $derived(parts.join(' | '));

  // --- Example 8: Padding and repeat ---
  let padTarget = $state('42');
  const padLeft  = $derived(padTarget.padStart(6, '0'));  // '000042'
  const padRight = $derived(padTarget.padEnd(6, '.'));    // '42....'
  const repeated = $derived('='.repeat(10));              // '=========='

  // --- Example 9: Template literals — building strings dynamically ---
  let name = $state('Ada');
  let age  = $state(36);
  const greeting = $derived(\\\`Hello \\\${name}, you are \\\${age} years old.\\\`);
</script>

<h1>String Methods</h1>

<section>
  <h2>1. Live Text Processing</h2>
  <input bind:value={input} class="wide" />
  <div class="stats-row">
    <span class="stat">Length: <strong>{length}</strong></span>
    <span class="stat">Words: <strong>{wordCount}</strong></span>
    <span class="stat">Chars (no spaces): <strong>{charCountNoSpaces}</strong></span>
    <span class="stat">Longest: <strong>{longestWord || '—'}</strong></span>
  </div>
</section>

<section>
  <h2>2. Transform</h2>
  <div class="results">
    <div class="row"><span class="label">trim():</span> <code>"{trimmed}"</code></div>
    <div class="row"><span class="label">toUpperCase():</span> <code>"{upper}"</code></div>
    <div class="row"><span class="label">toLowerCase():</span> <code>"{lower}"</code></div>
    <div class="row"><span class="label">titleCase:</span> <code>"{titleCase}"</code></div>
    <div class="row"><span class="label">slug:</span> <code>"{slug}"</code></div>
  </div>
</section>

<section>
  <h2>3. Search</h2>
  <input bind:value={searchTerm} placeholder="Search for..." />
  <div class="results">
    <div class="row"><span class="label">includes:</span> <span class:yes={includesSearch} class:no={!includesSearch}>{includesSearch}</span></div>
    <div class="row"><span class="label">indexOf:</span> <span>{indexOfSearch}</span></div>
    <div class="row"><span class="label">lastIndexOf:</span> <span>{lastIndexSearch}</span></div>
    <div class="row"><span class="label">startsWith:</span> <span class:yes={startsWithSearch} class:no={!startsWithSearch}>{startsWithSearch}</span></div>
    <div class="row"><span class="label">endsWith:</span> <span class:yes={endsWithSearch} class:no={!endsWithSearch}>{endsWithSearch}</span></div>
  </div>
</section>

<section>
  <h2>4. replace vs replaceAll</h2>
  <div class="input-row">
    <input bind:value={replaceFrom} placeholder="Find..." />
    <span>→</span>
    <input bind:value={replaceTo} placeholder="Replace with..." />
  </div>
  <p>replace (first):   <code>"{replacedFirst}"</code></p>
  <p>replaceAll:        <code>"{replacedAll}"</code></p>
</section>

<section>
  <h2>5. split & join</h2>
  <div class="input-row">
    <input bind:value={csvInput} class="wide" />
    <input bind:value={separator} class="narrow" />
  </div>
  <p>split("{separator}"): <code>[{parts.map(p => '"' + p + '"').join(', ')}]</code></p>
  <p>join(" | "):         <code>"{joined}"</code></p>
</section>

<section>
  <h2>6. padStart, padEnd, repeat</h2>
  <div class="input-row">
    <label>Value: <input bind:value={padTarget} /></label>
  </div>
  <div class="results">
    <div class="row"><span class="label">padStart(6,'0'):</span> <code>"{padLeft}"</code></div>
    <div class="row"><span class="label">padEnd(6,'.'):</span> <code>"{padRight}"</code></div>
    <div class="row"><span class="label">'='.repeat(10):</span> <code>{repeated}</code></div>
  </div>
</section>

<section>
  <h2>7. Template Literals</h2>
  <div class="input-row">
    <label>Name: <input bind:value={name} /></label>
    <label>Age: <input type="number" bind:value={age} /></label>
  </div>
  <p class="greeting">{greeting}</p>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; font-family: sans-serif; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
  strong { color: #222; }
  .results { display: flex; flex-direction: column; gap: 4px; }
  .row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #444; }
  .label { color: #666; font-family: monospace; font-size: 12px; min-width: 160px; }
  .yes { color: #2d8a6e; font-weight: 600; }
  .no  { color: #c62828; }
  .input-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }
  input { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; }
  input[type="number"] { width: 70px; }
  .wide { flex: 1; min-width: 200px; }
  .narrow { width: 40px; text-align: center; }
  label { font-size: 13px; color: #444; display: flex; align-items: center; gap: 4px; }
  .stats-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px; }
  .stat { background: #f8f8f8; padding: 4px 10px; border-radius: 4px; font-size: 12px; color: #555; }
  .greeting { background: #fff5f2; color: #ff3e00; padding: 10px; border-radius: 6px; font-size: 15px; font-weight: 500; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
