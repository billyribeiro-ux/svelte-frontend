import { getStorageItem, setStorageItem } from '$utils/local-storage';

const EDITOR_KEY = 'sf-editor-preferences';
const A11Y_KEY = 'sf-a11y-preferences';

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

interface AccessibilityPreferences {
	reducedMotion: boolean;
	highContrast: boolean;
	focusIndicators: 'default' | 'enhanced';
	announceErrors: boolean;
	announceConsole: boolean;
}

const editorDefaults: EditorPreferences = {
	fontSize: 14,
	tabSize: 2,
	wordWrap: false,
	minimap: false,
	lineNumbers: true,
	bracketMatching: true,
	autoCloseBrackets: true,
	keymap: 'default'
};

const a11yDefaults: AccessibilityPreferences = {
	reducedMotion: false,
	highContrast: false,
	focusIndicators: 'default',
	announceErrors: true,
	announceConsole: true
};

class PreferencesState {
	editor = $state<EditorPreferences>(getStorageItem(EDITOR_KEY, editorDefaults));
	accessibility = $state<AccessibilityPreferences>(getStorageItem(A11Y_KEY, a11yDefaults));

	update<K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) {
		this.editor = { ...this.editor, [key]: value };
		setStorageItem(EDITOR_KEY, this.editor);
	}

	updateA11y<K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) {
		this.accessibility = { ...this.accessibility, [key]: value };
		setStorageItem(A11Y_KEY, this.accessibility);
	}

	reset() {
		this.editor = { ...editorDefaults };
		setStorageItem(EDITOR_KEY, this.editor);
	}

	resetA11y() {
		this.accessibility = { ...a11yDefaults };
		setStorageItem(A11Y_KEY, this.accessibility);
	}
}

export const preferences = new PreferencesState();
