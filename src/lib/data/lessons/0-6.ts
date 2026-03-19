import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-6',
		title: 'The Void: null, undefined & Falsy',
		phase: 1,
		module: 0,
		lessonIndex: 6
	},
	description: `Not every value is something — sometimes a value is intentionally empty (null), hasn't been set yet (undefined), or is "falsy" (0, '', false). Understanding these edge cases is critical for writing robust code that doesn't crash when data is missing.

In this lesson, you'll learn the difference between null and undefined, use optional chaining (?.) and nullish coalescing (??) to safely handle missing data, and conditionally render content based on whether values exist.`,
	objectives: [
		'Understand the difference between null and undefined',
		'Use optional chaining (?.) to safely access nested properties',
		'Use nullish coalescing (??) to provide fallback values',
		'Render content conditionally based on whether values are defined'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // undefined — a variable declared but not assigned
  let unsetValue = $state(undefined);

  // null — intentionally "no value"
  let clearedValue = $state(null);

  // An object that may or may not have nested data
  let user = $state({
    name: 'Ada',
    profile: {
      bio: 'Loves algorithms',
      social: null
    }
  });

  // Optional chaining — safely access nested properties
  let socialUrl = $derived(user?.profile?.social?.url);

  // Nullish coalescing — provide a default when value is null or undefined
  let displayBio = $derived(user?.profile?.bio ?? 'No bio provided');
  let displaySocial = $derived(socialUrl ?? 'No social link');

  // Falsy values: 0, '', false, null, undefined, NaN
  let score = $state(0);
  let emptyText = $state('');
  let isActive = $state(false);

  function setUser() {
    user = { name: 'Grace', profile: { bio: null, social: { url: 'https://example.com' } } };
  }

  function clearUser() {
    user = { name: 'Unknown', profile: null };
  }
</script>

<h1>The Void: null, undefined & Falsy</h1>

<section>
  <h2>null vs undefined</h2>
  <p>unsetValue: <strong>{String(unsetValue)}</strong> (type: {typeof unsetValue})</p>
  <p>clearedValue: <strong>{String(clearedValue)}</strong> (type: {typeof clearedValue})</p>
  <p>Are they equal with ==? <strong>{String(unsetValue == clearedValue)}</strong></p>
  <p>Are they equal with ===? <strong>{String(unsetValue === clearedValue)}</strong></p>
</section>

<section>
  <h2>Optional Chaining & Nullish Coalescing</h2>
  <p>User: <strong>{user.name}</strong></p>
  <p>Bio (via ??): <strong>{displayBio}</strong></p>
  <p>Social (via ?.): <strong>{displaySocial}</strong></p>
  <div class="buttons">
    <button onclick={setUser}>Set User (Grace)</button>
    <button onclick={clearUser}>Clear Profile</button>
  </div>
</section>

<section>
  <h2>Falsy Values</h2>
  <p>Score is {score} — {#if score}truthy{:else}falsy{/if}</p>
  <p>Text is "{emptyText}" — {#if emptyText}truthy{:else}falsy{/if}</p>
  <p>isActive is {isActive} — {#if isActive}truthy{:else}falsy{/if}</p>
</section>

<section>
  <h2>Conditional Rendering for Defined Values</h2>
  {#if user?.profile?.bio}
    <p class="defined">Bio exists: {user.profile.bio}</p>
  {:else}
    <p class="missing">No bio available</p>
  {/if}

  {#if user?.profile?.social}
    <p class="defined">Social link: {user.profile.social.url}</p>
  {:else}
    <p class="missing">No social profile</p>
  {/if}
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .buttons { display: flex; gap: 8px; margin: 8px 0; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover { background: #ff3e00; color: white; }
  .defined { color: #4ec9b0; font-weight: 600; }
  .missing { color: #f44747; font-style: italic; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
