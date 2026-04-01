import type { Module } from '$types/lesson';
import { documentStructure } from './01-document-structure';
import { semanticElements } from './02-semantic-elements';
import { formsAndInputs } from './03-forms-and-inputs';

export const htmlEssentialsModule: Module = {
	id: 'html-essentials',
	slug: 'html-essentials',
	title: 'HTML Essentials',
	description: 'Learn the building blocks of the web — semantic HTML, document structure, and forms.',
	trackId: 'foundations',
	order: 1,
	lessons: [documentStructure, semanticElements, formsAndInputs]
};
