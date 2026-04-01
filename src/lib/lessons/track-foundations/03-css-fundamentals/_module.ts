import type { Module } from '$types/lesson';
import { howCssWorks } from './01-how-css-works';
import { selectors } from './02-selectors';
import { boxModel } from './03-box-model';
import { colorsAndBackgrounds } from './04-colors-and-backgrounds';
import { typography } from './05-typography';
import { unitsAndValues } from './06-units-and-values';

export const cssFundamentalsModule: Module = {
	id: 'css-fundamentals',
	slug: 'css-fundamentals',
	title: 'CSS Fundamentals',
	description: 'Master the core concepts of CSS — cascade, selectors, the box model, colors, typography, and units.',
	trackId: 'foundations',
	order: 3,
	lessons: [howCssWorks, selectors, boxModel, colorsAndBackgrounds, typography, unitsAndValues]
};
