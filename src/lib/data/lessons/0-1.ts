import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-1',
		title: 'Set Up Your Machine',
		phase: 1,
		module: 0,
		lessonIndex: 1
	},
	description: `Welcome to Svelte PE7 Mastery! In this first lesson, you'll set up everything you need to start building with Svelte and SvelteKit.

We'll make sure you have Node.js installed, understand your code editor, and write your very first lines of HTML in a Svelte file.

Don't worry if this feels basic — every expert started here. The important thing is that your environment works and you can see changes in real time.`,
	objectives: [
		'Understand what Node.js is and verify it is installed',
		'Write basic HTML inside a .svelte file',
		'See your changes render in the preview panel'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<h1>Hello, World!</h1>
<p>Welcome to Svelte PE7 Mastery.</p>
<p>Edit this file and watch the preview update.</p>

<style>
  h1 {
    color: #ff3e00;
    font-family: sans-serif;
  }
  p {
    color: #666;
    font-size: 16px;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
