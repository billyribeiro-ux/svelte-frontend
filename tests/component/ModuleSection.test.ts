import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ModuleSection from '$lib/components/nav/ModuleSection.svelte';
import { resetProgress, markComplete } from '$lib/stores/progress.svelte';
import type { Module } from '$lib/types';

// NOTE: ModuleSection takes `module: Module`, `phaseIndex: number`, `currentLessonId: string | null`.
// No callback props. Displays the count as exact text `{completedCount}/{module.lessonCount}`
// (e.g. "1/3", NO spaces) inside a `.module-count` span.

function makeModule(): Module {
	return {
		index: 2,
		title: 'Components & Props',
		lessonCount: 3,
		lessons: [
			{ id: '2-1', title: 'Your First Component', phase: 1, module: 2, lessonIndex: 1 },
			{ id: '2-2', title: 'Passing Data', phase: 1, module: 2, lessonIndex: 2 },
			{ id: '2-3', title: 'Conditional Rendering', phase: 1, module: 2, lessonIndex: 3 }
		]
	};
}

describe('ModuleSection', () => {
	beforeEach(() => {
		resetProgress();
	});

	it('renders the module title and number', () => {
		render(ModuleSection, {
			props: { module: makeModule(), phaseIndex: 1, currentLessonId: null }
		});

		expect(screen.getByText('Components & Props')).toBeInTheDocument();
		expect(screen.getByText('2.')).toBeInTheDocument();
	});

	it('shows "0/3" count when nothing is complete', () => {
		render(ModuleSection, {
			props: { module: makeModule(), phaseIndex: 1, currentLessonId: null }
		});

		expect(screen.getByText('0/3')).toBeInTheDocument();
	});

	it('shows "2/3" after marking two lessons complete', () => {
		markComplete('2-1');
		markComplete('2-3');

		render(ModuleSection, {
			props: { module: makeModule(), phaseIndex: 1, currentLessonId: null }
		});

		expect(screen.getByText('2/3')).toBeInTheDocument();
	});

	it('auto-expands when currentLessonId is inside the module', () => {
		render(ModuleSection, {
			props: { module: makeModule(), phaseIndex: 1, currentLessonId: '2-2' }
		});

		expect(screen.getByRole('link', { name: /Your First Component/ })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /Passing Data/ })).toBeInTheDocument();
	});

	it('starts collapsed with null currentLessonId and toggles on header click', async () => {
		const user = userEvent.setup();
		render(ModuleSection, {
			props: { module: makeModule(), phaseIndex: 1, currentLessonId: null }
		});

		expect(screen.queryByRole('link', { name: /Your First Component/ })).toBeNull();

		const header = screen.getByRole('button', { name: /Components & Props/ });
		await user.click(header);

		expect(screen.getByRole('link', { name: /Your First Component/ })).toBeInTheDocument();
	});
});
