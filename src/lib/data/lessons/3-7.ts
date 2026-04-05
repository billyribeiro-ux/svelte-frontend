import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '3-7',
		title: 'Math, Numbers, Dates & Intl',
		phase: 1,
		module: 3,
		lessonIndex: 7
	},
	description: `JavaScript ships with three powerful built-ins for numeric and temporal work: **Math**, **Date**, and the **Intl** family of formatters. Each covers a huge surface area, and knowing what's available means you almost never need a library for this stuff.

**Math** is a global object full of constants and pure functions: \`Math.round\`, \`Math.floor\`, \`Math.ceil\`, \`Math.trunc\` for rounding (each with subtly different behavior on negative numbers), \`Math.abs\` for absolute value, \`Math.sqrt\`, \`Math.pow\`, \`Math.min\`, \`Math.max\`, and the infamous \`Math.random()\` which returns a float in \`[0, 1)\`. The classic "random integer in range" idiom is \`Math.floor(Math.random() * (max - min + 1)) + min\` — worth memorizing.

**Date** represents a moment in time as milliseconds since January 1, 1970 UTC. It's workable but clunky — months are 0-indexed (January is 0!), and the formatting options on the Date object itself are limited and locale-insensitive. Which brings us to the real star of this lesson...

**Intl** is JavaScript's internationalization API and it's genuinely magnificent. \`Intl.NumberFormat\` formats numbers as currencies, percentages, compact notation ("1.2M"), or with locale-appropriate thousands separators (a US "1,234.56" is "1.234,56" in German). \`Intl.DateTimeFormat\` formats dates in every locale under the sun with predefined styles (\`short\`, \`medium\`, \`long\`, \`full\`) or custom field lists. \`Intl.RelativeTimeFormat\` produces strings like "3 hours ago" or "in 2 days" — in any language. There's also \`Intl.PluralRules\`, \`Intl.ListFormat\`, \`Intl.Collator\`, and more.

Using Intl properly replaces entire libraries. A naive "3 hours ago" function in vanilla JS is 30+ lines of edge cases. With \`Intl.RelativeTimeFormat\` plus a small helper that picks the best unit, it's ten lines and works in every language.

Pitfalls to watch: Month confusion (they're 0-indexed in Date), \`Math.round\` behavior on .5 (banker's rounding isn't used — .5 rounds up), \`Math.random()\` is NOT cryptographically secure (use \`crypto.getRandomValues\` for security), and constructing a new \`Intl.NumberFormat\` on every render is wasteful (cache it when performance matters — in this lesson we keep it simple by using \`$derived\`).`,
	objectives: [
		'Use Math methods for rounding, absolute values, powers, square roots, and constants',
		'Generate random integers in a range with the Math.random() idiom',
		'Format numbers as currency, percentages, and compact notation with Intl.NumberFormat',
		'Format dates in multiple locales with Intl.DateTimeFormat',
		'Produce relative time strings like "3 hours ago" with Intl.RelativeTimeFormat',
		'Write a timeAgo helper that picks the best unit automatically from a Date'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === MATH, NUMBERS, DATES, and Intl ===
  // JavaScript ships with three powerful built-ins for numeric and
  // temporal work: Math, Date, and the Intl family of formatters.
  // Intl is especially underrated — it handles locales, currencies,
  // pluralization, and relative time so you don't have to.

  // --- Example 1: Random number generator ---
  // Math.random() returns a float in [0, 1). Scale and floor for integers.
  let min = $state(1);
  let max = $state(100);
  let randomNum = $state(42);
  let history = $state([]);

  function generateRandom() {
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    randomNum = n;
    history = [n, ...history].slice(0, 10);
  }

  function rollDice(sides) {
    generateRandomRange(1, sides);
  }
  function generateRandomRange(lo, hi) {
    min = lo; max = hi;
    generateRandom();
  }

  // --- Example 2: Math methods ---
  let mathInput = $state(3.7);
  const rounded  = $derived(Math.round(mathInput));
  const floored  = $derived(Math.floor(mathInput));
  const ceiled   = $derived(Math.ceil(mathInput));
  const truncated = $derived(Math.trunc(mathInput));
  const absolute = $derived(Math.abs(mathInput));
  const squareRoot = $derived(Math.sqrt(Math.abs(mathInput)));
  const powered  = $derived(Math.pow(mathInput, 3));

  // --- Example 3: Intl.NumberFormat — currencies and numbers ---
  let amount = $state(1234567.89);
  let locale = $state('en-US');
  const locales = ['en-US', 'de-DE', 'ja-JP', 'fr-FR', 'pt-BR', 'hi-IN'];
  const currencies = {
    'en-US': 'USD',
    'de-DE': 'EUR',
    'ja-JP': 'JPY',
    'fr-FR': 'EUR',
    'pt-BR': 'BRL',
    'hi-IN': 'INR'
  };

  const formattedCurrency = $derived(
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencies[locale] || 'USD'
    }).format(amount)
  );

  const formattedNumber = $derived(
    new Intl.NumberFormat(locale).format(amount)
  );

  const formattedCompact = $derived(
    new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount)
  );

  const formattedPercent = $derived(
    new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1
    }).format(0.8567)
  );

  // --- Example 4: Intl.DateTimeFormat — dates ---
  let now = $state(new Date());
  function updateTime() { now = new Date(); }

  const dateShort = $derived(
    new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(now)
  );
  const dateLong = $derived(
    new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(now)
  );
  const dateMedium = $derived(
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(now)
  );
  const timeFormatted = $derived(
    new Intl.DateTimeFormat(locale, {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(now)
  );

  // --- Example 5: Intl.RelativeTimeFormat — "3 hours ago" style ---
  // Takes a signed integer and a unit; negative = past, positive = future.
  const rtf = $derived(new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }));
  const relYesterday = $derived(rtf.format(-1, 'day'));
  const relTomorrow  = $derived(rtf.format(1, 'day'));
  const relLastWeek  = $derived(rtf.format(-1, 'week'));
  const rel3HoursAgo = $derived(rtf.format(-3, 'hour'));
  const relNextMonth = $derived(rtf.format(1, 'month'));

  // --- Example 6: Compute relative time from actual Date ---
  // Given a past date, find the best unit and format it.
  function timeAgo(date, currentLocale) {
    const diff = (date.getTime() - Date.now()) / 1000; // in seconds
    const units = [
      { unit: 'year',   seconds: 31536000 },
      { unit: 'month',  seconds: 2592000 },
      { unit: 'week',   seconds: 604800 },
      { unit: 'day',    seconds: 86400 },
      { unit: 'hour',   seconds: 3600 },
      { unit: 'minute', seconds: 60 },
      { unit: 'second', seconds: 1 }
    ];
    const r = new Intl.RelativeTimeFormat(currentLocale, { numeric: 'auto' });
    for (const { unit, seconds } of units) {
      if (Math.abs(diff) >= seconds || unit === 'second') {
        return r.format(Math.round(diff / seconds), unit);
      }
    }
    return '';
  }

  // Some sample timestamps
  const sampleDates = [
    { label: '10 seconds ago', date: new Date(Date.now() - 10_000) },
    { label: '5 minutes ago',  date: new Date(Date.now() - 5 * 60_000) },
    { label: '2 hours ago',    date: new Date(Date.now() - 2 * 3600_000) },
    { label: '3 days ago',     date: new Date(Date.now() - 3 * 86400_000) },
    { label: '2 weeks ago',    date: new Date(Date.now() - 14 * 86400_000) }
  ];

  // --- Example 7: Math constants ---
  const constants = [
    { name: 'Math.PI',  value: Math.PI },
    { name: 'Math.E',   value: Math.E },
    { name: 'Math.SQRT2', value: Math.SQRT2 },
    { name: 'Math.LN2', value: Math.LN2 }
  ];
</script>

<h1>Math, Numbers, Dates & Intl</h1>

<section>
  <h2>1. Random Number Generator</h2>
  <div class="input-row">
    <label>Min: <input type="number" bind:value={min} /></label>
    <label>Max: <input type="number" bind:value={max} /></label>
    <button onclick={generateRandom}>Roll</button>
  </div>
  <div class="input-row">
    <button onclick={() => rollDice(6)}>d6</button>
    <button onclick={() => rollDice(20)}>d20</button>
    <button onclick={() => rollDice(100)}>d100</button>
  </div>
  <p class="big-number">{randomNum}</p>
  <p class="hint">History: {history.join(', ') || '(none)'}</p>
</section>

<section>
  <h2>2. Math Methods</h2>
  <label>Input: <input type="number" bind:value={mathInput} step="0.1" /></label>
  <div class="results">
    <div class="row"><span class="label">Math.round:</span> <strong>{rounded}</strong></div>
    <div class="row"><span class="label">Math.floor:</span> <strong>{floored}</strong></div>
    <div class="row"><span class="label">Math.ceil:</span> <strong>{ceiled}</strong></div>
    <div class="row"><span class="label">Math.trunc:</span> <strong>{truncated}</strong></div>
    <div class="row"><span class="label">Math.abs:</span> <strong>{absolute}</strong></div>
    <div class="row"><span class="label">Math.sqrt(|x|):</span> <strong>{squareRoot.toFixed(3)}</strong></div>
    <div class="row"><span class="label">Math.pow(x, 3):</span> <strong>{powered.toFixed(3)}</strong></div>
  </div>
</section>

<section>
  <h2>3. Math Constants</h2>
  <div class="constants">
    {#each constants as c (c.name)}
      <div class="const"><code>{c.name}</code> = <strong>{c.value.toFixed(6)}</strong></div>
    {/each}
  </div>
</section>

<section>
  <h2>4. Intl.NumberFormat — Currency & Numbers</h2>
  <div class="input-row">
    <label>Amount: <input type="number" bind:value={amount} step="100" /></label>
    <label>Locale:
      <select bind:value={locale}>
        {#each locales as loc (loc)}
          <option value={loc}>{loc}</option>
        {/each}
      </select>
    </label>
  </div>
  <div class="results">
    <div class="row"><span class="label">Currency:</span> <strong>{formattedCurrency}</strong></div>
    <div class="row"><span class="label">Number:</span> <strong>{formattedNumber}</strong></div>
    <div class="row"><span class="label">Compact:</span> <strong>{formattedCompact}</strong></div>
    <div class="row"><span class="label">Percent (0.8567):</span> <strong>{formattedPercent}</strong></div>
  </div>
</section>

<section>
  <h2>5. Intl.DateTimeFormat — Dates</h2>
  <button onclick={updateTime}>Update to Now</button>
  <div class="results">
    <div class="row"><span class="label">Short:</span> <strong>{dateShort}</strong></div>
    <div class="row"><span class="label">Medium:</span> <strong>{dateMedium}</strong></div>
    <div class="row"><span class="label">Full:</span> <strong>{dateLong}</strong></div>
    <div class="row"><span class="label">Time:</span> <strong>{timeFormatted}</strong></div>
  </div>
</section>

<section>
  <h2>6. Intl.RelativeTimeFormat — "3 hours ago"</h2>
  <div class="results">
    <div class="row"><span class="label">-1 day:</span> <strong>{relYesterday}</strong></div>
    <div class="row"><span class="label">+1 day:</span> <strong>{relTomorrow}</strong></div>
    <div class="row"><span class="label">-1 week:</span> <strong>{relLastWeek}</strong></div>
    <div class="row"><span class="label">-3 hours:</span> <strong>{rel3HoursAgo}</strong></div>
    <div class="row"><span class="label">+1 month:</span> <strong>{relNextMonth}</strong></div>
  </div>
</section>

<section>
  <h2>7. timeAgo() Helper — Auto-pick the Best Unit</h2>
  <div class="results">
    {#each sampleDates as s (s.label)}
      <div class="row">
        <span class="label">{s.label}:</span>
        <strong>{timeAgo(s.date, locale)}</strong>
      </div>
    {/each}
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 22px; font-family: sans-serif; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  .hint { color: #999; font-size: 12px; font-style: italic; }
  strong { color: #222; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
  .big-number { font-size: 48px; font-weight: bold; color: #ff3e00; text-align: center; margin: 12px 0; font-family: monospace; }
  .results { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
  .row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #444; }
  .label { color: #666; font-family: monospace; font-size: 12px; min-width: 160px; }
  .input-row { display: flex; gap: 10px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }
  label { font-size: 13px; color: #444; display: flex; align-items: center; gap: 4px; }
  input[type="number"] { width: 100px; padding: 4px 8px; border: 2px solid #ddd; border-radius: 4px; font-size: 13px; }
  select { padding: 4px 8px; border: 2px solid #ddd; border-radius: 4px; font-size: 13px; }
  .constants { display: flex; gap: 10px; flex-wrap: wrap; }
  .const { background: #f8f8f8; padding: 6px 10px; border-radius: 4px; font-size: 13px; color: #444; }
  button { padding: 6px 14px; border: 2px solid #ff3e00; background: white; color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px; }
  button:hover { background: #ff3e00; color: white; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
