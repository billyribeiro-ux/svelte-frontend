import type { EditorFile } from '$types/lesson';
import type { CompilationResult } from '$types/editor';

class EditorState {
	files = $state<EditorFile[]>([]);
	activeFileIndex = $state(0);
	compilationResult = $state<CompilationResult | null>(null);
	isCompiling = $state(false);
	isDirty = $state(false);

	activeFile = $derived(this.files[this.activeFileIndex] ?? null);

	setFiles(files: EditorFile[]) {
		this.files = files.map((f) => ({ ...f }));
		this.activeFileIndex = 0;
		this.isDirty = false;
	}

	setActiveFile(index: number) {
		if (index >= 0 && index < this.files.length) {
			this.activeFileIndex = index;
		}
	}

	updateFileContent(index: number, content: string) {
		const file = this.files[index];
		if (file && !file.readOnly) {
			this.files[index] = { ...file, content };
			this.isDirty = true;
		}
	}

	updateActiveFileContent(content: string) {
		this.updateFileContent(this.activeFileIndex, content);
	}

	setCompilationResult(result: CompilationResult) {
		this.compilationResult = result;
		this.isCompiling = false;
	}

	getFileByPath(path: string): EditorFile | undefined {
		return this.files.find((f) => f.path === path);
	}

	getCodeSnapshot(): Record<string, string> {
		const snapshot: Record<string, string> = {};
		for (const file of this.files) {
			snapshot[file.path] = file.content;
		}
		return snapshot;
	}

	resetToStarter(starterFiles: EditorFile[]) {
		this.setFiles(starterFiles);
		this.compilationResult = null;
	}
}

export const editor = new EditorState();
