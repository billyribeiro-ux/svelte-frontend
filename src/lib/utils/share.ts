export function encodePlaygroundState(files: Record<string, string>): string {
	const json = JSON.stringify(files);
	const encoded = btoa(encodeURIComponent(json));
	return encoded;
}

export function decodePlaygroundState(hash: string): Record<string, string> | null {
	try {
		const json = decodeURIComponent(atob(hash));
		const parsed = JSON.parse(json);
		if (typeof parsed === 'object' && parsed !== null) {
			return parsed as Record<string, string>;
		}
		return null;
	} catch {
		return null;
	}
}

export function generateShareUrl(files: Record<string, string>): string {
	const encoded = encodePlaygroundState(files);
	const url = new URL(window.location.href);
	url.searchParams.set('code', encoded);
	return url.toString();
}

export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.select();
		const success = document.execCommand('copy');
		document.body.removeChild(textarea);
		return success;
	}
}
