let sidebarOpen = $state(false);

export function getSidebarOpen(): boolean {
	return sidebarOpen;
}

export function toggleSidebar(): void {
	sidebarOpen = !sidebarOpen;
}

export function closeSidebar(): void {
	sidebarOpen = false;
}
