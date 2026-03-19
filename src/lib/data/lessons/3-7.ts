import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '3-7',
		title: 'Math, Numbers, Dates & Intl',
		phase: 1,
		module: 3,
		lessonIndex: 7
	},
	description: `JavaScript provides built-in objects for mathematical operations (Math), date handling (Date), and internationalization (Intl). Math gives you random numbers, rounding, and constants. Intl.NumberFormat formats currencies and numbers for different locales, and Intl.DateTimeFormat displays dates in human-friendly formats.

This lesson builds interactive demos for random number generation, date display, and currency/date formatting.`,
	objectives: [
		'Use Math methods for rounding, random numbers, and calculations',
		'Format numbers as currency with Intl.NumberFormat',
		'Display dates in different formats with Intl.DateTimeFormat'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // Random number generator
  let min = $state(1);
  let max = $state(100);
  let randomNum = $state(42);

  function generateRandom() {
    randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Math methods demo
  let mathInput = $state(3.7);
  const rounded = $derived(Math.round(mathInput));
  const floored = $derived(Math.floor(mathInput));
  const ceiled = $derived(Math.ceil(mathInput));
  const absolute = $derived(Math.abs(mathInput));
  const squareRoot = $derived(Math.sqrt(Math.abs(mathInput)));

  // Number formatting
  let amount = $state(1234567.89);
  let locale = $state('en-US');
  const locales = ['en-US', 'de-DE', 'ja-JP', 'fr-FR', 'pt-BR'];

  const currencies = { 'en-US': 'USD', 'de-DE': 'EUR', 'ja-JP': 'JPY', 'fr-FR': 'EUR', 'pt-BR': 'BRL' };

  const formattedCurrency = $derived(
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencies[locale] || 'USD'
    }).format(amount)
  );

  const formattedNumber = $derived(
    new Intl.NumberFormat(locale).format(amount)
  );

  const formattedPercent = $derived(
    new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1
    }).format(0.8567)
  );

  // Date formatting
  let now = $state(new Date());

  function updateTime() {
    now = new Date();
  }

  const dateShort = $derived(
    new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(now)
  );

  const dateLong = $derived(
    new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(now)
  );

  const timeFormatted = $derived(
    new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(now)
  );

  const relative = $derived(() => {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    return {
      yesterday: rtf.format(-1, 'day'),
      tomorrow: rtf.format(1, 'day'),
      lastWeek: rtf.format(-1, 'week')
    };
  });

  const relativeValues = $derived(relative());
</script>

<h1>Math, Numbers, Dates & Intl</h1>

<section>
  <h2>Random Number Generator</h2>
  <div class="input-row">
    <label>Min: <input type="number" bind:value={min} /></label>
    <label>Max: <input type="number" bind:value={max} /></label>
    <button onclick={generateRandom}>Generate</button>
  </div>
  <p class="big-number">{randomNum}</p>
</section>

<section>
  <h2>Math Methods</h2>
  <label>Input: <input type="number" bind:value={mathInput} step="0.1" /></label>
  <div class="results">
    <div class="row"><span class="label">Math.round({mathInput}):</span> <strong>{rounded}</strong></div>
    <div class="row"><span class="label">Math.floor({mathInput}):</span> <strong>{floored}</strong></div>
    <div class="row"><span class="label">Math.ceil({mathInput}):</span> <strong>{ceiled}</strong></div>
    <div class="row"><span class="label">Math.abs({mathInput}):</span> <strong>{absolute}</strong></div>
    <div class="row"><span class="label">Math.sqrt({Math.abs(mathInput).toFixed(1)}):</span> <strong>{squareRoot.toFixed(3)}</strong></div>
    <div class="row"><span class="label">Math.PI:</span> <strong>{Math.PI.toFixed(6)}</strong></div>
  </div>
</section>

<section>
  <h2>Intl.NumberFormat</h2>
  <div class="input-row">
    <label>Amount: <input type="number" bind:value={amount} step="100" /></label>
    <label>Locale:
      <select bind:value={locale}>
        {#each locales as loc}
          <option value={loc}>{loc}</option>
        {/each}
      </select>
    </label>
  </div>
  <div class="results">
    <div class="row"><span class="label">Currency:</span> <strong>{formattedCurrency}</strong></div>
    <div class="row"><span class="label">Number:</span> <strong>{formattedNumber}</strong></div>
    <div class="row"><span class="label">Percent (0.8567):</span> <strong>{formattedPercent}</strong></div>
  </div>
</section>

<section>
  <h2>Intl.DateTimeFormat</h2>
  <button onclick={updateTime}>Update Time</button>
  <div class="results">
    <div class="row"><span class="label">Short:</span> <strong>{dateShort}</strong></div>
    <div class="row"><span class="label">Full:</span> <strong>{dateLong}</strong></div>
    <div class="row"><span class="label">Time:</span> <strong>{timeFormatted}</strong></div>
  </div>
</section>

<section>
  <h2>Intl.RelativeTimeFormat</h2>
  <div class="results">
    <div class="row"><span class="label">-1 day:</span> <strong>{relativeValues.yesterday}</strong></div>
    <div class="row"><span class="label">+1 day:</span> <strong>{relativeValues.tomorrow}</strong></div>
    <div class="row"><span class="label">-1 week:</span> <strong>{relativeValues.lastWeek}</strong></div>
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .big-number { font-size: 48px; font-weight: bold; color: #ff3e00; text-align: center; margin: 12px 0; }
  .results { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
  .row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #444; }
  .label { color: #666; font-family: monospace; font-size: 12px; min-width: 180px; }
  .input-row { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }
  label { font-size: 13px; color: #444; display: flex; align-items: center; gap: 4px; }
  input[type="number"] { width: 80px; padding: 4px 8px; border: 2px solid #ddd; border-radius: 4px; font-size: 13px; }
  select { padding: 4px 8px; border: 2px solid #ddd; border-radius: 4px; font-size: 13px; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover { background: #ff3e00; color: white; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
