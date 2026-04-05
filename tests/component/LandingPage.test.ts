import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Page from '../../src/routes/+page.svelte';
import { course } from '$lib/data/curriculum';

// NOTE: Landing page (+page.svelte) takes NO props. It imports `course` from
// $data/curriculum directly and renders one `.phase-card` per phase. Hero title is
// split across spans ("Svelte" + " PE7 Mastery"). "Start Learning" anchor href is
// /course/1/0/1.

describe('Landing page (+page.svelte)', () => {
	it('renders the hero title heading', () => {
		render(Page);

		const heading = screen.getByRole('heading', { level: 1 });
		expect(heading).toBeInTheDocument();
		expect(heading.textContent).toContain('Svelte');
		expect(heading.textContent).toContain('PE7 Mastery');
	});

	it('renders the stats section with 21 modules, 155 lessons, 7 phases', () => {
		render(Page);

		expect(screen.getByText('21')).toBeInTheDocument();
		expect(screen.getByText('Modules')).toBeInTheDocument();
		expect(screen.getByText('155')).toBeInTheDocument();
		expect(screen.getByText('Lessons')).toBeInTheDocument();
		expect(screen.getByText('7')).toBeInTheDocument();
		expect(screen.getByText('Phases')).toBeInTheDocument();
	});

	it('renders a "Start Learning" link with href /course/1/0/1', () => {
		render(Page);

		const link = screen.getByRole('link', { name: 'Start Learning' });
		expect(link).toHaveAttribute('href', '/course/1/0/1');
	});

	it('renders 7 phase cards, one per course phase', () => {
		const { container } = render(Page);

		const cards = container.querySelectorAll('.phase-card');
		expect(cards.length).toBe(7);
		expect(course.phases.length).toBe(7);

		// Each phase title should appear as an <h3> inside a card
		for (const phase of course.phases) {
			expect(
				screen.getByRole('heading', { level: 3, name: phase.title })
			).toBeInTheDocument();
			expect(screen.getByText(`Phase ${phase.index}`)).toBeInTheDocument();
		}
	});
});
