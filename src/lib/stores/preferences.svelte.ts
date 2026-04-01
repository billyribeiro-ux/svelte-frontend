import { getStorageItem, setStorageItem } from '$utils/local-storage';

const STORAGE_KEY = 'sf-editor-preferences';

interface EditorPreferences {
	fontSize: number;
	tabSize: number;
	wordWrap: boolean;
	minimap: boolean;
	lineNumbers: boolean;
	bracketMatching: boolean;
	autoCloseBrackets: boolean;
	keymap: 'default' | 'vim';
}

const defaults: EditorPreferences = {
	fontSize: 14,
	tabSize: 2,
	wordWrap: false,
	minimap: false,
	lineNumbers: true,
	bracketMatching: true,
	autoCloseBrackets: true,
	keymap: 'default'
};

class PreferencesState {
	editor = $state<EditorPreferences>(getStorageItem(STORAGE_KEY, defaults));

	update<K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) {
		this.editor = { ...this.editor, [key]: value };
		setStorageItem(STORAGE_KEY, this.editor);
	}

	reset() {
		this.editor = { ...defaults };
		setStorageItem(STORAGE_KEY, this.editor);
	}
}

export const preferences = new PreferencesState();
