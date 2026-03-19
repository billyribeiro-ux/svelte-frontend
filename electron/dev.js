import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Start Vite dev server
const vite = spawn('npx', ['vite', 'dev', '--port', '5173'], {
	stdio: 'pipe',
	shell: true
});

vite.stdout.on('data', (data) => {
	const output = data.toString();
	process.stdout.write(output);

	// Once Vite is ready, launch Electron
	if (output.includes('Local:')) {
		console.log('\nStarting Electron...\n');
		const electron = spawn('npx', ['electron', '.'], {
			stdio: 'inherit',
			shell: true,
			env: { ...process.env, NODE_ENV: 'development' }
		});

		electron.on('close', () => {
			vite.kill();
			process.exit();
		});
	}
});

vite.stderr.on('data', (data) => {
	process.stderr.write(data);
});

vite.on('close', (code) => {
	process.exit(code || 0);
});

process.on('SIGINT', () => {
	vite.kill();
	process.exit();
});
