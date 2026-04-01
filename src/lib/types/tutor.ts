import type { MasteryLevel } from './concept';

export interface TutorMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
}

export interface TutorContext {
	lessonTitle: string;
	concepts: string[];
	currentCode: string;
	compilationErrors: string[];
	masteryState: TutorMasteryItem[];
	conversationHistory: TutorMessage[];
}

export interface TutorMasteryItem {
	concept: string;
	level: MasteryLevel;
	score: number;
}

export interface TutorResponse {
	response: string;
	suggestions?: TutorSuggestion[];
}

export interface TutorSuggestion {
	id: string;
	label: string;
	prompt: string;
	type: 'hint' | 'explain' | 'debug' | 'review';
}
