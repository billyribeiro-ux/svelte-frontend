type Theme = 'dark' | 'light';

const STORAGE_KEY = 'svelte-pe7-theme';

let theme: Theme = $state('dark');

// Load from localStorage on init
if (typeof window !== 'undefined') {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === 'light' || stored === 'dark') {
			theme = stored;
		}
	} catch {
		// ignore parse errors
	}

	// Apply initial theme to document
	document.documentElement.setAttribute('data-theme', theme);
}

// Auto-save and sync to DOM
if (typeof window !== 'undefined') {
	$effect.root(() => {
		$effect(() => {
			document.documentElement.setAttribute('data-theme', theme);
			try {
				localStorage.setItem(STORAGE_KEY, theme);
			} catch {
				// ignore quota errors
			}
		});
	});
}

export function toggleTheme(): void {
	theme = theme === 'dark' ? 'light' : 'dark';
}

export function getTheme(): Theme {
	return theme;
}
