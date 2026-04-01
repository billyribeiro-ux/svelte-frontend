export interface CodeQualitySuggestion {
	line: number;
	message: string;
	severity: 'info' | 'warning';
	pattern: string;
}

export interface CodeQualityResult {
	suggestions: CodeQualitySuggestion[];
	score: number;
}

interface AntiPattern {
	pattern: RegExp;
	message: string;
	severity: 'info' | 'warning';
	label: string;
}

const ANTI_PATTERNS: AntiPattern[] = [
	{
		pattern: /\blet\s+\w+\s*=\s*(?!\$state|\$derived|\$props)/,
		message:
			'Consider using $state() for reactive variables instead of plain "let". In Svelte 5, reactivity requires runes.',
		severity: 'info',
		label: 'let-without-rune'
	},
	{
		pattern: /\$:\s/,
		message:
			'The "$:" reactive label is a Svelte 4 pattern. Use $derived() or $effect() instead in Svelte 5.',
		severity: 'warning',
		label: 'svelte4-reactive-label'
	},
	{
		pattern: /export\s+let\s+/,
		message:
			'"export let" is a Svelte 4 pattern for props. Use $props() in Svelte 5 instead.',
		severity: 'warning',
		label: 'svelte4-export-let'
	},
	{
		pattern: /<slot\s*\/?>|<slot[\s>]/,
		message:
			'<slot> is a Svelte 4 pattern. Use {@render children()} with snippet props in Svelte 5.',
		severity: 'warning',
		label: 'svelte4-slot'
	},
	{
		pattern: /\bonMount\b/,
		message:
			'onMount is still valid, but consider using $effect() for lifecycle logic in Svelte 5.',
		severity: 'info',
		label: 'onmount-vs-effect'
	},
	{
		pattern: /\bbeforeUpdate\b|\bafterUpdate\b/,
		message:
			'beforeUpdate/afterUpdate are deprecated in Svelte 5. Use $effect.pre() or $effect() instead.',
		severity: 'warning',
		label: 'svelte4-lifecycle'
	},
	{
		pattern: /createEventDispatcher/,
		message:
			'createEventDispatcher is a Svelte 4 pattern. Use callback props in Svelte 5 instead.',
		severity: 'warning',
		label: 'svelte4-dispatcher'
	}
];

export function analyzeCodeQuality(code: string): CodeQualityResult {
	const suggestions: CodeQualitySuggestion[] = [];
	const lines = code.split('\n');

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]!;
		for (const antiPattern of ANTI_PATTERNS) {
			if (antiPattern.pattern.test(line)) {
				suggestions.push({
					line: i + 1,
					message: antiPattern.message,
					severity: antiPattern.severity,
					pattern: antiPattern.label
				});
			}
		}
	}

	// Score: 100 minus penalties
	const warningPenalty = suggestions.filter((s) => s.severity === 'warning').length * 10;
	const infoPenalty = suggestions.filter((s) => s.severity === 'info').length * 3;
	const score = Math.max(0, 100 - warningPenalty - infoPenalty);

	return { suggestions, score };
}
