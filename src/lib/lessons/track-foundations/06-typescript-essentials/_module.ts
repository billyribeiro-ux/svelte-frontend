import type { Module } from '$types/lesson';
import { typesAndAnnotations } from './01-types-and-annotations';
import { interfacesAndTypeAliases } from './02-interfaces-and-type-aliases';
import { unionAndIntersection } from './03-union-and-intersection';
import { generics } from './04-generics';
import { utilityTypes } from './05-utility-types';
import { strictMode } from './06-strict-mode';

export const typescriptEssentialsModule: Module = {
	id: 'typescript-essentials',
	slug: 'typescript-essentials',
	title: 'TypeScript Essentials',
	description: 'Build a strong TypeScript foundation — types, interfaces, generics, utility types, and strict mode.',
	trackId: 'foundations',
	order: 6,
	lessons: [typesAndAnnotations, interfacesAndTypeAliases, unionAndIntersection, generics, utilityTypes, strictMode]
};
