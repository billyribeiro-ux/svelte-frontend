import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '3-1',
		title: 'Control Flow: if/else, switch',
		phase: 1,
		module: 3,
		lessonIndex: 1
	},
	description: `Beyond template-level {#if}, you often need control flow inside your <script> block — calculating values, processing data, or determining what to show. JavaScript's if/else and switch/case statements let you branch logic based on conditions.

This lesson covers if/else chains, switch/case for multi-value matching, guard clauses for early returns, and how these patterns work inside Svelte's script block.`,
	objectives: [
		'Use if/else and switch/case statements in script logic',
		'Apply guard clauses and early returns for cleaner code',
		'Choose between if/else chains and switch for multi-branch logic'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let httpCode = $state(200);
  let userRole = $state('editor');

  // switch/case for status messages
  function getStatusMessage(code) {
    switch (code) {
      case 200: return 'OK — Request succeeded';
      case 201: return 'Created — Resource created';
      case 301: return 'Moved Permanently — Redirect';
      case 400: return 'Bad Request — Check your input';
      case 401: return 'Unauthorized — Please log in';
      case 403: return 'Forbidden — Access denied';
      case 404: return 'Not Found — Resource missing';
      case 500: return 'Server Error — Try again later';
      default: return 'Unknown status code';
    }
  }

  function getStatusCategory(code) {
    if (code >= 200 && code < 300) return 'success';
    if (code >= 300 && code < 400) return 'redirect';
    if (code >= 400 && code < 500) return 'client-error';
    if (code >= 500) return 'server-error';
    return 'unknown';
  }

  // Guard clause pattern
  function getPermissions(role) {
    if (!role) return [];
    if (role === 'admin') return ['read', 'write', 'delete', 'manage'];
    if (role === 'editor') return ['read', 'write'];
    if (role === 'viewer') return ['read'];
    return [];
  }

  const statusMessage = $derived(getStatusMessage(httpCode));
  const statusCategory = $derived(getStatusCategory(httpCode));
  const permissions = $derived(getPermissions(userRole));

  const codes = [200, 201, 301, 400, 401, 403, 404, 500];
  const roles = ['admin', 'editor', 'viewer', 'guest'];
</script>

<h1>Control Flow: if/else, switch</h1>

<section>
  <h2>switch/case — HTTP Status Codes</h2>
  <div class="button-grid">
    {#each codes as code}
      <button class:active={httpCode === code} onclick={() => httpCode = code}>{code}</button>
    {/each}
  </div>
  <div class="result {statusCategory}">
    <strong>{httpCode}</strong>: {statusMessage}
  </div>
</section>

<section>
  <h2>if/else — Status Categories</h2>
  <p>Code {httpCode} is a <strong>{statusCategory}</strong> response</p>
</section>

<section>
  <h2>Guard Clauses — Permissions</h2>
  <div class="button-grid">
    {#each roles as role}
      <button class:active={userRole === role} onclick={() => userRole = role}>{role}</button>
    {/each}
  </div>
  <p>Role: <strong>{userRole}</strong></p>
  <div class="permissions">
    {#each permissions as perm}
      <span class="perm">{perm}</span>
    {:else}
      <span class="none">No permissions</span>
    {/each}
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .button-grid { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
  .result { padding: 10px; border-radius: 6px; margin: 8px 0; font-size: 14px; }
  .success { background: #e6f7f3; color: #2d8a6e; }
  .redirect { background: #e6f0ff; color: #3b7dd8; }
  .client-error { background: #fff3e0; color: #e65100; }
  .server-error { background: #fdecea; color: #c62828; }
  .unknown { background: #f0f0f0; color: #666; }
  .permissions { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
  .perm { padding: 4px 10px; background: #e6f7f3; color: #4ec9b0; border-radius: 4px; font-size: 13px; font-weight: 600; }
  .none { color: #999; font-style: italic; font-size: 13px; }
  button {
    padding: 6px 14px; border: 2px solid #ddd; background: white;
    color: #666; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover { border-color: #ff3e00; color: #ff3e00; }
  .active { border-color: #ff3e00; background: #ff3e00; color: white; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
