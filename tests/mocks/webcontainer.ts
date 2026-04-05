/**
 * Mock for `@webcontainer/api` used in vitest tests.
 * Provides a no-op WebContainer class compatible with what
 * `src/lib/utils/webcontainer.ts` consumes.
 */

export type FileSystemTree = Record<string, unknown>;

type ServerReadyListener = (port: number, url: string) => void;

interface SpawnedProcess {
	exit: Promise<number>;
	output: ReadableStream<string>;
	kill: () => void;
}

export class WebContainer {
	fs = {
		writeFile: async (_path: string, _content: string | Uint8Array): Promise<void> => {},
		mkdir: async (_path: string, _opts?: { recursive?: boolean }): Promise<void> => {},
		readFile: async (_path: string, _encoding?: string): Promise<string> => '',
		readdir: async (_path: string): Promise<string[]> => [],
		rm: async (_path: string, _opts?: { recursive?: boolean; force?: boolean }): Promise<void> => {}
	};

	static async boot(): Promise<WebContainer> {
		return new WebContainer();
	}

	async mount(_tree: FileSystemTree): Promise<void> {}

	async spawn(_cmd: string, _args?: string[]): Promise<SpawnedProcess> {
		return {
			exit: Promise.resolve(0),
			output: new ReadableStream<string>({
				start(controller) {
					controller.close();
				}
			}),
			kill() {}
		};
	}

	on(event: string, cb: (...args: unknown[]) => void): () => void {
		if (event === 'server-ready') {
			queueMicrotask(() => (cb as ServerReadyListener)(5173, 'http://localhost:5173'));
		}
		return () => {};
	}

	teardown(): void {}
}

export default WebContainer;
