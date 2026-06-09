<script lang="ts">
	import { untrack } from 'svelte';
	import type { LessonFile } from '$lib/types';
	import { Splitpanes, Pane } from 'svelte-splitpanes';
	import FileTabs from './FileTabs.svelte';
	import MonacoEditor from './MonacoEditor.svelte';
	import Preview from './Preview.svelte';
	import {
		getPreviewUrl,
		getIsContainerBooting,
		setActiveFile,
		updateContent,
		loadLesson,
		setContainerBooting,
		setContainerReady,
		setPreviewUrl
	} from '$lib/stores/ide.svelte';
	import {
		loadSavedCode,
		clearSavedCode,
		debouncedSave,
		getSaveIndicatorVisible
	} from '$lib/stores/codeSave.svelte';

	let {
		files,
		lessonId = ''
	}: {
		files: LessonFile[];
		lessonId?: string;
	} = $props();

	let activeFileIndex = $state(0);
	let containerError = $state<string | null>(null);
	let workingFiles = $state<LessonFile[]>([]);

	// Load lesson files and boot WebContainer when the lesson changes.
	// Only `files`/`lessonId` are tracked dependencies — everything else runs
	// untracked so that reading `workingFiles` back (in loadLesson/bootContainer)
	// doesn't register it as a dependency of this effect and loop forever.
	$effect(() => {
		if (files.length === 0) return;
		const currentFiles = files;
		const currentLessonId = lessonId;
		untrack(() => {
			const saved = currentLessonId ? loadSavedCode(currentLessonId) : null;
			workingFiles = saved ?? currentFiles.map((f) => ({ ...f }));
			loadLesson(workingFiles);
			activeFileIndex = 0;
			bootContainer(workingFiles);
		});
	});

	let activeFile = $derived(workingFiles[activeFileIndex]);

	async function bootContainer(lessonFiles: LessonFile[]) {
		containerError = null;
		setContainerBooting();
		try {
			const { mountLessonFiles, startDevServer } = await import('$lib/utils/webcontainer');
			await mountLessonFiles(lessonFiles);
			const url = await startDevServer();
			setPreviewUrl(url);
			setContainerReady();
		} catch (err) {
			containerError = err instanceof Error ? err.message : 'Failed to start preview';
			setContainerReady();
		}
	}

	function handleTabSelect(index: number) {
		activeFileIndex = index;
		setActiveFile(index);
	}

	async function handleContentChange(value: string) {
		if (activeFile) {
			activeFile.content = value;
			updateContent(activeFile.filename, value);

			// Auto-save with debounce
			if (lessonId) {
				debouncedSave(lessonId, workingFiles);
			}

			// Write changed file to WebContainer for HMR
			try {
				const { writeFile } = await import('$lib/utils/webcontainer');
				const path = activeFile.filename.startsWith('src/')
					? activeFile.filename
					: `src/routes/${activeFile.filename}`;
				await writeFile(path, value);
			} catch {
				// WebContainer may not be ready yet
			}
		}
	}

	function resetToStarter() {
		if (lessonId) {
			clearSavedCode(lessonId);
		}
		workingFiles = files.map((f) => ({ ...f }));
		loadLesson(workingFiles);
		activeFileIndex = 0;
		bootContainer(workingFiles);
	}
</script>

<div class="ide-container">
	<div class="ide-toolbar">
		<FileTabs
			files={workingFiles}
			activeIndex={activeFileIndex}
			onselect={handleTabSelect}
		/>
		<div class="toolbar-actions">
			{#if getSaveIndicatorVisible()}
				<span class="save-indicator">Saved</span>
			{/if}
			{#if lessonId}
				<button class="reset-btn" onclick={resetToStarter} title="Reset to starter code">
					Reset
				</button>
			{/if}
		</div>
	</div>

	<div class="ide-panels">
		<Splitpanes theme="modern-theme">
			<Pane minSize={30} size={55}>
				<div class="editor-pane">
					{#if activeFile}
						<MonacoEditor
							content={activeFile.content}
							language={activeFile.language}
							onchange={handleContentChange}
						/>
					{/if}
				</div>
			</Pane>
			<Pane minSize={25} size={45}>
				<div class="preview-pane">
					<Preview
						url={getPreviewUrl()}
						isBooting={getIsContainerBooting()}
						error={containerError}
					/>
				</div>
			</Pane>
		</Splitpanes>
	</div>
</div>

<style>
	.ide-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		background-color: var(--bg-primary);
		overflow: hidden;
	}

	.ide-toolbar {
		display: flex;
		align-items: stretch;
		background-color: var(--bg-secondary);
		border-bottom: 1px solid var(--border);
	}

	.toolbar-actions {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: 0 var(--space-sm);
		margin-left: auto;
		flex-shrink: 0;
	}

	.save-indicator {
		font-size: 11px;
		color: var(--success);
		font-weight: 600;
		animation: fadeInOut 1.5s ease-in-out;
	}

	@keyframes fadeInOut {
		0% { opacity: 0; }
		20% { opacity: 1; }
		80% { opacity: 1; }
		100% { opacity: 0; }
	}

	.reset-btn {
		padding: 2px 8px;
		font-size: 11px;
		font-weight: 600;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--text-secondary);
		border: 1px solid var(--border);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.reset-btn:hover {
		background: var(--bg-tertiary);
		color: var(--text-primary);
		border-color: var(--text-secondary);
	}

	.ide-panels {
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	.editor-pane {
		width: 100%;
		height: 100%;
		overflow: hidden;
		background-color: var(--bg-primary);
	}

	.preview-pane {
		width: 100%;
		height: 100%;
		overflow: hidden;
		background-color: var(--bg-primary);
		border-left: 1px solid var(--border);
	}

	/* Splitpanes theme overrides */
	:global(.modern-theme .splitpanes__splitter) {
		background-color: var(--bg-secondary);
		width: 4px;
		border: none;
		transition: background-color var(--transition-fast);
	}

	:global(.modern-theme .splitpanes__splitter:hover) {
		background-color: var(--accent);
	}
</style>
