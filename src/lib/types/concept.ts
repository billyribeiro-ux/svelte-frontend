export type MasteryLevel = 'unstarted' | 'introduced' | 'practicing' | 'competent' | 'mastered';

export type ConceptCategory = 'html' | 'css' | 'typescript' | 'svelte' | 'sveltekit';

export type EdgeType = 'prerequisite' | 'related' | 'builds_on';

export interface ConceptNode {
	id: string;
	title: string;
	description: string;
	category: ConceptCategory;
	subcategory?: string;
	difficulty: number;
	mastery: MasteryLevel;
	score: number;
	lessons: string[];
}

export interface ConceptEdge {
	source: string;
	target: string;
	weight: number;
	type: EdgeType;
}

export interface MasteryUpdate {
	conceptId: string;
	oldScore: number;
	newScore: number;
	mastery: MasteryLevel;
}

export interface ConceptGraph {
	nodes: ConceptNode[];
	edges: ConceptEdge[];
}
