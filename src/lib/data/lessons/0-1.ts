import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-1',
		title: 'Set Up Your Machine',
		phase: 1,
		module: 0,
		lessonIndex: 1
	},
	description: `Welcome to Svelte PE7 Mastery! Before we write any JavaScript, we need to make sure your computer is ready to build real web applications. This lesson is about setting the stage — nothing fancy yet, just a friendly checklist so you know your tools work.

Why do we need special tools at all? A modern website is more than a single HTML file. It is assembled from many smaller pieces by programs that run on your computer. Those programs need a runtime called **Node.js**. Think of Node.js like the engine under the hood of a car: you do not look at it every day, but nothing moves without it. We will also use a **code editor** (VS Code, Cursor, or similar) where we actually type our code.

In a real project on your own machine you would run a command like \`npx sv create my-app\` to scaffold a brand new SvelteKit project. In this course, we have already done that for you: every lesson gives you a live preview on the right side of the screen, so you can focus purely on learning the language and the framework. Edit the file, save, and the preview updates instantly.

A quick note for AI-tooling fans: if you use Cursor, Claude Code, or OpenCode, the modern Svelte CLI (sv 0.12.6+) can scaffold MCP integration files into an \`.opencode/\` folder for you — that lets the AI "see" the official Svelte docs while it codes with you. Not required for this course, just a nice-to-have.

Do not worry if this all feels very new. Every expert started exactly where you are. The only goal of Lesson 1 is: **see your changes appear in the preview panel.** That is it. Let us make the page say hello.`,
	objectives: [
		'Understand what Node.js is and why Svelte projects need it',
		'Recognize the basic anatomy of a .svelte file (markup + optional style)',
		'Write plain HTML inside a Svelte component',
		'Edit the file and watch the live preview update in real time',
		'Add basic CSS inside a <style> block to customize appearance',
		'Get comfortable with the idea of "save, look, tweak, repeat"'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<!--
  Welcome to your very first Svelte file!
  Everything you see here is real, working Svelte code.

  A .svelte file can contain three sections:
    1. <script>  — JavaScript (we will add this in the next lesson)
    2. markup    — HTML-like tags that describe what shows on screen
    3. <style>   — CSS that styles ONLY this component

  Right now we are only using markup and style. Try editing
  the text inside the tags and watch the preview update!
-->

<!-- ===== Section 1: A simple greeting ===== -->
<h1>Hello, World!</h1>
<p>Welcome to Svelte PE7 Mastery.</p>
<p>This is your very first Svelte component.</p>

<!-- ===== Section 2: A short "about me" card ===== -->
<!-- Try changing the name and hobbies to your own! -->
<div class="card">
  <h2>About Me</h2>
  <p><strong>Name:</strong> Future Svelte Developer</p>
  <p><strong>Learning:</strong> Svelte 5, SvelteKit, JavaScript</p>
  <p><strong>Goal:</strong> Build awesome web apps</p>
</div>

<!-- ===== Section 3: A tiny checklist of what you should see ===== -->
<div class="card checklist">
  <h2>Can you see all of this?</h2>
  <ul>
    <li>An orange heading at the top</li>
    <li>Two gray paragraphs under it</li>
    <li>This "About Me" card with three lines</li>
    <li>This checklist with four bullet points</li>
  </ul>
</div>

<!-- ===== Section 4: Your playground ===== -->
<!-- Edit anything below this line to experiment. -->
<p class="hint">Try changing the text or colors — nothing will break!</p>

<style>
  /*
    Styles inside a .svelte file are "scoped" —
    they only affect THIS component, not the whole page.
    That means you can name classes freely without conflict.
  */
  h1 {
    color: #ff3e00;       /* Svelte's signature orange */
    font-family: sans-serif;
    margin-bottom: 8px;
  }

  h2 {
    color: #333;
    font-family: sans-serif;
    font-size: 18px;
    margin: 0 0 8px;
  }

  p {
    color: #555;
    font-family: sans-serif;
    font-size: 15px;
    margin: 4px 0;
  }

  /* A reusable "card" style used by several sections above */
  .card {
    background: #fff7f2;
    border: 2px solid #ffd6c2;
    border-radius: 10px;
    padding: 14px 18px;
    margin: 14px 0;
    font-family: sans-serif;
  }

  .checklist {
    background: #f2fbff;
    border-color: #bfe6ff;
  }

  .checklist ul {
    margin: 0;
    padding-left: 20px;
    color: #444;
  }

  .checklist li {
    margin: 4px 0;
  }

  .hint {
    color: #888;
    font-style: italic;
    font-size: 13px;
    margin-top: 20px;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
