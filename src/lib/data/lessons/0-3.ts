import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-3',
		title: 'Seeing Your Data & Leaving Notes',
		phase: 1,
		module: 0,
		lessonIndex: 3
	},
	description: `Every developer needs to inspect what's happening in their code. console.log is your best friend for that.

In this lesson, you'll learn how to use console.log to print values, and how to leave comments in your code so future-you (and teammates) can understand what's going on.

Svelte files support JavaScript comments in the script block and HTML comments in the template.`,
	objectives: [
		'Use console.log to inspect values at runtime',
		'Write JavaScript comments (// and /* */) in script blocks',
		'Understand when and why to add comments to your code'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // This is a single-line comment
  let name = $state('Svelte Learner');
  let lessonNumber = $state(3);

  /*
    This is a multi-line comment.
    Use these for longer explanations.
  */

  // Log values to the console to inspect them
  console.log('Name:', name);
  console.log('Lesson:', lessonNumber);
  console.log('Type of name:', typeof name);
  console.log('Type of lessonNumber:', typeof lessonNumber);
</script>

<!-- This is an HTML comment - it won't appear on screen -->
<h1>Hello, {name}!</h1>
<p>You are on lesson {lessonNumber}.</p>
<p>Open the browser console to see the logged values.</p>

<style>
  h1 {
    color: #ff3e00;
    font-family: sans-serif;
  }
  p {
    color: #444;
    font-size: 15px;
    margin: 8px 0;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
