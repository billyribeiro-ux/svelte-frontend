import { WebContainer, type FileSystemTree } from '@webcontainer/api';
import type { LessonFile } from '$lib/types';

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

/**
 * Boots or returns the existing WebContainer instance.
 * Ensures only one instance exists per page (singleton).
 */
export async function getWebContainer(): Promise<WebContainer> {
	if (webcontainerInstance) return webcontainerInstance;

	if (bootPromise) return bootPromise;

	bootPromise = WebContainer.boot().then((instance) => {
		webcontainerInstance = instance;
		return instance;
	});

	return bootPromise;
}

/** Base SvelteKit project template that lesson files are mounted into. */
const baseProjectFiles: FileSystemTree = {
	'package.json': {
		file: {
			contents: JSON.stringify(
				{
					name: 'lesson-project',
					version: '0.0.1',
					private: true,
					type: 'module',
					scripts: {
						dev: 'vite dev --host',
						build: 'vite build',
						preview: 'vite preview'
					},
					devDependencies: {
						'@sveltejs/adapter-auto': '^4.0.0',
						'@sveltejs/kit': '^2.16.0',
						'@sveltejs/vite-plugin-svelte': '^5.0.0',
						svelte: '^5.0.0',
						typescript: '^5.7.0',
						vite: '^6.0.0'
					}
				},
				null,
				2
			)
		}
	},
	'svelte.config.js': {
		file: {
			contents: `import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
`
		}
	},
	'vite.config.ts': {
		file: {
			contents: `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()]
});
`
		}
	},
	src: {
		directory: {
			'app.html': {
				file: {
					contents: `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	%sveltekit.head%
</head>
<body data-sveltekit-preload-data="hover">
	<div style="display: contents">%sveltekit.body%</div>
</body>
</html>
`
				}
			}
		}
	}
};

/**
 * Mounts lesson files into the WebContainer's SvelteKit project.
 * Files are placed under src/routes/ or src/lib/ depending on their path.
 */
export async function mountLessonFiles(files: LessonFile[]): Promise<void> {
	const container = await getWebContainer();

	// Mount the base project first
	await container.mount(baseProjectFiles);

	// Ensure src/routes directory exists
	await container.fs.mkdir('/src/routes', { recursive: true });
	await container.fs.mkdir('/src/lib', { recursive: true });

	// Write each lesson file into the project
	for (const file of files) {
		const path = file.filename.startsWith('src/')
			? `/${file.filename}`
			: `/src/routes/${file.filename}`;

		// Ensure parent directory exists
		const parentDir = path.substring(0, path.lastIndexOf('/'));
		if (parentDir) {
			await container.fs.mkdir(parentDir, { recursive: true });
		}

		await container.fs.writeFile(path, file.content);
	}
}

/**
 * Runs `pnpm install` and `pnpm dev` inside the WebContainer.
 * Returns the dev server URL once it's ready.
 */
export async function startDevServer(): Promise<string> {
	const container = await getWebContainer();

	// Install dependencies
	const installProcess = await container.spawn('pnpm', ['install']);

	const installExitCode = await installProcess.exit;
	if (installExitCode !== 0) {
		throw new Error(`pnpm install failed with exit code ${installExitCode}`);
	}

	// Start dev server
	const devProcess = await container.spawn('pnpm', ['dev']);

	// Wait for the server-ready event to get the URL
	return new Promise<string>((resolve) => {
		container.on('server-ready', (_port: number, url: string) => {
			resolve(url);
		});

		// Also pipe output for debugging
		devProcess.output.pipeTo(
			new WritableStream({
				write(chunk) {
					console.log('[dev]', chunk);
				}
			})
		);
	});
}

/**
 * Writes a single file to the WebContainer filesystem.
 * Used for live editing — updates files without restarting the server.
 */
export async function writeFile(path: string, content: string): Promise<void> {
	const container = await getWebContainer();

	// Normalize path
	const fullPath = path.startsWith('/') ? path : `/${path}`;

	await container.fs.writeFile(fullPath, content);
}
