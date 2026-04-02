import type { Module } from '$types/lesson';
import { dashboardLayout } from './01-dashboard-layout';
import { dataVisualization } from './02-data-visualization';
import { dataTables } from './03-data-tables';
import { realTimeUpdates } from './04-real-time-updates';

export const buildADashboardModule: Module = {
	id: 'build-a-dashboard',
	slug: 'build-a-dashboard',
	title: 'Build a Dashboard',
	description:
		'Construct a data-driven dashboard with responsive layouts, interactive charts, sortable tables, and real-time data updates.',
	trackId: 'projects',
	order: 2,
	lessons: [dashboardLayout, dataVisualization, dataTables, realTimeUpdates]
};
