import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import FileTabs from '$lib/components/ide/FileTabs.svelte';
import type { LessonFile } from '$lib/types';

// NOTE: FileTabs uses `onselect` prop (lowercase, takes index: number).
// Other props: `files: LessonFile[]`, `activeIndex: number`.
// Active tab has class `active` on its <button>.

const files: LessonFile[] = [
	{ filename: 'App.svelte', content: '<h1/>', language: 'svelte' },
	{ filename: 'main.ts', content: 'export {}', language: 'typescript' },
	{ filename: 'style.css', content: '', language: 'css' }
];

describe('FileTabs', () => {
	it('renders one tab button per file in the files prop', () => {
		render(FileTabs, {
			props: { files, activeIndex: 0, onselect: vi.fn() }
		});

		expect(screen.getByRole('button', { name: /App\.svelte/ })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /main\.ts/ })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /style\.css/ })).toBeInTheDocument();
	});

	it('clicking an inactive tab fires onselect(index)', async () => {
		const user = userEvent.setup();
		const spy = vi.fn();
		render(FileTabs, {
			props: { files, activeIndex: 0, onselect: spy }
		});

		await user.click(screen.getByRole('button', { name: /main\.ts/ }));
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(1);

		await user.click(screen.getByRole('button', { name: /style\.css/ }));
		expect(spy).toHaveBeenCalledTimes(2);
		expect(spy).toHaveBeenLastCalledWith(2);
	});

	it('active tab has the `active` class and others do not', () => {
		render(FileTabs, {
			props: { files, activeIndex: 1, onselect: vi.fn() }
		});

		const appTab = screen.getByRole('button', { name: /App\.svelte/ });
		const mainTab = screen.getByRole('button', { name: /main\.ts/ });
		const styleTab = screen.getByRole('button', { name: /style\.css/ });

		expect(mainTab.classList.contains('active')).toBe(true);
		expect(appTab.classList.contains('active')).toBe(false);
		expect(styleTab.classList.contains('active')).toBe(false);
	});
});
