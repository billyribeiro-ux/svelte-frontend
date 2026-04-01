export interface ApiResponse<T> {
	data: T;
	error: null;
}

export interface ApiError {
	data: null;
	error: {
		message: string;
		code: string;
		status: number;
	};
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface ProgressUpdateRequest {
	lessonId: string;
	checkpointId?: string;
	codeSnapshot?: Record<string, string>;
	timeSpentSeconds?: number;
}

export interface TutorMessageRequest {
	message: string;
	context: {
		lessonId: string;
		currentCode: string;
		compilationErrors: string[];
	};
}

export interface AnalyzeRequest {
	code: string;
	language: 'svelte' | 'typescript' | 'css' | 'html';
}

export interface AnalyzeResponse {
	issues: AnalysisIssue[];
	suggestions: string[];
}

export interface AnalysisIssue {
	severity: 'error' | 'warning' | 'info';
	message: string;
	line?: number;
	column?: number;
	ruleId?: string;
}
