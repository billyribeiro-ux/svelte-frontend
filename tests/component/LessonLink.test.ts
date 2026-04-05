import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import LessonLink from '$lib/components/nav/LessonLink.svelte';
import type { LessonMeta } from '$lib/types';

// NOTE: LessonLink takes `lesson: LessonMeta`, `isActive: boolean`, `isCompleted: boolean`.
// href is derived as `/course/${lesson.phase}/${lesson.module}/${lesson.lessonIndex}`.
// When isActive, the <a> has class `active` AND aria-current="page".
// When isCompleted, a checkmark span is rendered.

const lesson: LessonMeta = {
	id: '2-1',
	title: 'Your First Component',
	phase: 1,
	module: 2,
	lessonIndex: 1
};

describe('LessonLink', () => {
	it('renders an anchor with the correct /course/{phase}/{module}/{lesson} href', () => {
		render(LessonLink, {
			props: { lesson, isActive: false, isCompleted: false }
		});

		const link = screen.getByRole('link', { name: /Your First Component/ });
		expect(link).toHaveAttribute('href', '/course/1/2/1');
	});

	it('applies aria-current="page" and active class when isActive is true', () => {
		render(LessonLink, {
			props: { lesson, isActive: true, isCompleted: false }
		});

		const link = screen.getByRole('link', { name: /Your First Component/ });
		expect(link).toHaveAttribute('aria-current', 'page');
		expect(link.classList.contains('active')).toBe(true);
	});

	it('does not set aria-current when isActive is false', () => {
		render(LessonLink, {
			props: { lesson, isActive: false, isCompleted: false }
		});

		const link = screen.getByRole('link', { name: /Your First Component/ });
		expect(link).not.toHaveAttribute('aria-current');
	});

	it('shows a checkmark element when isCompleted is true', () => {
		const { container } = render(LessonLink, {
			props: { lesson, isActive: false, isCompleted: true }
		});

		const checkmark = container.querySelector('.checkmark');
		expect(checkmark).not.toBeNull();
		expect(checkmark?.textContent).toContain('\u2714');
	});

	it('does not render checkmark when isCompleted is false', () => {
		const { container } = render(LessonLink, {
			props: { lesson, isActive: false, isCompleted: false }
		});

		expect(container.querySelector('.checkmark')).toBeNull();
	});
});
