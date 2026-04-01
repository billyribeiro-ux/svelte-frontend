import type { ConsoleEntry, RuntimeError, DOMMutation } from '$types/editor';

type ConsoleCallback = (entry: ConsoleEntry) => void;
type ErrorCallback = (error: RuntimeError) => void;
type DOMMutationCallback = (mutation: DOMMutation) => void;

interface SandboxMessage {
	type: 'console' | 'error' | 'mutation';
	payload: unknown;
}

function buildSrcdoc(js: string, css: string | null): string {
	const escapedJs = js.replace(/<\/script>/g, '<\\/script>');
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
<script type="module">
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

	try {
		${escapedJs}
	} catch (err) {
		send('error', {
			message: err.message || String(err),
			stack: err.stack
		});
	}
})();
</script>
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
