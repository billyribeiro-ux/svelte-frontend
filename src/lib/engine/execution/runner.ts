import { compileSvelte } from '$engine/compiler/svelte-compiler';
import { SvelteSandbox } from '$engine/compiler/sandbox';
import { debounce } from '$utils/debounce';
import type { CompilationResult, ConsoleEntry, RuntimeError, DOMMutation } from '$types/editor';

export interface RunnerOptions {
	container: HTMLElement;
	onCompile?: (result: CompilationResult) => void;
	onConsole?: (entry: ConsoleEntry) => void;
	onError?: (error: RuntimeError) => void;
	onDOMMutation?: (mutation: DOMMutation) => void;
}

export interface Runner {
	run: (source: string, filename?: string) => void;
	runDebounced: (source: string, filename?: string) => void;
	destroy: () => void;
}

export function createRunner(options: RunnerOptions): Runner {
	const {
		container,
		onCompile,
		onConsole = () => {},
		onError = () => {},
		onDOMMutation = () => {}
	} = options;

	const sandbox = new SvelteSandbox(container, onConsole, onError, onDOMMutation);

	function run(source: string, filename?: string): void {
		const result = compileSvelte(source, filename);

		onCompile?.(result);

		if (result.success && result.js) {
			sandbox.execute(result.js, result.css);
		}
	}

	const runDebounced = debounce((source: string, filename?: string) => {
		run(source, filename);
	}, 300);

	function destroy(): void {
		sandbox.destroy();
	}

	return {
		run,
		runDebounced,
		destroy
	};
}
