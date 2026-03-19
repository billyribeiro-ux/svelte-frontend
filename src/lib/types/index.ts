// ---- Curriculum Tree ----

export interface Course {
	id: string;
	title: string;
	phases: Phase[];
}

export interface Phase {
	index: number;
	title: string;
	description: string;
	modules: Module[];
	project?: string;
	checkpoint?: string[];
}

export interface Module {
	index: number;
	title: string;
	lessonCount: number;
	lessons: LessonMeta[];
}

export interface LessonMeta {
	id: string;
	title: string;
	phase: number;
	module: number;
	lessonIndex: number;
}

// ---- Lesson Content ----

export interface LessonFile {
	filename: string;
	content: string;
	language: string;
}

export interface LessonData {
	meta: LessonMeta;
	description: string;
	objectives: string[];
	files: LessonFile[];
	solution?: LessonFile[];
}

// ---- Progress ----

export interface LessonProgress {
	completed: boolean;
	completedAt?: string;
	code?: Record<string, string>;
}

export type ProgressMap = Record<string, LessonProgress>;

// ---- IDE State ----

export interface IDEState {
	openFiles: LessonFile[];
	activeFileIndex: number;
	isContainerReady: boolean;
	isContainerBooting: boolean;
	previewUrl: string | null;
}
