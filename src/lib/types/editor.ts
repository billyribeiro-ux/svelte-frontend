export interface PanelConfig {
	width?: number;
	height?: number;
	collapsed: boolean;
	activeTab?: string;
}

export interface PanelLayout {
	lesson: PanelConfig;
	editor: PanelConfig;
	preview: PanelConfig;
	bottom: PanelConfig & { activeTab: string };
}

export type ActivePanel = 'lesson' | 'editor' | 'preview' | 'bottom';

export interface CompilationResult {
	success: boolean;
	js: string | null;
	css: string | null;
	warnings: CompileWarning[];
	errors: CompileError[];
	ast: unknown;
	metadata: CompilationMetadata;
}

export interface CompilationMetadata {
	runes: string[];
	bindings: string[];
	dependencies: string[];
}

export interface CompileWarning {
	message: string;
	code: string;
	start?: { line: number; column: number };
	end?: { line: number; column: number };
}

export interface CompileError {
	message: string;
	code?: string;
	start?: { line: number; column: number };
	end?: { line: number; column: number };
	stack?: string;
}

export interface ConsoleEntry {
	id: string;
	method: 'log' | 'warn' | 'error' | 'info' | 'table';
	args: string[];
	timestamp: number;
}

export interface RuntimeError {
	message: string;
	line?: number;
	column?: number;
	stack?: string;
}

export interface DOMMutation {
	type: string;
	target: string;
	added: number;
	removed: number;
	attribute?: string | null;
}
