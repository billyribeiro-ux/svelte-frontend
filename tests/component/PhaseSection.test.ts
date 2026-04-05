import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import PhaseSection from '$lib/components/nav/PhaseSection.svelte';
import { resetProgress, markComplete } from '$lib/stores/progress.svelte';
import type { Phase } from '$lib/types';

// NOTE: PhaseSection takes `phase: Phase` and `currentLessonId: string | null`.
// No callback props. Expansion is internal $state, auto-expands via $effect when
// currentLessonId matches a lesson in the phase. Progress bar is an inner div with
// inline style `width: {progressPercent}%` inside `.progress-bar-container`.

function makePhase(): Phase {
	return {
		index: 1,
		title: 'First Steps',
		description: 'Intro phase',
		modules: [
			{
				index: 0,
				title: 'First Contact',
				lessonCount: 2,
				lessons: [
					{ id: '0-1', title: 'Set Up', phase: 1, module: 0, lessonIndex: 1 },
					{ id: '0-2', title: 'Hello', phase: 1, module: 0, lessonIndex: 2 }
				]
			},
			{
				index: 1,
				title: 'Working with Data',
				lessonCount: 2,
				lessons: [
					{ id: '1-1', title: 'Objects', phase: 1, module: 1, lessonIndex: 1 },
					{ id: '1-2', title: 'Arrays', phase: 1, module: 1, lessonIndex: 2 }
				]
			}
		]
	};
}

describe('PhaseSection', () => {
	beforeEach(() => {
		resetProgress();
	});

	it('renders the phase title and phase number label', () => {
		render(PhaseSection, {
			props: { phase: makePhase(), currentLessonId: null }
		});

		expect(screen.getByText('First Steps')).toBeInTheDocument();
		expect(screen.getByText('Phase 1')).toBeInTheDocument();
	});

	it('auto-expands when currentLessonId matches a child lesson', () => {
		render(PhaseSection, {
			props: { phase: makePhase(), currentLessonId: '1-2' }
		});

		// Modules are visible once expanded
		expect(screen.getByText('First Contact')).toBeInTheDocument();
		expect(screen.getByText('Working with Data')).toBeInTheDocument();
	});

	it('starts collapsed when currentLessonId is null and expands on header click', async () => {
		const user = userEvent.setup();
		render(PhaseSection, {
			props: { phase: makePhase(), currentLessonId: null }
		});

		// Collapsed: no module titles visible
		expect(screen.queryByText('First Contact')).toBeNull();

		const header = screen.getByRole('button', { name: /First Steps/ });
		await user.click(header);

		expect(screen.getByText('First Contact')).toBeInTheDocument();

		// Click again collapses
		await user.click(header);
		expect(screen.queryByText('First Contact')).toBeNull();
	});

	it('progress bar width reflects completed/total ratio', () => {
		// Mark 1 of 4 lessons complete → 25%
		markComplete('0-1');

		const { container } = render(PhaseSection, {
			props: { phase: makePhase(), currentLessonId: null }
		});

		const bar = container.querySelector('.progress-bar') as HTMLElement | null;
		expect(bar).not.toBeNull();
		expect(bar?.getAttribute('style')).toContain('width: 25%');
	});

	it('progress bar is 0% when nothing is complete', () => {
		const { container } = render(PhaseSection, {
			props: { phase: makePhase(), currentLessonId: null }
		});

		const bar = container.querySelector('.progress-bar') as HTMLElement | null;
		expect(bar?.getAttribute('style')).toContain('width: 0%');
	});
});
