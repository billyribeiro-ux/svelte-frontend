import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '3-6',
		title: 'Regular Expressions',
		phase: 1,
		module: 3,
		lessonIndex: 6
	},
	description: `Regular expressions (regex) are patterns that match text. They're incredibly powerful for validation (is this a valid email?), searching (find all phone numbers), and replacing (clean up user input). The syntax looks intimidating at first, but learning a few common patterns covers most use cases.

This lesson builds a form validator using regex patterns for email, phone numbers, and passwords.`,
	objectives: [
		'Write basic regex patterns for common validation tasks',
		'Use test(), match(), and replace() with regular expressions',
		'Validate form input with regex patterns'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // Form fields
  let email = $state('user@example.com');
  let phone = $state('(555) 123-4567');
  let password = $state('MyPass1!');
  let testText = $state('Call 555-1234 or email info@test.com for help.');

  // Regex patterns
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/;
  const hasUppercase = /[A-Z]/;
  const hasLowercase = /[a-z]/;
  const hasNumber = /\d/;
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/;
  const minLength = 8;

  // Validation results
  const isValidEmail = $derived(emailRegex.test(email));
  const isValidPhone = $derived(phoneRegex.test(phone));

  const passwordChecks = $derived([
    { label: 'At least 8 characters', pass: password.length >= minLength },
    { label: 'Has uppercase letter', pass: hasUppercase.test(password) },
    { label: 'Has lowercase letter', pass: hasLowercase.test(password) },
    { label: 'Has a number', pass: hasNumber.test(password) },
    { label: 'Has special character', pass: hasSpecial.test(password) }
  ]);

  const passwordStrength = $derived(
    passwordChecks.filter(c => c.pass).length
  );

  // match — find patterns in text
  const emailsFound = $derived(
    testText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
  );

  const phonesFound = $derived(
    testText.match(/\d{3}[-.]?\d{4}/g) || []
  );

  // replace — clean up text
  const censored = $derived(
    testText.replace(/\d/g, '#')
  );

  const noExtraSpaces = $derived(
    '  Hello    World   '.replace(/\s+/g, ' ').trim()
  );
</script>

<h1>Regular Expressions</h1>

<section>
  <h2>Email Validation</h2>
  <input bind:value={email} placeholder="Enter email..." class="wide" />
  <p class:valid={isValidEmail} class:invalid={!isValidEmail}>
    {isValidEmail ? 'Valid email' : 'Invalid email format'}
  </p>
</section>

<section>
  <h2>Phone Validation</h2>
  <input bind:value={phone} placeholder="(555) 123-4567" />
  <p class:valid={isValidPhone} class:invalid={!isValidPhone}>
    {isValidPhone ? 'Valid phone number' : 'Invalid phone format'}
  </p>
</section>

<section>
  <h2>Password Strength</h2>
  <input bind:value={password} placeholder="Enter password..." />
  <div class="strength-bar">
    <div class="strength-fill" style="width: {passwordStrength * 20}%; background: {passwordStrength <= 2 ? '#f44747' : passwordStrength <= 4 ? '#dcdcaa' : '#4ec9b0'};"></div>
  </div>
  <ul class="checks">
    {#each passwordChecks as check}
      <li class:pass={check.pass} class:fail={!check.pass}>
        {check.pass ? '✓' : '✗'} {check.label}
      </li>
    {/each}
  </ul>
</section>

<section>
  <h2>match() — Find Patterns</h2>
  <textarea bind:value={testText} rows="2" class="wide"></textarea>
  <p>Emails found: <strong>{emailsFound.length > 0 ? emailsFound.join(', ') : 'none'}</strong></p>
  <p>Phones found: <strong>{phonesFound.length > 0 ? phonesFound.join(', ') : 'none'}</strong></p>
</section>

<section>
  <h2>replace() — Transform Text</h2>
  <p>Censor digits: <code>{censored}</code></p>
  <p>Remove extra spaces: <code>"{noExtraSpaces}"</code></p>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
  .valid { color: #4ec9b0; font-weight: 600; }
  .invalid { color: #f44747; }
  input, textarea { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; }
  .wide { width: 100%; box-sizing: border-box; }
  textarea { font-family: inherit; resize: vertical; }
  .strength-bar { height: 8px; background: #eee; border-radius: 4px; margin: 8px 0; overflow: hidden; }
  .strength-fill { height: 100%; border-radius: 4px; transition: width 0.3s, background 0.3s; }
  .checks { list-style: none; padding: 0; }
  .checks li { font-size: 13px; padding: 2px 0; }
  .pass { color: #4ec9b0; }
  .fail { color: #f44747; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
