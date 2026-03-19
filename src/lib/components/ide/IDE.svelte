<script lang="ts">
	import type { LessonFile } from '$lib/types';
	import { Splitpanes, Pane } from 'svelte-splitpanes';
	import FileTabs from './FileTabs.svelte';
	import MonacoEditor from './MonacoEditor.svelte';
	import Preview from './Preview.svelte';
	import {
		getOpenFiles,
		getActiveFileIndex,
		getPreviewUrl,
		getIsContainerBooting,
		setActiveFile,
		updateContent,
		loadLesson
	} from '$lib/stores/ide.svelte';

	let { files }: { files: LessonFile[] } = $props();

	let activeFileIndex = $state(0);

	// Load lesson files into the store when files prop changes
	$effect(() => {
		if (files.length > 0) {
			loadLesson(files);
		}
	});

	let activeFile = $derived(files[activeFileIndex]);

	function handleTabSelect(index: number) {
		activeFileIndex = index;
		setActiveFile(index);
	}

	function handleContentChange(value: string) {
		if (activeFile) {
			updateContent(activeFile.filename, value);
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
