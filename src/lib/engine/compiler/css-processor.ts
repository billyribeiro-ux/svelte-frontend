interface CSSValidationResult {
	valid: boolean;
	errors: string[];
}

export function validateCSS(source: string): CSSValidationResult {
	const errors: string[] = [];

	// Check bracket matching
	let depth = 0;
	for (let i = 0; i < source.length; i++) {
		const char = source[i];
		if (char === '{') {
			depth++;
		} else if (char === '}') {
			depth--;
			if (depth < 0) {
				errors.push(`Unexpected closing brace at position ${i}`);
				break;
			}
		}
	}
	if (depth > 0) {
		errors.push(`Missing ${depth} closing brace(s)`);
	}

	// Basic property validation within rule blocks
	const ruleContentPattern = /\{([^{}]*)\}/g;
	let match: RegExpExecArray | null;

	while ((match = ruleContentPattern.exec(source)) !== null) {
		const block = match[1]?.trim() ?? '';
		if (!block) continue;

		const declarations = block.split(';').filter((d) => d.trim());

		for (const declaration of declarations) {
			const trimmed = declaration.trim();
			// Skip comments
			if (trimmed.startsWith('/*') || trimmed.startsWith('//')) continue;

			// Each declaration should have a colon separating property and value
			if (!trimmed.includes(':')) {
				errors.push(`Invalid declaration: "${trimmed}" (missing colon)`);
				continue;
			}

			const colonIndex = trimmed.indexOf(':');
			const property = trimmed.slice(0, colonIndex).trim();
			const value = trimmed.slice(colonIndex + 1).trim();

			if (!property) {
				errors.push(`Empty property name in declaration: "${trimmed}"`);
			}

			if (!value) {
				errors.push(`Empty value for property "${property}"`);
			}

			// Property names should only contain valid characters
			if (property && !/^-?[a-zA-Z_][a-zA-Z0-9_-]*$/.test(property)) {
				errors.push(`Invalid property name: "${property}"`);
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors
	};
}
