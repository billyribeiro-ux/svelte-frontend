export interface Keybinding {
	key: string;
	mod?: boolean;
	shift?: boolean;
	alt?: boolean;
	handler: () => void;
	description: string;
}

const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

export function matchesKeybinding(event: KeyboardEvent, binding: Keybinding): boolean {
	const modKey = isMac ? event.metaKey : event.ctrlKey;

	if (binding.mod && !modKey) return false;
	if (!binding.mod && modKey) return false;
	if (binding.shift && !event.shiftKey) return false;
	if (!binding.shift && event.shiftKey) return false;
	if (binding.alt && !event.altKey) return false;
	if (!binding.alt && event.altKey) return false;

	return event.key.toLowerCase() === binding.key.toLowerCase();
}

export function formatKeybinding(binding: Keybinding): string {
	const parts: string[] = [];
	if (binding.mod) parts.push(isMac ? '\u2318' : 'Ctrl');
	if (binding.shift) parts.push(isMac ? '\u21E7' : 'Shift');
	if (binding.alt) parts.push(isMac ? '\u2325' : 'Alt');
	parts.push(binding.key.toUpperCase());
	return parts.join(isMac ? '' : '+');
}
