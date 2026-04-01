import type { Module } from '$types/lesson';
import { flexboxFundamentals } from './01-flexbox-fundamentals';
import { cssGridFundamentals } from './02-css-grid-fundamentals';
import { positioning } from './03-positioning';
import { responsiveDesignCss } from './04-responsive-design';
import { logicalProperties } from './05-logical-properties';

export const cssLayoutModule: Module = {
	id: 'css-layout',
	slug: 'css-layout',
	title: 'CSS Layout',
	description: 'Master modern layout techniques — Flexbox, CSS Grid, positioning, responsive design, and logical properties.',
	trackId: 'foundations',
	order: 4,
	lessons: [flexboxFundamentals, cssGridFundamentals, positioning, responsiveDesignCss, logicalProperties]
};
