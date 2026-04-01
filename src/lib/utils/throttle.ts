export function throttle<T extends (...args: Parameters<T>) => void>(
	fn: T,
	limit: number
): (...args: Parameters<T>) => void {
	let lastCall = 0;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return (...args: Parameters<T>) => {
		const now = Date.now();
		const remaining = limit - (now - lastCall);

		if (remaining <= 0) {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
			lastCall = now;
			fn(...args);
		} else if (!timeoutId) {
			timeoutId = setTimeout(() => {
				lastCall = Date.now();
				timeoutId = null;
				fn(...args);
			}, remaining);
		}
	};
}
