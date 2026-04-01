export interface Track {
	id: string;
	slug: string;
	title: string;
	description: string;
	order: number;
	modules: Module[];
}

export interface Module {
	id: string;
	slug: string;
	title: string;
	description: string;
	trackId: string;
	order: number;
	lessons: Lesson[];
}

export interface Lesson {
	id: string;
	slug: string;
	title: string;
	description: string;
	trackId: string;
	moduleId: string;
	order: number;
	estimatedMinutes: number;
	concepts: string[];
	prerequisites: string[];
	content: LessonContent[];
	starterFiles: EditorFile[];
	solutionFiles: EditorFile[];
	checkpoints: Checkpoint[];
}

export interface LessonContent {
	type: 'text' | 'code' | 'checkpoint' | 'hint' | 'concept-callout' | 'xray-prompt';
	content: string;
	metadata?: Record<string, unknown>;
}

export interface Checkpoint {
	id: string;
	description: string;
	validation: CheckpointValidation;
	hints: string[];
	conceptsTested: string[];
}

export interface CheckpointValidation {
	type: 'compiler' | 'output' | 'code-pattern' | 'test';
	config: CheckpointValidationConfig;
}

export interface CodePattern {
	type: 'contains' | 'not-contains' | 'regex' | 'ast-match';
	value: string;
}

export interface CheckpointValidationConfig {
	patterns?: CodePattern[];
	expectedText?: string;
	expectedElements?: string[];
	testFn?: string;
}

export interface EditorFile {
	name: string;
	path: string;
	language: 'svelte' | 'typescript' | 'css' | 'html' | 'json';
	content: string;
	readOnly?: boolean;
	hidden?: boolean;
}
