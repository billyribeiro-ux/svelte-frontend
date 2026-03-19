import { app, BrowserWindow, session } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

function createWindow() {
	const win = new BrowserWindow({
		width: 1400,
		height: 900,
		minWidth: 900,
		minHeight: 600,
		backgroundColor: '#1e1e1e',
		titleBarStyle: 'hiddenInset',
		trafficLightPosition: { x: 12, y: 12 },
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false
		}
	});

	// Set Cross-Origin headers required by WebContainer
	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		const headers = details.responseHeaders || {};
		headers['Cross-Origin-Embedder-Policy'] = ['require-corp'];
		headers['Cross-Origin-Opener-Policy'] = ['same-origin'];
		callback({ responseHeaders: headers });
	});

	if (isDev) {
		win.loadURL('http://localhost:5173');
		win.webContents.openDevTools();
	} else {
		win.loadFile(path.join(__dirname, '../build/index.html'));
	}
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
