import type { Module } from '$types/lesson';
import { taskCrud } from './01-task-crud';
import { taskFiltering } from './02-task-filtering';
import { dragAndDrop } from './03-drag-and-drop';
import { taskPersistence } from './04-task-persistence';

export const buildATaskManagerModule: Module = {
	id: 'build-a-task-manager',
	slug: 'build-a-task-manager',
	title: 'Build a Task Manager',
	description:
		'Build a Kanban-style task manager with CRUD operations, advanced filtering, drag-and-drop reordering, and persistent storage.',
	trackId: 'projects',
	order: 3,
	lessons: [taskCrud, taskFiltering, dragAndDrop, taskPersistence]
};
