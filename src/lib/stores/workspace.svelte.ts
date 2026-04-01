import type { PanelLayout, ActivePanel } from '$types/editor';
import { getStorageItem, setStorageItem } from '$utils/local-storage';

const STORAGE_KEY = 'sf-workspace-layout';

const defaultLayout: PanelLayout = {
	lesson: { width: 320, collapsed: false },
	editor: { width: 0, collapsed: false },
	preview: { width: 400, collapsed: false },
	bottom: { height: 200, collapsed: false, activeTab: 'console' }
};

class WorkspaceState {
	layout = $state<PanelLayout>(getStorageItem(STORAGE_KEY, defaultLayout));
	activePanel = $state<ActivePanel>('editor');
	commandPaletteOpen = $state(false);
	xrayEnabled = $state(false);

	isFullscreen = $derived(
		this.layout.lesson.collapsed &&
			this.layout.preview.collapsed &&
			this.layout.bottom.collapsed
	);

	togglePanel(panel: keyof PanelLayout) {
		this.layout[panel].collapsed = !this.layout[panel].collapsed;
		this.persist();
	}

	setBottomTab(tab: string) {
		this.layout.bottom.activeTab = tab;
		if (this.layout.bottom.collapsed) {
			this.layout.bottom.collapsed = false;
		}
		this.persist();
	}

	setPanelWidth(panel: 'lesson' | 'preview', width: number) {
		this.layout[panel].width = width;
		this.persist();
	}

	setBottomHeight(height: number) {
		this.layout.bottom.height = height;
		this.persist();
	}

	resetLayout() {
		this.layout = { ...defaultLayout };
		this.persist();
	}

	private persist() {
		setStorageItem(STORAGE_KEY, this.layout);
	}
}

export const workspace = new WorkspaceState();
