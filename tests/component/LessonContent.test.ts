import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import LessonContent from '$lib/components/lesson/LessonContent.svelte';

// NOTE: LessonContent uses `onmarkComplete` prop (lowercase "on", camelCase "markComplete")
// and `isCompleted` prop. Button is disabled AND shows "Completed ✔" when isCompleted is true.

function baseProps(overrides: Partial<Record<string, unknown>> = {}) {
	return {
		title: 'Your First Component',
		objectives: [
			'Create a .svelte file',
			'Export a component',
			'Render it from a parent'
		],
		description: 'Components are the building blocks of Svelte apps.',
		lessonId: '2-1',
		onmarkComplete: vi.fn(),
		isCompleted: false,
		...overrides
	};
}

describe('LessonContent', () => {
	it('renders title, every objective, and description', () => {
		const props = baseProps();
		render(LessonContent, { props });

		expect(screen.getByRole('heading', { level: 1, name: 'Your First Component' })).toBeInTheDocument();
		for (const objective of props.objectives as string[]) {
			expect(screen.getByText(objective)).toBeInTheDocument();
		}
		expect(screen.getByText('Components are the building blocks of Svelte apps.')).toBeInTheDocument();
	});

	it('fires onmarkComplete exactly once when Mark Complete is clicked', async () => {
		const user = userEvent.setup();
		const spy = vi.fn();
		render(LessonContent, { props: baseProps({ onmarkComplete: spy }) });

		const btn = screen.getByRole('button', { name: 'Mark Complete' });
		await user.click(btn);

		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('when isCompleted is true, button is disabled and shows "Completed"', () => {
		render(LessonContent, { props: baseProps({ isCompleted: true }) });

		// Button text becomes "Completed ✔" (U+2714)
		const btn = screen.getByRole('button', { name: /Completed/i });
		expect(btn).toBeDisabled();
		expect(btn.textContent).toContain('Completed');
	});
});
