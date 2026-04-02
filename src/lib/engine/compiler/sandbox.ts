import type { ConsoleEntry, RuntimeError, DOMMutation } from '$types/editor';

type ConsoleCallback = (entry: ConsoleEntry) => void;
type ErrorCallback = (error: RuntimeError) => void;
type DOMMutationCallback = (mutation: DOMMutation) => void;

interface SandboxMessage {
	type: 'console' | 'error' | 'mutation';
	payload: unknown;
}

/**
 * Transform compiled Svelte JS to run standalone in a sandbox iframe.
 *
 * The Svelte 5 compiler outputs ES module code with imports like:
 *   import * as $ from 'svelte/internal/client';
 *   export default function Component($$anchor) { ... }
 *
 * This can't run in a sandbox iframe without the Svelte runtime.
 * We strip the imports and replace them with a minimal runtime shim
 * that provides the subset of functions the compiled code actually uses.
 */
function transformForSandbox(js: string): string {
	// Remove import statements
	let code = js.replace(/^import\s+.*?;\s*$/gm, '');

	// Remove export default — just execute the function definition
	code = code.replace(/export\s+default\s+function\s+(\w+)/, 'function $1');

	// Find the component function name
	const fnMatch = code.match(/^function\s+(\w+)\s*\(\$\$anchor\)/m);
	const componentName = fnMatch?.[1] ?? 'Component';

	return code + `\n\n// Mount the component\n${componentName}(document.getElementById('app'));`;
}

/**
 * Minimal Svelte 5 runtime shim for the sandbox.
 * Provides the core functions that compiled components use.
 * This is a simplified version — it renders static HTML correctly
 * but has limited reactivity support in the sandbox.
 */
const SVELTE_RUNTIME_SHIM = `
// Svelte 5 runtime shim for sandbox preview
// Provides reactivity, control flow, events, and DOM manipulation
const $ = (function() {
  // === REACTIVITY ENGINE ===
  let currentEffect = null;
  const effectQueue = [];
  let flushing = false;

  function flush() {
    if (flushing) return;
    flushing = true;
    while (effectQueue.length) {
      const fn = effectQueue.shift();
      try { fn(); } catch(e) { console.error(e); }
    }
    flushing = false;
  }

  function scheduleEffect(fn) {
    effectQueue.push(fn);
    queueMicrotask(flush);
  }

  // Reactive signal (used by $state)
  function state(initial) {
    let value = initial;
    const subscribers = new Set();
    return {
      get v() { if (currentEffect) subscribers.add(currentEffect); return value; },
      set v(newVal) {
        if (newVal !== value) {
          value = newVal;
          subscribers.forEach(fn => scheduleEffect(fn));
        }
      },
      _subscribers: subscribers
    };
  }

  function proxy(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    const subscribers = new Set();
    return new Proxy(obj, {
      get(target, prop) {
        if (currentEffect) subscribers.add(currentEffect);
        return target[prop];
      },
      set(target, prop, val) {
        target[prop] = val;
        subscribers.forEach(fn => scheduleEffect(fn));
        return true;
      }
    });
  }

  function get(signal) {
    if (signal && typeof signal === 'object' && 'v' in signal) return signal.v;
    return signal;
  }

  function set(signal, value) {
    if (signal && typeof signal === 'object' && 'v' in signal) {
      signal.v = typeof value === 'function' ? value(signal.v) : value;
    }
  }

  function update(signal, d) {
    if (signal && 'v' in signal) {
      signal.v = signal.v + (d || 1);
    }
  }

  function update_pre(signal, d) {
    if (signal && 'v' in signal) {
      signal.v = signal.v + (d || 1);
      return signal.v;
    }
  }

  function mutate(signal, fn) {
    if (signal && 'v' in signal) {
      fn(signal.v);
      signal._subscribers?.forEach(s => scheduleEffect(s));
    }
  }

  // === DOM HELPERS ===
  function from_html(html) {
    return function() {
      const t = document.createElement('template');
      t.innerHTML = html.trim();
      const node = t.content.firstChild?.cloneNode(true);
      return node || document.createTextNode('');
    };
  }
  const template = from_html;

  function append(anchor, node) {
    if (anchor && node) anchor.appendChild(node);
  }

  function set_text(node, text) {
    if (node) node.textContent = (text != null) ? String(text) : '';
  }

  function text(value) {
    return document.createTextNode(value != null ? String(value) : '');
  }

  function comment() {
    return document.createComment('');
  }

  function first_child(node) {
    return node?.firstChild ?? null;
  }

  function child(node) {
    return node?.firstChild ?? null;
  }

  function sibling(node, count) {
    count = count || 1;
    let c = node;
    for (let i = 0; i < Math.abs(count) && c; i++) {
      c = count > 0 ? c.nextSibling : c.previousSibling;
    }
    return c;
  }

  function next(count) { /* used in each blocks, no-op in simplified runtime */ }

  function element(tag) {
    return document.createElement(tag);
  }

  function attr(node, name, value) {
    if (!node || !name) return;
    if (value == null || value === false) node.removeAttribute(name);
    else node.setAttribute(name, value === true ? '' : String(value));
  }

  function set_attribute(node, name, value) { attr(node, name, value); }
  function set_class(node, value) { if (node) node.className = value || ''; }
  function set_style(node, prop, value) { if (node) node.style[prop] = value ?? ''; }
  function toggle_class(node, name, value) { if (node) node.classList.toggle(name, !!value); }

  function remove(node) {
    if (node && node.parentNode) node.parentNode.removeChild(node);
  }

  function reset(node) {
    if (node) node.textContent = '';
  }

  function remove_input_defaults(node) { /* no-op for sandbox */ }

  // === EVENT SYSTEM ===
  const delegatedEvents = {};
  function delegate(events) {
    for (const evt of events) {
      if (!delegatedEvents[evt]) {
        delegatedEvents[evt] = true;
        document.addEventListener(evt, (e) => {
          let target = e.target;
          while (target) {
            const handler = target['__' + evt];
            if (handler) { handler.call(target, e); break; }
            target = target.parentNode;
          }
        });
      }
    }
  }

  function delegated(evt, node, handler) {
    if (node) node['__' + evt] = handler;
  }

  function listen(node, event, handler, options) {
    if (node && event && handler) {
      node.addEventListener(event, handler, options);
    }
  }

  // === BINDINGS ===
  function bind_value(node, setter) {
    if (!node) return;
    node.addEventListener('input', () => setter(node.value));
    node.addEventListener('change', () => setter(node.value));
  }

  function bind_checked(node, setter) {
    if (!node) return;
    node.addEventListener('change', () => setter(node.checked));
  }

  // === EFFECTS ===
  function template_effect(fn) {
    const effect = () => {
      const prev = currentEffect;
      currentEffect = effect;
      try { fn(); } catch(e) { console.error(e); }
      currentEffect = prev;
    };
    effect();
  }

  function render_effect(fn) { template_effect(fn); }
  function effect(fn) { template_effect(fn); }
  function block(fn) { try { fn(); } catch(e) {} }

  // === CONTROL FLOW ===
  function if_block(anchor, fn, elseRender) {
    let currentBlock = null;
    let currentAnchor = anchor;
    template_effect(() => {
      const container = document.createDocumentFragment();
      try { fn((render) => render(container)); }
      catch(e) {}
      if (currentBlock) { currentBlock.remove(); }
      if (container.childNodes.length) {
        currentBlock = container;
        if (anchor.parentNode) anchor.parentNode.insertBefore(container, anchor);
      }
    });
  }

  function each(anchor, flags, getItems, getKey, render) {
    template_effect(() => {
      const items = typeof getItems === 'function' ? getItems() : getItems;
      // Clear previous
      while (anchor.previousSibling && anchor.previousSibling.nodeType !== 8) {
        anchor.previousSibling.remove();
      }
      if (Array.isArray(items)) {
        const frag = document.createDocumentFragment();
        items.forEach((item, i) => {
          try { render(frag, item, i); } catch(e) {}
        });
        if (anchor.parentNode) anchor.parentNode.insertBefore(frag, anchor);
      }
    });
  }

  function index(i) { return i; }

  // === MISC ===
  function init() {}
  function push() {}
  function pop() { return {}; }
  function noop() {}
  function source(initial) { return state(initial); }
  function derived(fn) { return { get v() { return fn(); } }; }

  return {
    state, proxy, get, set, update, update_pre, mutate, source, derived,
    from_html, template, append, set_text, text, comment, first_child, child,
    sibling, next, element, attr, set_attribute, set_class, set_style,
    toggle_class, remove, reset, remove_input_defaults,
    delegate, delegated, listen, bind_value, bind_checked,
    template_effect, render_effect, effect, block,
    if: if_block, each, index,
    init, push, pop, noop
  };
})();
`;

function buildSrcdoc(js: string, css: string | null): string {
	const transformedJs = transformForSandbox(js);
	const escapedJs = transformedJs.replace(/<\/script>/g, '<\\/script>');
	const escapedCss = css ? css.replace(/<\/style>/g, '<\\/style>') : '';

	return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
	*, *::before, *::after { box-sizing: border-box; }
	body { margin: 0; padding: 8px; font-family: system-ui, sans-serif; }
	${escapedCss}
</style>
</head>
<body>
<div id="app"></div>
<script>
(function() {
	const origin = '*';

	function send(type, payload) {
		try {
			window.parent.postMessage({ type, payload }, origin);
		} catch (_) {}
	}

	function serializeArg(arg) {
		if (arg === undefined) return 'undefined';
		if (arg === null) return 'null';
		if (typeof arg === 'object') {
			try { return JSON.stringify(arg, null, 2); }
			catch { return String(arg); }
		}
		return String(arg);
	}

	const methods = ['log', 'warn', 'error', 'info', 'table'];
	for (const method of methods) {
		const original = console[method];
		console[method] = function(...args) {
			send('console', {
				method,
				args: args.map(serializeArg),
				timestamp: Date.now()
			});
			if (original) original.apply(console, args);
		};
	}

	window.onerror = function(message, source, lineno, colno, error) {
		send('error', {
			message: String(message),
			line: lineno,
			column: colno,
			stack: error ? error.stack : undefined
		});
	};

	window.addEventListener('unhandledrejection', function(event) {
		send('error', {
			message: event.reason ? String(event.reason) : 'Unhandled promise rejection',
			stack: event.reason?.stack
		});
	});

	const observer = new MutationObserver(function(mutations) {
		for (const mutation of mutations) {
			send('mutation', {
				type: mutation.type,
				target: mutation.target.nodeName || '',
				added: mutation.addedNodes.length,
				removed: mutation.removedNodes.length,
				attribute: mutation.attributeName || null
			});
		}
	});

	const appEl = document.getElementById('app');
	if (appEl) {
		observer.observe(appEl, {
			childList: true,
			attributes: true,
			subtree: true,
			characterData: true
		});
	}

	// Svelte runtime shim
	${SVELTE_RUNTIME_SHIM}

	try {
		${escapedJs}
	} catch (err) {
		send('error', {
			message: err.message || String(err),
			stack: err.stack
		});
	}
})();
<\/script>
</body>
</html>`;
}

let idCounter = 0;

export class SvelteSandbox {
	private iframe: HTMLIFrameElement | null = null;
	private container: HTMLElement;
	private onConsole: ConsoleCallback;
	private onError: ErrorCallback;
	private onDOMMutation: DOMMutationCallback;
	private messageHandler: ((event: MessageEvent) => void) | null = null;

	constructor(
		container: HTMLElement,
		onConsole: ConsoleCallback,
		onError: ErrorCallback,
		onDOMMutation: DOMMutationCallback
	) {
		this.container = container;
		this.onConsole = onConsole;
		this.onError = onError;
		this.onDOMMutation = onDOMMutation;

		this.messageHandler = (event: MessageEvent) => {
			this.handleMessage(event);
		};
		window.addEventListener('message', this.messageHandler);
	}

	private handleMessage(event: MessageEvent): void {
		if (
			this.iframe &&
			event.source === this.iframe.contentWindow
		) {
			const data = event.data as SandboxMessage;
			if (!data || typeof data.type !== 'string') return;

			switch (data.type) {
				case 'console': {
					const payload = data.payload as Omit<ConsoleEntry, 'id'>;
					const entry: ConsoleEntry = {
						id: `console-${++idCounter}-${Date.now()}`,
						method: payload.method,
						args: payload.args,
						timestamp: payload.timestamp
					};
					this.onConsole(entry);
					break;
				}
				case 'error': {
					this.onError(data.payload as RuntimeError);
					break;
				}
				case 'mutation': {
					this.onDOMMutation(data.payload as DOMMutation);
					break;
				}
			}
		}
	}

	execute(js: string, css: string | null): void {
		if (this.iframe) {
			this.container.removeChild(this.iframe);
		}

		this.iframe = document.createElement('iframe');
		this.iframe.sandbox.add('allow-scripts');
		this.iframe.sandbox.add('allow-same-origin');
		this.iframe.style.cssText = 'width:100%;height:100%;border:none;';
		this.iframe.srcdoc = buildSrcdoc(js, css);

		this.container.appendChild(this.iframe);
	}

	destroy(): void {
		if (this.messageHandler) {
			window.removeEventListener('message', this.messageHandler);
			this.messageHandler = null;
		}

		if (this.iframe) {
			this.container.removeChild(this.iframe);
			this.iframe = null;
		}
	}
}
