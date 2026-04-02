import type { Lesson } from '$types/lesson';

export const blogPosts: Lesson = {
	id: 'projects.build-a-blog.blog-posts',
	slug: 'blog-posts',
	title: 'Creating and Editing Blog Posts',
	description:
		'Build a post editor with a live Markdown preview, form validation, and reactive two-way data binding.',
	trackId: 'projects',
	moduleId: 'build-a-blog',
	order: 2,
	estimatedMinutes: 30,
	concepts: ['svelte5.runes.state', 'svelte5.bindings.input', 'svelte5.runes.derived'],
	prerequisites: ['projects.build-a-blog.blog-project-setup'],

	content: [
		{
			type: 'text',
			content: `# Creating and Editing Blog Posts

A blog without the ability to create posts is just an empty page. In this lesson we build the post editor — the heart of any blogging platform. You will create a form that captures the title, excerpt, body, author, and tags for a new post, validates the input, and stores the result in the reactive blog store we built in the previous lesson.

Along the way you will learn how Svelte 5 handles two-way data binding with \`bind:\`, how to use \`$derived\` for computed validation messages, and how to implement a live Markdown-style preview that updates as the user types.

## Two-Way Binding in Svelte 5

Svelte 5 retains the familiar \`bind:value\` directive for form elements. When you write \`<input bind:value={title} />\`, the framework establishes a two-way connection: changes to the input update the variable, and changes to the variable update the input. Under the hood, this compiles to an event listener plus a reactive subscription — no manual syncing required.

\`\`\`svelte
<script lang="ts">
  let title = $state('');
</script>

<input bind:value={title} placeholder="Post title" />
<p>You typed: {title}</p>
\`\`\`

Every field in our editor will follow this pattern. The key insight is that each field should be its own \`$state\` variable rather than a single monolithic form object. This keeps the reactivity graph fine-grained: changing the title does not trigger re-computation of anything that only depends on the body.

## Form Structure and Field Design

Our post editor needs the following fields:

| Field | Input type | Notes |
|---|---|---|
| Title | text input | Required, max 120 characters |
| Slug | text input | Auto-generated from title, editable |
| Excerpt | textarea | Required, max 280 characters |
| Body | textarea | Required, the main article content |
| Author | text input | Required |
| Tags | text input | Comma-separated, parsed into an array |

The slug deserves special attention. We auto-generate it by lower-casing the title, replacing spaces with hyphens, and stripping non-alphanumeric characters. But we also let the user override it — a common UX pattern in CMS tools. We model this with a \`$derived\` value that only fires when the user has *not* manually edited the slug field.

\`\`\`ts
let title = $state('');
let customSlug = $state('');
let slugTouched = $state(false);

let slug = $derived(
  slugTouched ? customSlug : title.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '')
);
\`\`\`

This is a beautiful example of how \`$derived\` composes with \`$state\` to model complex UI logic without imperative event handlers.

## Live Preview

As the user types into the body textarea, we render a live preview beside it. For this lesson we keep the rendering simple — paragraphs separated by double newlines, with bold (\`**text**\`) and italic (\`*text*\`) support via regex replacement. In a production app you would reach for a proper Markdown library, but rolling a minimal version teaches you how derived HTML works in Svelte.

\`\`\`ts
let body = $state('');

let previewHtml = $derived(
  body
    .split('\\n\\n')
    .map(para => {
      let html = para
        .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\\*(.+?)\\*/g, '<em>$1</em>');
      return \`<p>\${html}</p>\`;
    })
    .join('')
);
\`\`\`

We then render it with \`{@html previewHtml}\`. Be aware that \`{@html}\` bypasses Svelte's built-in XSS protection. In our controlled editor context this is acceptable because only the post author supplies the input. In user-facing contexts you would sanitize the HTML first.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.bindings.input'
		},
		{
			type: 'text',
			content: `## Your Task: Build the Post Editor

Open the starter code. You will find an \`Editor.svelte\` file with placeholder markup and an \`App.svelte\` that imports it. Your goals:

1. Declare \`$state\` variables for every form field (title, excerpt, body, author, tagsInput).
2. Bind each input/textarea to its corresponding state variable.
3. Create a \`$derived\` slug that auto-generates from the title.
4. Create a \`$derived\` previewHtml that renders simple Markdown from the body.
5. Add a "Publish" button that constructs a \`BlogPost\` object, adds it to the store, and resets the form.`
		},
		{
			type: 'checkpoint',
			content: 'cp-editor-bindings'
		},
		{
			type: 'text',
			content: `## Validation with $derived

Raw forms without validation are a recipe for bad data. We will add inline validation messages using \`$derived\` — one derived value per field that evaluates to an error string or an empty string.

\`\`\`ts
let titleError = $derived(
  title.length === 0 ? '' : title.length < 5 ? 'Title must be at least 5 characters' : ''
);
\`\`\`

Notice the ternary: we intentionally return an empty string when the field is empty (the user has not started typing yet) so we do not show errors prematurely. This "only validate once dirty" pattern is simple but effective.

Aggregate all field errors into a single derived boolean:

\`\`\`ts
let isValid = $derived(
  title.length >= 5 && excerpt.length > 0 && body.length > 0 && author.length > 0
);
\`\`\`

Disable the Publish button when \`!isValid\`. This gives the user immediate, fine-grained feedback without any imperative validation logic.`
		},
		{
			type: 'checkpoint',
			content: 'cp-editor-validation'
		},
		{
			type: 'text',
			content: `## Publishing and Resetting

When the user clicks "Publish", you construct a \`BlogPost\` object from the current state, call \`blogStore.addPost(post)\`, and reset all fields to their initial values. Generating a unique \`id\` can be as simple as \`crypto.randomUUID()\` or a timestamp-based fallback.

Resetting the form is straightforward — just assign each \`$state\` variable back to its default. Because each is independently reactive, Svelte will batch the updates and re-render once.

After publishing, the post count in the header (from our Layout component) should update automatically, proving that the store, the editor, and the layout are all connected through Svelte 5's reactivity graph.`
		},
		{
			type: 'checkpoint',
			content: 'cp-editor-publish'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Editor from './Editor.svelte';
  import { blogStore } from './store.ts';
</script>

<div class="app">
  <h1>Blog Editor</h1>
  <Editor />

  <h2>Published Posts ({blogStore.posts.length})</h2>
  {#each blogStore.posts as post}
    <article>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
    </article>
  {/each}
</div>

<style>
  .app {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  article {
    border-bottom: 1px solid #e2e8f0;
    padding: 1rem 0;
  }
</style>`
		},
		{
			name: 'Editor.svelte',
			path: '/Editor.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { blogStore } from './store.ts';
  import type { BlogPost } from './types';

  // TODO: Declare $state variables for title, excerpt, body, author, tagsInput
  // TODO: Create $derived slug from title
  // TODO: Create $derived previewHtml from body
  // TODO: Create $derived validation states
  // TODO: Add publish function
</script>

<form onsubmit={(e) => { e.preventDefault(); }}>
  <!-- TODO: Add form fields with bind:value -->
  <!-- TODO: Add live preview panel -->
  <!-- TODO: Add Publish button -->
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }
</style>`
		},
		{
			name: 'types.ts',
			path: '/types.ts',
			language: 'typescript',
			content: `export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  author: string;
  publishedAt: string;
  tags: string[];
}
`
		},
		{
			name: 'store.ts',
			path: '/store.ts',
			language: 'typescript',
			content: `import type { BlogPost } from './types';

function createBlogStore() {
  let posts = $state<BlogPost[]>([]);

  return {
    get posts() { return posts; },
    addPost(post: BlogPost) { posts.push(post); },
    removePost(id: string) { posts = posts.filter(p => p.id !== id); }
  };
}

export const blogStore = createBlogStore();
`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Editor from './Editor.svelte';
  import { blogStore } from './store.ts';
</script>

<div class="app">
  <h1>Blog Editor</h1>
  <Editor />

  <h2>Published Posts ({blogStore.posts.length})</h2>
  {#each blogStore.posts as post}
    <article>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
      <small>{post.tags.join(', ')}</small>
    </article>
  {/each}
</div>

<style>
  .app {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  article {
    border-bottom: 1px solid #e2e8f0;
    padding: 1rem 0;
  }

  small {
    color: #94a3b8;
  }
</style>`
		},
		{
			name: 'Editor.svelte',
			path: '/Editor.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { blogStore } from './store.ts';
  import type { BlogPost } from './types';

  let title = $state('');
  let excerpt = $state('');
  let body = $state('');
  let author = $state('');
  let tagsInput = $state('');

  let slug = $derived(
    title.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  );

  let previewHtml = $derived(
    body
      .split('\\n\\n')
      .map(para => {
        let html = para
          .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
          .replace(/\\*(.+?)\\*/g, '<em>$1</em>');
        return \`<p>\${html}</p>\`;
      })
      .join('')
  );

  let isValid = $derived(
    title.length >= 5 && excerpt.length > 0 && body.length > 0 && author.length > 0
  );

  let titleError = $derived(
    title.length === 0 ? '' : title.length < 5 ? 'Title must be at least 5 characters' : ''
  );

  function publish() {
    if (!isValid) return;
    const post: BlogPost = {
      id: crypto.randomUUID(),
      title,
      slug,
      excerpt,
      body,
      author,
      publishedAt: new Date().toISOString().split('T')[0],
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    };
    blogStore.addPost(post);
    title = '';
    excerpt = '';
    body = '';
    author = '';
    tagsInput = '';
  }
</script>

<form onsubmit={(e) => { e.preventDefault(); publish(); }}>
  <label>
    Title
    <input bind:value={title} placeholder="Post title" />
    {#if titleError}<span class="error">{titleError}</span>{/if}
  </label>

  <label>
    Slug
    <input value={slug} disabled />
  </label>

  <label>
    Excerpt
    <textarea bind:value={excerpt} rows="2" placeholder="Short description"></textarea>
  </label>

  <label>
    Author
    <input bind:value={author} placeholder="Your name" />
  </label>

  <label>
    Tags (comma-separated)
    <input bind:value={tagsInput} placeholder="svelte, tutorial" />
  </label>

  <div class="editor-grid">
    <label>
      Body
      <textarea bind:value={body} rows="10" placeholder="Write your post..."></textarea>
    </label>

    <div class="preview">
      <h4>Preview</h4>
      <div class="preview-content">{@html previewHtml}</div>
    </div>
  </div>

  <button type="submit" disabled={!isValid}>Publish Post</button>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-weight: 600;
    font-size: 0.875rem;
    color: #374151;
  }

  input, textarea {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-family: inherit;
    font-size: 0.95rem;
  }

  .error {
    color: #ef4444;
    font-size: 0.8rem;
    font-weight: 400;
  }

  .editor-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .preview {
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 0.75rem;
  }

  .preview h4 {
    margin: 0 0 0.5rem;
    color: #64748b;
  }

  button {
    padding: 0.75rem 1.5rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button:hover:not(:disabled) {
    background: #4f46e5;
  }
</style>`
		},
		{
			name: 'types.ts',
			path: '/types.ts',
			language: 'typescript',
			content: `export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  author: string;
  publishedAt: string;
  tags: string[];
}
`
		},
		{
			name: 'store.ts',
			path: '/store.ts',
			language: 'typescript',
			content: `import type { BlogPost } from './types';

function createBlogStore() {
  let posts = $state<BlogPost[]>([]);

  return {
    get posts() { return posts; },
    addPost(post: BlogPost) { posts.push(post); },
    removePost(id: string) { posts = posts.filter(p => p.id !== id); }
  };
}

export const blogStore = createBlogStore();
`
		}
	],

	checkpoints: [
		{
			id: 'cp-editor-bindings',
			description: 'Create $state variables for form fields and bind them to inputs',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'bind:value' },
						{ type: 'regex', value: 'let title = \\$state' },
						{ type: 'regex', value: 'let body = \\$state' }
					]
				}
			},
			hints: [
				'Declare each form field as a separate `$state` variable, e.g. `let title = $state(\'\');`',
				'Use `bind:value={title}` on each `<input>` or `<textarea>` to create two-way binding.',
				'You need: `let title = $state(\'\'); let excerpt = $state(\'\'); let body = $state(\'\'); let author = $state(\'\'); let tagsInput = $state(\'\');` and `bind:value` on each input element.'
			],
			conceptsTested: ['svelte5.runes.state', 'svelte5.bindings.input']
		},
		{
			id: 'cp-editor-validation',
			description: 'Add $derived validation logic and disable the submit button when invalid',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$derived' },
						{ type: 'contains', value: 'isValid' },
						{ type: 'contains', value: 'disabled' }
					]
				}
			},
			hints: [
				'Create a `$derived` value called `isValid` that checks all required fields have content.',
				'Add `disabled={!isValid}` to the Publish button so users cannot submit incomplete forms.',
				'Use `let isValid = $derived(title.length >= 5 && excerpt.length > 0 && body.length > 0 && author.length > 0);` and add `disabled={!isValid}` to the button.'
			],
			conceptsTested: ['svelte5.runes.derived']
		},
		{
			id: 'cp-editor-publish',
			description: 'Implement the publish function that adds a post to the store and resets the form',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'blogStore.addPost' },
						{ type: 'contains', value: 'publish' }
					]
				}
			},
			hints: [
				'Create a `publish` function that builds a `BlogPost` object from the current state variables and calls `blogStore.addPost(post)`.',
				'After adding the post, reset all `$state` variables to empty strings to clear the form.',
				'Construct the post with `{ id: crypto.randomUUID(), title, slug, excerpt, body, author, publishedAt: new Date().toISOString().split(\'T\')[0], tags: tagsInput.split(\',\').map(t => t.trim()).filter(Boolean) }`, add it with `blogStore.addPost(post)`, then set each field back to `\'\'`.'
			],
			conceptsTested: ['svelte5.runes.state']
		}
	]
};
