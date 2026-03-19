<script lang="ts">
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

	let { files }: { files: LessonFile[] } = $props();

	let activeFileIndex = $state(0);
	let containerError = $state<string | null>(null);

	// Load lesson files and boot WebContainer when files change
	$effect(() => {
		if (files.length > 0) {
			loadLesson(files);
			activeFileIndex = 0;
			bootContainer(files);
		}
	});

	let activeFile = $derived(files[activeFileIndex]);

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
			updateContent(activeFile.filename, value);
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
</script>

<div class="ide-container">
	<FileTabs
		{files}
		activeIndex={activeFileIndex}
		onselect={handleTabSelect}
	/>

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
