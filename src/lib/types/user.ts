import type { MasteryLevel } from './concept';

export interface User {
	id: string;
	email: string;
	displayName: string;
	avatarUrl: string | null;
	authProvider: 'github' | 'google' | 'email';
	createdAt: string;
	preferences: UserPreferences;
}

export interface UserPreferences {
	theme: 'dark' | 'light';
	editorKeymap: 'default' | 'vim';
	editorFontSize: number;
	editorTabSize: number;
	panelLayout: 'default' | 'editor-focus' | 'lesson-focus';
}

export interface UserProgress {
	conceptMastery: ConceptMastery[];
	lessonProgress: LessonProgress[];
	streak: Streak;
}

export interface ConceptMastery {
	conceptId: string;
	mastery: MasteryLevel;
	score: number;
	attempts: number;
	lastAttemptAt: string | null;
}

export interface LessonProgress {
	lessonId: string;
	trackId: string;
	moduleId: string;
	status: 'not_started' | 'in_progress' | 'completed';
	checkpointsCompleted: string[];
	codeSnapshots: Record<string, string>;
	startedAt: string | null;
	completedAt: string | null;
	timeSpentSeconds: number;
}

export interface Streak {
	currentStreak: number;
	longestStreak: number;
	lastActivityDate: string | null;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
	theme: 'dark',
	editorKeymap: 'default',
	editorFontSize: 14,
	editorTabSize: 2,
	panelLayout: 'default'
};
