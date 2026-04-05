import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '3-6',
		title: 'Regular Expressions',
		phase: 1,
		module: 3,
		lessonIndex: 6
	},
	description: `Regular expressions (regex) are patterns that describe *shapes* of text. They look intimidating at first — a typical regex like \`/^\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$/\` can seem like line noise — but you only need a dozen building blocks to cover the vast majority of real-world tasks. The payoff is huge: tasks that would take pages of string manipulation become a single elegant line.

The mental model: a regex is a tiny program that scans text and says "does this match my pattern?" or "where do matches appear?" The core vocabulary is small. **Anchors** (\`^\` start, \`$\` end) pin matches to boundaries. **Character classes** (\`\\d\` digit, \`\\w\` word, \`\\s\` whitespace, or custom \`[abc]\`) say what kind of character is allowed. **Quantifiers** (\`+\` one or more, \`*\` zero or more, \`?\` optional, \`{n,m}\` a range) say how many. **Groups** \`(...)\` let you extract or repeat parts of a match. **Alternation** \`|\` means "this OR that". **Flags** on the end modify behavior: \`/i\` is case-insensitive, \`/g\` finds all matches, \`/m\` treats \`^\` and \`$\` as line boundaries.

In JavaScript you use regexes through string and RegExp methods. \`regex.test(str)\` returns a boolean — perfect for validation. \`str.match(regex)\` returns matches (with the \`/g\` flag, all of them). \`str.replace(regex, replacement)\` transforms text. \`str.split(regex)\` breaks on pattern matches. When you need to build a regex from user input, use \`new RegExp(str)\` — but remember to escape special characters first (\`.*+?^\${}()|[]\\\`), otherwise a user typing \`.\` will match *anything*.

The most common real uses: form validation (emails, phones, URLs, passwords), extracting data from text (finding all URLs in a document), search-and-highlight UIs, and input normalization (collapsing whitespace, stripping formatting). This lesson demonstrates all of these.

Pitfalls to watch: writing overly strict email regexes (the official spec is absurdly complex — go for "good enough"), forgetting the \`/g\` flag when you want all matches, not escaping user input before building dynamic regexes (a security issue), and using \`{@html}\` with regex-produced HTML (dangerous XSS). This lesson shows the *safe* way to do search highlighting by splitting text into chunks and rendering each as real text — no \`@html\` needed.

A "Try It Yourself" section at the bottom gives you three hands-on challenges to practice what you just learned.`,
	objectives: [
		'Read and write basic regex patterns using anchors, character classes, and quantifiers',
		'Validate form input with .test() for emails, phones, URLs, and passwords',
		'Extract all matches from text using .match() with the /g flag',
		'Use capture groups to pull substrings out of a match',
		'Build dynamic regexes safely with new RegExp() and input escaping',
		'Implement search highlighting without {@html} by splitting text into chunks'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === REGULAR EXPRESSIONS ===
  // A regex is a pattern for matching text. Syntax looks scary but you
  // only need a handful of building blocks for 90% of real tasks:
  //
  //   ^         start of string
  //   $         end of string
  //   .         any character
  //   \\d \\w \\s  digit, word char, whitespace (capital = opposite)
  //   + * ?     one+, zero+, optional
  //   {n,m}     between n and m
  //   [...]     character class
  //   (...)     group
  //   |         alternation (A or B)
  //
  // Flags: /i (case-insensitive), /g (global, all matches), /m (multiline)

  let email    = $state('ada@example.com');
  let phone    = $state('(555) 123-4567');
  let url      = $state('https://svelte.dev/docs');
  let password = $state('MyPass1!');

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$/;
  const urlRegex   = /^https?:\\/\\/[^\\s]+\\.[^\\s]+$/;

  const isValidEmail = $derived(emailRegex.test(email));
  const isValidPhone = $derived(phoneRegex.test(phone));
  const isValidUrl   = $derived(urlRegex.test(url));

  const passwordChecks = $derived([
    { label: 'At least 8 characters',    pass: password.length >= 8 },
    { label: 'Has uppercase letter',     pass: /[A-Z]/.test(password) },
    { label: 'Has lowercase letter',     pass: /[a-z]/.test(password) },
    { label: 'Has a number',             pass: /\\d/.test(password) },
    { label: 'Has special character',    pass: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    { label: 'No spaces',                pass: !/\\s/.test(password) }
  ]);
  const passwordStrength = $derived(passwordChecks.filter(c => c.pass).length);
  const strengthLabel = $derived(
    passwordStrength <= 2 ? 'Weak' :
    passwordStrength <= 4 ? 'Medium' :
    passwordStrength <= 5 ? 'Strong' : 'Excellent'
  );

  let corpus = $state('Contact Ada at ada@work.com or (555) 123-4567. Also try bob@test.org, +1-800-555-2020, and visit https://svelte.dev today!');

  const emailsFound = $derived(
    corpus.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g) || []
  );
  const phonesFound = $derived(
    corpus.match(/[\\+]?[\\(]?\\d{3}[\\)]?[-.\\s]?\\d{3}[-.\\s]?\\d{4}/g) || []
  );
  const urlsFound = $derived(
    corpus.match(/https?:\\/\\/[^\\s]+/g) || []
  );

  // --- Search highlight — safely, by splitting text into chunks ---
  // Instead of {@html}, we split the string into alternating
  // non-match/match pieces and render each segment as real text.
  let highlightTerm = $state('svelte');
  function highlightChunks(text, term) {
    if (!term) return [{ text, match: false }];
    // Escape special regex characters so user input is treated literally.
    const escaped = term.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
    const re = new RegExp(escaped, 'gi');
    const chunks = [];
    let lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > lastIndex) {
        chunks.push({ text: text.slice(lastIndex, m.index), match: false });
      }
      chunks.push({ text: m[0], match: true });
      lastIndex = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++;
    }
    if (lastIndex < text.length) {
      chunks.push({ text: text.slice(lastIndex), match: false });
    }
    return chunks;
  }
  const highlightPieces = $derived(highlightChunks(corpus, highlightTerm));

  const censored = $derived(corpus.replace(/\\d/g, '#'));
  const normalized = $derived('  Hello    World   tabs\\there  '.replace(/\\s+/g, ' ').trim());

  // --- Capture groups ---
  function reformatPhone(p) {
    const match = p.match(/^\\(?(\\d{3})\\)?[-.\\s]?(\\d{3})[-.\\s]?(\\d{4})$/);
    if (!match) return '(invalid)';
    const [, area, first, last] = match;
    return \\\`\\\${area}.\\\${first}.\\\${last}\\\`;
  }
  const reformattedPhone = $derived(reformatPhone(phone));
</script>

<h1>Regular Expressions</h1>

<section>
  <h2>1. Email Validation</h2>
  <input bind:value={email} placeholder="you@example.com" class="wide" />
  <p class:valid={isValidEmail} class:invalid={!isValidEmail}>
    {isValidEmail ? '✓ Valid email' : '✗ Invalid email format'}
  </p>
</section>

<section>
  <h2>2. Phone Validation + Capture Groups</h2>
  <input bind:value={phone} placeholder="(555) 123-4567" />
  <p class:valid={isValidPhone} class:invalid={!isValidPhone}>
    {isValidPhone ? '✓ Valid phone' : '✗ Invalid phone format'}
  </p>
  <p>Reformatted using capture groups: <code>{reformattedPhone}</code></p>
</section>

<section>
  <h2>3. URL Validation</h2>
  <input bind:value={url} placeholder="https://..." class="wide" />
  <p class:valid={isValidUrl} class:invalid={!isValidUrl}>
    {isValidUrl ? '✓ Valid URL' : '✗ Invalid URL format'}
  </p>
</section>

<section>
  <h2>4. Password Strength</h2>
  <input bind:value={password} placeholder="Enter password..." />
  <div class="strength-bar">
    <div
      class="strength-fill"
      style="width: {(passwordStrength / 6) * 100}%; background: {passwordStrength <= 2 ? '#c62828' : passwordStrength <= 4 ? '#dcb000' : '#2d8a6e'};"
    ></div>
  </div>
  <p class="strength-label">Strength: <strong>{strengthLabel}</strong> ({passwordStrength}/6)</p>
  <ul class="checks">
    {#each passwordChecks as check (check.label)}
      <li class:pass={check.pass} class:fail={!check.pass}>
        {check.pass ? '✓' : '✗'} {check.label}
      </li>
    {/each}
  </ul>
</section>

<section>
  <h2>5. match() — Find Patterns in Text</h2>
  <textarea bind:value={corpus} rows="3" class="wide"></textarea>
  <p>Emails: <strong>{emailsFound.join(', ') || 'none'}</strong></p>
  <p>Phones: <strong>{phonesFound.join(', ') || 'none'}</strong></p>
  <p>URLs:   <strong>{urlsFound.join(', ') || 'none'}</strong></p>
</section>

<section>
  <h2>6. Search Highlight (safe, no @html)</h2>
  <p class="hint">We split the text into chunks and render each one as real text.</p>
  <input bind:value={highlightTerm} placeholder="Search term..." />
  <p class="highlighted">
    {#each highlightPieces as piece, i (i)}{#if piece.match}<mark>{piece.text}</mark>{:else}{piece.text}{/if}{/each}
  </p>
</section>

<section>
  <h2>7. replace() — Transform Text</h2>
  <p>Censor digits (<code>/\\d/g</code>): <code class="out">{censored}</code></p>
  <p>Collapse whitespace (<code>/\\s+/g</code>): <code class="out">"{normalized}"</code></p>
</section>

<section class="practice">
  <h2>Try It Yourself</h2>
  <p class="practice-intro">Edit the code above to add these features. Answers are at the bottom of the lesson (but resist peeking!)</p>
  <ol>
    <li>
      <strong>1.</strong> Add a US ZIP code validator that accepts either <code>12345</code> or <code>12345-6789</code>.
      <span class="practice-hint">Hint: <code>/^\\d{'{5}'}(-\\d{'{4}'})?$/.test(zip)</code> inside a <code>$derived</code>.</span>
    </li>
    <li>
      <strong>2.</strong> Extract every hashtag (<code>#example</code>) from the corpus and display them as a list.
      <span class="practice-hint">Hint: <code>corpus.match(/#\\w+/g) || []</code> — the <code>/g</code> flag returns every match.</span>
    </li>
    <li>
      <strong>3.</strong> Tighten the password check to require the order-independent combination of upper + lower + digit + symbol in a single regex.
      <span class="practice-hint">Hint: positive lookaheads — <code>/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{'{8,}'}$/</code>.</span>
    </li>
  </ol>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; font-family: sans-serif; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
  .out { display: inline-block; max-width: 100%; word-break: break-all; }
  .hint { color: #999; font-size: 12px; font-style: italic; }
  .valid   { color: #2d8a6e; font-weight: 600; }
  .invalid { color: #c62828; }
  input, textarea { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; }
  .wide { width: 100%; box-sizing: border-box; }
  textarea { resize: vertical; }
  .strength-bar { height: 10px; background: #eee; border-radius: 5px; margin: 8px 0; overflow: hidden; }
  .strength-fill { height: 100%; border-radius: 5px; transition: width 0.3s, background 0.3s; }
  .strength-label { font-size: 13px; }
  .checks { list-style: none; padding: 0; }
  .checks li { font-size: 13px; padding: 2px 0; }
  .pass { color: #2d8a6e; }
  .fail { color: #c62828; }
  .highlighted { background: #f8f8f8; padding: 10px; border-radius: 6px; line-height: 1.5; }
  mark { background: #ffeb3b; padding: 0 2px; border-radius: 2px; }
  .practice {
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin-top: 1.5rem;
  }
  .practice h2 { color: #1e3a8a; margin: 0 0 0.5rem; font-size: 1rem; border: none; padding: 0; }
  .practice-intro { font-size: 0.88rem; color: #1e40af; margin-bottom: 0.75rem; }
  .practice ol { padding-left: 1.25rem; margin: 0; }
  .practice li { padding: 0.4rem 0; font-size: 0.85rem; color: #1e3a8a; }
  .practice-hint {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #475569;
    font-style: italic;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
