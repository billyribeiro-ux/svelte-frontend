import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-1',
		title: '{@attach} & use: Directive Awareness',
		phase: 5,
		module: 15,
		lessonIndex: 1
	},
	description: `{@attach fn} is Svelte 5's modern replacement for use:action. An attachment is a plain function: it receives the DOM element when mounted, optionally returns a teardown function, and re-runs automatically when any reactive values it reads change. You can place multiple {@attach} directives on the same element and they all compose.

The factory pattern is the idiomatic way to pass parameters: write a function that returns the attachment handler. This keeps the outer scope clean and makes the attachment easy to reuse across components. Compared to use:action, attachments integrate with $state, work inside {#if}/{#each} without surprises, and use plain closures instead of a separate update/destroy lifecycle object.

The end of the lesson lists 4-6 common pitfalls and pro tips to help you avoid the traps students most often hit.`,
	objectives: [
		'Author attachments with the factory pattern for parameterized behaviour',
		'Compose multiple {@attach} directives on a single element',
		'Build the canonical attach library: autofocus, tooltip, click-outside, intersection observer',
		'Understand the migration path from use:action to {@attach}'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ─────────────────────────────────────────────────────────────
  // Attachment library — each of these is a reusable factory.
  // Factory :: (...params) => (element) => teardown?
  // ─────────────────────────────────────────────────────────────

  // 1. Auto-focus (simplest form — no parameters)
  function autofocus(el: HTMLElement): void {
    el.focus();
  }

  // 2. Tooltip — factory that takes text
  function tooltip(text: string) {
    return (el: HTMLElement) => {
      const tip = document.createElement('div');
      tip.textContent = text;
      tip.className = 'attach-tooltip';
      tip.style.cssText =
        'position:fixed;background:#2d3436;color:#fff;padding:4px 10px;' +
        'border-radius:4px;font-size:12px;pointer-events:none;z-index:1000;' +
        'opacity:0;transition:opacity .15s';
      document.body.appendChild(tip);

      const show = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        tip.style.left = \`\${rect.left + rect.width / 2 - tip.offsetWidth / 2}px\`;
        tip.style.top = \`\${rect.top - tip.offsetHeight - 6}px\`;
        tip.style.opacity = '1';
      };
      const hide = () => { tip.style.opacity = '0'; };

      el.addEventListener('mouseenter', show);
      el.addEventListener('mouseleave', hide);
      el.addEventListener('focus', show);
      el.addEventListener('blur', hide);

      return () => {
        el.removeEventListener('mouseenter', show);
        el.removeEventListener('mouseleave', hide);
        el.removeEventListener('focus', show);
        el.removeEventListener('blur', hide);
        tip.remove();
      };
    };
  }

  // 3. Click-outside — factory that takes a callback
  function clickOutside(callback: () => void) {
    return (el: HTMLElement) => {
      function handler(e: MouseEvent): void {
        if (!el.contains(e.target as Node)) callback();
      }
      // capture: true so we beat bubbling
      document.addEventListener('click', handler, true);
      return () => document.removeEventListener('click', handler, true);
    };
  }

  // 4. Intersection observer — factory for visibility tracking
  function inView(onChange: (visible: boolean) => void, threshold = 0.4) {
    return (el: HTMLElement) => {
      const obs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) onChange(entry.isIntersecting);
        },
        { threshold }
      );
      obs.observe(el);
      return () => obs.disconnect();
    };
  }

  // 5. Copy-to-clipboard button behaviour
  function copyOnClick(text: string) {
    return (el: HTMLElement) => {
      const handler = async () => {
        try {
          await navigator.clipboard.writeText(text);
          const original = el.textContent;
          el.textContent = 'Copied!';
          setTimeout(() => { el.textContent = original; }, 1000);
        } catch {
          /* clipboard blocked */
        }
      };
      el.addEventListener('click', handler);
      return () => el.removeEventListener('click', handler);
    };
  }

  // 6. Long press — factory with duration
  function longPress(ms: number, callback: () => void) {
    return (el: HTMLElement) => {
      let timer: number | null = null;
      const start = () => { timer = window.setTimeout(callback, ms); };
      const cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };
      el.addEventListener('pointerdown', start);
      el.addEventListener('pointerup', cancel);
      el.addEventListener('pointerleave', cancel);
      return () => {
        cancel();
        el.removeEventListener('pointerdown', start);
        el.removeEventListener('pointerup', cancel);
        el.removeEventListener('pointerleave', cancel);
      };
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Demo state
  // ─────────────────────────────────────────────────────────────
  let menuOpen: boolean = $state(false);
  let cardVisible: boolean = $state(false);
  let longPressCount: number = $state(0);
  let clickedAt: string = $state('(never)');
</script>

<h1>{'{@attach}'} — Reusable DOM Behaviour</h1>

<section>
  <h2>1. Auto-focus</h2>
  <p>Enters the DOM already focused — no <code>bind:this</code> dance.</p>
  <input type="text" placeholder="I grab focus on mount" {@attach autofocus} />
</section>

<section>
  <h2>2. Tooltip Factory</h2>
  <p>Same factory, different parameters, reused across many elements.</p>
  <div class="row">
    <button {@attach tooltip('Save your work (Ctrl+S)')}>Save</button>
    <button {@attach tooltip('Undo last action (Ctrl+Z)')}>Undo</button>
    <button {@attach tooltip('Duplicate the selection')}>Duplicate</button>
    <button {@attach tooltip('Delete — this cannot be undone')}>Delete</button>
  </div>
</section>

<section>
  <h2>3. Click Outside</h2>
  <div class="menu-wrap">
    <button onclick={() => menuOpen = !menuOpen}>
      {menuOpen ? 'Close menu' : 'Open menu'}
    </button>
    {#if menuOpen}
      <div class="menu" {@attach clickOutside(() => menuOpen = false)}>
        <p>Click anywhere outside this menu to dismiss it.</p>
        <ul>
          <li>Profile</li>
          <li>Settings</li>
          <li>Sign out</li>
        </ul>
      </div>
    {/if}
  </div>
</section>

<section>
  <h2>4. Intersection Observer</h2>
  <p class="hint">Scroll the box below — the card fires an event when it enters view.</p>
  <div class="scroller">
    <div class="spacer">scroll down ↓</div>
    <div
      class="io-card"
      class:visible={cardVisible}
      {@attach inView((v) => { cardVisible = v; })}
    >
      <strong>I know when I'm on screen.</strong>
      <span class="badge">{cardVisible ? 'visible' : 'hidden'}</span>
    </div>
    <div class="spacer">↑ scroll up</div>
  </div>
</section>

<section>
  <h2>5. Multiple attachments + event handler</h2>
  <button
    {@attach tooltip('Hold for 1 second')}
    {@attach longPress(1000, () => { longPressCount++; clickedAt = new Date().toLocaleTimeString(); })}
    onclick={() => { clickedAt = new Date().toLocaleTimeString(); }}
  >
    Long-press me
  </button>
  <p class="stat">Long-presses: <strong>{longPressCount}</strong> • last event: <strong>{clickedAt}</strong></p>
</section>

<section>
  <h2>6. Copy to clipboard</h2>
  <p>Plain element, behaviour layered on via attachment.</p>
  <button {@attach copyOnClick('svelte@5 is amazing')}>Copy "svelte@5 is amazing"</button>
</section>

<section class="legacy">
  <h2>Legacy comparison</h2>
  <p>
    The old <code>use:action</code> syntax used a separate
    <code>update()</code>/<code>destroy()</code> lifecycle. The new
    <code>{'{@attach}'}</code> uses a plain closure — cleaner, composes freely,
    and re-runs on reactive source changes without any extra API.
  </p>
  <pre>// Old
&lt;div use:action={'{'}params{'}'} /&gt;

// New
&lt;div {'{@attach'} factory(params){'}'} /&gt;</pre>
</section>

<section class="pitfalls">
  <h2>Common Pitfalls & Pro Tips</h2>
  <ul class="pitfall-list">
    <li>
      <strong>Returning cleanup is optional but recommended</strong>
      Any listeners, observers, or timers the attachment creates should be torn down in the returned function.
    </li>
    <li>
      <strong>Factory vs inline function changes reactivity</strong>
      A factory called with current params captures them; reading <code>$state</code> inside the attachment body makes it re-run on change.
    </li>
    <li>
      <strong>Reading state inside the attachment re-runs it</strong>
      Every reactive read becomes a dependency — be deliberate about which values you read versus pass in as factory args.
    </li>
    <li>
      <strong>Don't mutate state inside an attachment</strong>
      Same rules as <code>$effect</code>: writing to reactive state from an attachment can cause infinite loops.
    </li>
    <li>
      <strong>Multiple {@attach} directives compose freely</strong>
      Stack as many as you need on one element — unlike use:action there's no ordering footgun.
    </li>
    <li>
      <strong>Prefer {@attach} over use: in new code</strong>
      The directive syntax still works for compat, but attachments integrate with runes and are the documented path forward.
    </li>
  </ul>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin: 0 0 0.5rem; color: #6c5ce7; font-size: 1.05rem; }
  p { font-size: 0.9rem; color: #636e72; }
  .hint { font-size: 0.82rem; }
  .row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  button {
    padding: 0.5rem 0.9rem; border: none; border-radius: 6px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600;
  }
  button:hover { background: #5a4bd1; }
  input[type="text"] {
    padding: 0.5rem; border: 1px solid #dfe6e9; border-radius: 6px;
    width: 280px; max-width: 100%;
  }
  .menu-wrap { position: relative; display: inline-block; }
  .menu {
    position: absolute; top: 100%; left: 0; margin-top: 0.25rem;
    background: white; border: 1px solid #dfe6e9; border-radius: 8px;
    padding: 0.75rem; min-width: 200px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); z-index: 10;
  }
  .menu ul { list-style: none; padding: 0; margin: 0.5rem 0 0; }
  .menu li { padding: 0.4rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
  .menu li:hover { background: #f1f3f5; }

  .scroller {
    height: 200px; overflow-y: auto; background: white;
    border: 1px solid #dfe6e9; border-radius: 8px; padding: 0.5rem;
  }
  .spacer { height: 240px; display: flex; align-items: center; justify-content: center; color: #b2bec3; font-size: 0.8rem; }
  .io-card {
    padding: 1rem; margin: 1rem 0; background: #eef2ff;
    border-radius: 8px; border: 2px dashed #6c5ce7;
    display: flex; justify-content: space-between; align-items: center;
    transition: background 0.2s;
  }
  .io-card.visible { background: #d1fadf; border-color: #00b894; }
  .badge {
    font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 999px;
    background: white; color: #2d3436; font-weight: 700;
  }
  .stat { font-size: 0.88rem; margin-top: 0.5rem; }

  .legacy { background: #fff8e1; }
  .legacy pre {
    background: #2d3436; color: #dfe6e9; padding: 0.75rem;
    border-radius: 6px; font-size: 0.78rem;
  }
  code { background: #eef; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
  .pitfalls { background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.25rem; margin-top: 1.5rem; }
  .pitfalls h2 { color: #78350f; margin: 0 0 0.5rem; font-size: 1rem; }
  .pitfall-list { list-style: none; padding: 0; margin: 0; }
  .pitfall-list li { padding: 0.4rem 0; border-bottom: 1px dashed #fbbf24; font-size: 0.85rem; color: #78350f; }
  .pitfall-list li:last-child { border-bottom: none; }
  .pitfall-list strong { display: block; color: #92400e; margin-bottom: 0.15rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
