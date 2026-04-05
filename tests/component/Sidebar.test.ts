import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Sidebar from '$lib/components/nav/Sidebar.svelte';
import { course } from '$lib/data/curriculum';

// NOTE: Sidebar takes `phases: Phase[]` and `currentLessonId: string | null`.
// No callback props. Footer credit text is the exact string "Billy Ribeiro" inside
// a `.credit` span within `.sidebar-footer`.

describe('Sidebar', () => {
	it('renders one PhaseSection per phase in course.phases (7 total)', () => {
		render(Sidebar, {
			props: { phases: course.phases, currentLessonId: null }
		});

		// Each phase header button text contains "Phase N"
		for (const phase of course.phases) {
			expect(screen.getByText(`Phase ${phase.index}`)).toBeInTheDocument();
			expect(screen.getByText(phase.title)).toBeInTheDocument();
		}

		expect(course.phases.length).toBe(7);
	});

	it('shows the "Billy Ribeiro" footer credit', () => {
		render(Sidebar, {
			props: { phases: course.phases, currentLessonId: null }
		});

		expect(screen.getByText('Billy Ribeiro')).toBeInTheDocument();
	});

	it('shows the progress summary text', () => {
		render(Sidebar, {
			props: { phases: course.phases, currentLessonId: null }
		});

		// Format: `{completed}/{totalLessons} lessons complete`
		expect(screen.getByText(/\d+\/\d+ lessons complete/)).toBeInTheDocument();
	});
});
