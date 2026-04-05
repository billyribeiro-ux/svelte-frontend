import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

// vite-plugin-svelte@7 ships a hot-update sub-plugin that accesses
// `server.environments` (Vite 6+ API). Vitest 2.x bundles Vite 5, which
// lacks that API, causing a startup crash. We filter that sub-plugin out
// for the test run only — HMR is irrelevant inside vitest anyway.
const sveltePlugins = svelte({
	compilerOptions: {
		hmr: !process.env.VITEST
	}
}).filter((p) => p && p.name !== 'vite-plugin-svelte:hot-update');

export default defineConfig({
	plugins: [sveltePlugins],
	resolve: {
		conditions: ['browser'],
		alias: {
			$lib: path.resolve(__dirname, 'src/lib'),
			$components: path.resolve(__dirname, 'src/lib/components'),
			$stores: path.resolve(__dirname, 'src/lib/stores'),
			$types: path.resolve(__dirname, 'src/lib/types'),
			$utils: path.resolve(__dirname, 'src/lib/utils'),
			$data: path.resolve(__dirname, 'src/lib/data'),
			'monaco-editor': path.resolve(__dirname, 'tests/mocks/monaco.ts'),
			'@webcontainer/api': path.resolve(__dirname, 'tests/mocks/webcontainer.ts')
		}
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./tests/setup.ts'],
		include: ['tests/**/*.test.{ts,svelte.ts}'],
		exclude: ['tests/e2e/**', 'node_modules/**'],
		server: {
			deps: {
				inline: ['@testing-library/svelte']
			}
		}
	}
});
