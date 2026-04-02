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
// Minimal Svelte 5 runtime shim for sandbox preview
const $ = (function() {
  let currentAnchor = null;

  function from_html(html) {
    return function() {
      const template = document.createElement('template');
      template.innerHTML = html.trim();
      return template.content.firstChild.cloneNode(true);
    };
  }

  function template(html) {
    return from_html(html);
  }

  function from_html_tag(html) {
    return from_html(html);
  }

  function append(anchor, node) {
    if (anchor && node) {
      anchor.appendChild(node);
    }
  }

  function set_text(node, text) {
    if (node) node.textContent = text;
  }

  function text(value) {
    return document.createTextNode(value != null ? String(value) : '');
  }

  function first_child(node) {
    return node?.firstChild ?? null;
  }

  function sibling(node, count) {
    if (!count) count = 1;
    let current = node;
    for (let i = 0; i < count && current; i++) {
      current = current.nextSibling;
    }
    return current;
  }

  function child(node) {
    return node?.firstChild ?? null;
  }

  function element(tag) {
    return document.createElement(tag);
  }

  function attr(node, name, value) {
    if (node && name) {
      if (value == null) node.removeAttribute(name);
      else node.setAttribute(name, value);
    }
  }

  function listen(node, event, handler) {
    if (node && event && handler) {
      node.addEventListener(event, handler);
    }
  }

  function set_attribute(node, name, value) {
    attr(node, name, value);
  }

  function init() {}
  function push() {}
  function pop() { return {}; }
  function noop() {}

  // Reactivity stubs for sandbox
  function source(initial) {
    let value = initial;
    function get() { return value; }
    function set(v) { value = typeof v === 'function' ? v(value) : v; }
    return { get, set };
  }

  function set(signal, value) {
    if (signal && signal.set) signal.set(value);
  }

  function get(signal) {
    if (signal && signal.get) return signal.get();
    return signal;
  }

  function derived(fn) {
    return { get: fn };
  }

  function effect(fn) {
    try { fn(); } catch(e) {}
  }

  function render_effect(fn) {
    try { fn(); } catch(e) {}
  }

  function template_effect(fn) {
    try { fn(); } catch(e) {}
  }

  function block(fn) {
    try { fn(); } catch(e) {}
  }

  // Return all exports
  return {
    from_html, template, from_html_tag, append, set_text, text,
    first_child, sibling, child, element, attr, listen,
    set_attribute, init, push, pop, noop, source, set, get,
    derived, effect, render_effect, template_effect, block
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
