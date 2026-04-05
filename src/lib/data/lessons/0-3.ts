import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-3',
		title: 'Seeing Your Data & Leaving Notes',
		phase: 1,
		module: 0,
		lessonIndex: 3
	},
	description: `Every professional developer — even the ones with twenty years of experience — spends a big chunk of the day asking one simple question: **"what is actually in this variable right now?"** The tool they reach for 99% of the time is \`console.log\`. It prints whatever you give it into the browser's developer console, where you can read it, expand it, and inspect it.

Alongside logging, the other essential habit is **leaving notes in your code**. Code is read far more often than it is written — by teammates, by code reviewers, and most of all by future-you who will open this file in three months with absolutely no memory of why you wrote it this way. Comments are how we leave those notes.

A \`.svelte\` file actually supports three different kinds of comments depending on where you are writing. Inside \`<script>\` you use JavaScript comments: two slashes for a single line, or slash-star ... star-slash for multiple lines. Inside markup you use HTML comments. Inside \`<style>\` you use CSS comments. Good news: you do not have to memorize them. Your editor will usually insert the right one when you press Ctrl/Cmd + /.

In this lesson you will practice both skills. You will log several kinds of values to the console, you will see the difference between logging a primitive and logging an object, and you will sprinkle helpful comments throughout your code. You will also learn a neat trick: \`JSON.stringify\` lets you put an entire object right onto the page so you can see its contents at a glance without opening the devtools.

**Important habit**: keep the browser devtools open while you work. Right-click the preview → Inspect → Console tab. Every \`console.log\` you write will show up there the moment the component runs.`,
	objectives: [
		'Use console.log to inspect values of any type at runtime',
		'Log multiple values together with labels for easy reading',
		'Write JavaScript, HTML, and CSS comments correctly in a .svelte file',
		'Understand when a comment adds value vs when it is noise',
		'Use JSON.stringify to display object contents directly in the markup',
		'Recognize the difference between console.log, console.warn, and console.error'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ======================================================
  // SECTION 1 — Simple values
  // ======================================================
  // A single-line comment starts with two slashes.
  // Use it for short notes right next to a line of code.
  //
  // These values never change in this demo, so we use plain
  // "let" instead of $state. You only need $state when a
  // value will be updated later (see clickCount below).
  let name = 'Ada Lovelace';
  let age = 28;
  let isStudent = true;

  // Logging a single value:
  console.log(name);

  // Logging with a label is MUCH easier to read in the console:
  console.log('name is:', name);
  console.log('age is:', age);
  console.log('isStudent is:', isStudent);

  // ======================================================
  // SECTION 2 — Multi-line comments
  // ======================================================
  // The block-comment syntax (slash-star to star-slash) lets
  // you span several lines. Use it when you need to explain
  // WHY a chunk of code exists, not just what it does.
  // Example use case: explaining a business rule like
  // "round ratings down because half-stars are not supported".

  // You can log the "type" of a value using typeof.
  // This is a lifesaver when a bug is caused by a value
  // being a string when you thought it was a number.
  console.log('typeof name:', typeof name);
  console.log('typeof age:', typeof age);
  console.log('typeof isStudent:', typeof isStudent);

  // ======================================================
  // SECTION 3 — Objects (grouped data)
  // ======================================================
  // An object bundles several related values together.
  // You can log the whole thing at once — the console
  // lets you expand it to see every property.
  let student = {
    name: 'Ada',
    lesson: 3,
    active: true,
    hobbies: ['math', 'poetry', 'engines']
  };

  console.log('Whole student object:', student);
  console.log('Just the hobbies:', student.hobbies);

  // ======================================================
  // SECTION 4 — Different console methods
  // ======================================================
  // console.log   — normal messages (black / gray)
  // console.warn  — warnings        (yellow)
  // console.error — errors          (red)
  // They all print to the same console, but the color
  // helps you spot important messages quickly.
  console.log('This is a normal log message.');
  console.warn('This is a warning — pay attention!');
  console.error('This is an error — something is wrong!');

  // ======================================================
  // SECTION 5 — A function triggered by a button
  // ======================================================
  // Here we DO need $state because clickCount changes.
  let clickCount = $state(0);

  function handleClick() {
    clickCount = clickCount + 1;
    // Log EVERY time the button is clicked.
    // Watching logs appear in real time is one of the
    // best ways to understand what your code is doing.
    console.log('Button clicked! New count =', clickCount);
  }
</script>

<!-- This is an HTML comment. It will NOT show up on the page. -->
<!-- Use HTML comments to label sections of your markup.      -->

<h1>Hello, {name}!</h1>
<p class="sub">Open the browser devtools console to see what we logged.</p>

<!-- ===== Section: display simple values ===== -->
<section class="card">
  <h2>Simple values</h2>
  <p><strong>Name:</strong> {name}</p>
  <p><strong>Age:</strong> {age}</p>
  <p><strong>Student?</strong> {isStudent}</p>
</section>

<!-- ===== Section: display an object with JSON.stringify ===== -->
<section class="card">
  <h2>Peeking inside an object</h2>
  <p>
    <code>JSON.stringify</code> turns an object into a readable string
    so you can see it on the page (not just in the console):
  </p>
  <!--
    The 2nd and 3rd args to stringify are "replacer" and "spaces".
    Passing null, 2 gives us nicely indented output with 2 spaces.
  -->
  <pre>{JSON.stringify(student, null, 2)}</pre>
</section>

<!-- ===== Section: interactive logging ===== -->
<section class="card">
  <h2>Interactive logging</h2>
  <p>Click count: <strong>{clickCount}</strong></p>
  <button onclick={handleClick}>Click me (and watch the console)</button>
</section>

<style>
  /* CSS comments look like this — exactly the same as JS block comments. */
  h1 {
    color: #ff3e00;
    font-family: sans-serif;
  }
  .sub {
    color: #888;
    font-family: sans-serif;
    font-style: italic;
    margin-top: -4px;
  }
  .card {
    background: #fff7f2;
    border: 2px solid #ffd6c2;
    border-radius: 10px;
    padding: 14px 18px;
    margin: 14px 0;
    font-family: sans-serif;
  }
  h2 {
    color: #333;
    font-size: 16px;
    margin: 0 0 8px;
  }
  p {
    color: #444;
    font-size: 14px;
    margin: 4px 0;
  }
  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 12px;
    border-radius: 6px;
    font-size: 13px;
    overflow-x: auto;
  }
  code {
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 13px;
  }
  button {
    padding: 8px 16px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-family: sans-serif;
  }
  button:hover {
    background: #ff3e00;
    color: white;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
