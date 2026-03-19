import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-1',
		title: '{@attach} & use: Directive Awareness',
		phase: 5,
		module: 15,
		lessonIndex: 1
	},
	description: `Svelte 5 introduces the {@attach} directive as the modern way to add reusable behaviour to DOM elements. It replaces and improves upon the legacy use:action syntax with better composition, a factory pattern for parameterization, and cleaner lifecycle management.

Both {@attach fn} and use:action are ways to run code when an element mounts and clean up when it unmounts. The {@attach} syntax supports multiple attachments naturally, uses a factory function pattern for passing parameters, and integrates with Svelte's reactivity system. Understanding both syntaxes helps when reading existing codebases while building new features with the modern approach.`,
	objectives: [
		'Use {@attach} to add reusable behaviour to DOM elements',
		'Create factory functions that return attach handlers with parameters',
		'Understand the differences between {@attach} and legacy use:action',
		'Compose multiple attachments on a single element'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let tooltipVisible: boolean = $state(false);
  let tooltipText: string = $state('');
  let tooltipPos = $state({ x: 0, y: 0 });
  let clickCount: number = $state(0);
  let rippleTarget: HTMLElement | null = $state(null);

  // {@attach} factory pattern — returns a function that receives the element
  function tooltip(content: string) {
    return (element: HTMLElement) => {
      function show(e: MouseEvent): void {
        tooltipText = content;
        tooltipPos = { x: e.clientX, y: e.clientY };
        tooltipVisible = true;
      }
      function hide(): void {
        tooltipVisible = false;
      }

      element.addEventListener('mouseenter', show);
      element.addEventListener('mouseleave', hide);

      // Return cleanup function
      return () => {
        element.removeEventListener('mouseenter', show);
        element.removeEventListener('mouseleave', hide);
      };
    };
  }

  // Simple attach — auto-focus an element on mount
  function autofocus(element: HTMLElement): void | (() => void) {
    element.focus();
  }

  // Click-outside detector using attach
  function clickOutside(callback: () => void) {
    return (element: HTMLElement) => {
      function handleClick(e: MouseEvent): void {
        if (!element.contains(e.target as Node)) {
          callback();
        }
      }
      document.addEventListener('click', handleClick, true);
      return () => document.removeEventListener('click', handleClick, true);
    };
  }

  // Legacy use:action syntax for comparison
  function legacyHighlight(element: HTMLElement, color: string): { update: (c: string) => void; destroy: () => void } {
    element.style.outline = \`2px dashed \${color}\`;
    return {
      update(newColor: string) {
        element.style.outline = \`2px dashed \${newColor}\`;
      },
      destroy() {
        element.style.outline = '';
      }
    };
  }

  let highlightColor: string = $state('#e17055');
  let dropdownOpen: boolean = $state(false);
</script>

<h1>Attach & Actions</h1>

<section>
  <h2>{@attach} — Tooltip Factory</h2>
  <div class="buttons">
    <button {@attach tooltip('Save your progress')}>Save</button>
    <button {@attach tooltip('Undo last action')}>Undo</button>
    <button {@attach tooltip('Open settings panel')}>Settings</button>
  </div>
</section>

<section>
  <h2>{@attach} — Auto-focus</h2>
  <input type="text" {@attach autofocus} placeholder="I'm auto-focused on mount" />
</section>

<section>
  <h2>{@attach} — Click Outside</h2>
  <div class="dropdown-wrapper">
    <button onclick={() => dropdownOpen = !dropdownOpen}>
      {dropdownOpen ? 'Close' : 'Open'} Dropdown
    </button>
    {#if dropdownOpen}
      <div class="dropdown" {@attach clickOutside(() => dropdownOpen = false)}>
        <p>Click outside me to close!</p>
        <ul>
          <li>Option A</li>
          <li>Option B</li>
          <li>Option C</li>
        </ul>
      </div>
    {/if}
  </div>
</section>

<section>
  <h2>Multiple {@attach} on One Element</h2>
  <button
    {@attach tooltip('This button has two attachments')}
    {@attach autofocus}
    onclick={() => clickCount++}
  >
    Multi-attached Button (clicked {clickCount} times)
  </button>
</section>

<section>
  <h2>Legacy use:action (for comparison)</h2>
  <div use:legacyHighlight={highlightColor}>
    <p>This box uses the legacy use:action syntax.</p>
    <label>
      Color:
      <input type="color" bind:value={highlightColor} />
    </label>
  </div>
</section>

{#if tooltipVisible}
  <div class="tooltip" style="left: {tooltipPos.x + 10}px; top: {tooltipPos.y - 30}px">
    {tooltipText}
  </div>
{/if}

<style>
  h1 { color: #2d3436; }
  section {
    margin-bottom: 1.5rem; padding: 1rem;
    background: #f8f9fa; border-radius: 8px;
  }
  h2 { margin-top: 0; color: #6c5ce7; font-size: 1.1rem; }
  .buttons { display: flex; gap: 0.5rem; }
  button {
    padding: 0.5rem 1rem; border: none; border-radius: 4px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600;
  }
  button:hover { background: #5a4bd1; }
  input[type="text"] {
    padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;
    width: 100%; max-width: 350px; box-sizing: border-box;
  }
  input[type="text"]:focus { outline: 2px solid #6c5ce7; }
  .tooltip {
    position: fixed; background: #2d3436; color: white;
    padding: 0.4rem 0.8rem; border-radius: 4px; font-size: 0.85rem;
    pointer-events: none; z-index: 1000;
  }
  .dropdown-wrapper { position: relative; display: inline-block; }
  .dropdown {
    position: absolute; top: 100%; left: 0; margin-top: 0.25rem;
    background: white; border: 1px solid #ddd; border-radius: 6px;
    padding: 0.75rem; min-width: 180px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 10;
  }
  .dropdown ul { list-style: none; padding: 0; margin: 0.5rem 0 0; }
  .dropdown li {
    padding: 0.4rem 0.6rem; cursor: pointer; border-radius: 4px;
  }
  .dropdown li:hover { background: #f0f0f0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
