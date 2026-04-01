import type { Checkpoint, CheckpointValidation } from '$types/lesson';
import type { CompilationResult } from '$types/editor';

export interface CheckpointResult {
	passed: boolean;
	message: string;
}

export function validateCheckpoint(
	checkpoint: Checkpoint,
	code: string,
	compilationResult: CompilationResult | null
): CheckpointResult {
	const { validation } = checkpoint;

	switch (validation.type) {
		case 'compiler':
			return validateCompiler(compilationResult);
		case 'output':
			return validateOutput();
		case 'code-pattern':
			return validateCodePattern(validation, code);
		case 'test':
			return validateTest();
		default:
			return { passed: false, message: `Unknown validation type: ${(validation as CheckpointValidation).type}` };
	}
}

function validateCompiler(result: CompilationResult | null): CheckpointResult {
	if (!result) {
		return { passed: false, message: 'Code has not been compiled yet.' };
	}

	if (result.errors.length > 0) {
		const firstError = result.errors[0]!;
		return {
			passed: false,
			message: `Compilation error: ${firstError.message}`
		};
	}

	if (!result.success) {
		return { passed: false, message: 'Compilation failed.' };
	}

	return { passed: true, message: 'Code compiles successfully.' };
}

function validateOutput(): CheckpointResult {
	// Phase 1 stub: output validation not yet implemented
	return { passed: true, message: 'Output validation will be available in a future update.' };
}

function validateCodePattern(
	validation: CheckpointValidation,
	code: string
): CheckpointResult {
	const patterns = validation.config.patterns;

	if (!patterns || patterns.length === 0) {
		return { passed: true, message: 'No patterns to validate.' };
	}

	for (const pattern of patterns) {
		switch (pattern.type) {
			case 'contains': {
				if (!code.includes(pattern.value)) {
					return {
						passed: false,
						message: `Expected code to contain: "${pattern.value}"`
					};
				}
				break;
			}
			case 'not-contains': {
				if (code.includes(pattern.value)) {
					return {
						passed: false,
						message: `Code should not contain: "${pattern.value}"`
					};
				}
				break;
			}
			case 'regex': {
				try {
					const regex = new RegExp(pattern.value);
					if (!regex.test(code)) {
						return {
							passed: false,
							message: `Code does not match expected pattern: ${pattern.value}`
						};
					}
				} catch {
					return {
						passed: false,
						message: `Invalid regex pattern: ${pattern.value}`
					};
				}
				break;
			}
			case 'ast-match': {
				// AST matching is advanced; stub for now
				break;
			}
			default: {
				return {
					passed: false,
					message: `Unknown pattern type: ${(pattern as { type: string }).type}`
				};
			}
		}
	}

	return { passed: true, message: 'All code patterns matched.' };
}

function validateTest(): CheckpointResult {
	// Phase 1 stub: test validation not yet implemented
	return { passed: true, message: 'Test validation will be available in a future update.' };
}
