<script lang="ts">
	import type { Lesson } from '$types/lesson';
	import type { LessonProgress } from '$types/user';
	import { workspace } from '$stores/workspace.svelte';
	import { editor } from '$stores/editor.svelte';
	import { lessonState } from '$stores/lesson.svelte';
	import PanelResizer from './PanelResizer.svelte';
	import StatusBar from './StatusBar.svelte';
	import KeyboardShortcuts from './KeyboardShortcuts.svelte';
	import LessonPanel from '$components/lesson/LessonPanel.svelte';
	import Editor from '$components/editor/Editor.svelte';
	import EditorTabs from '$components/editor/EditorTabs.svelte';
	import EditorToolbar from '$components/editor/EditorToolbar.svelte';
	import Preview from '$components/preview/Preview.svelte';
	import Console from '$components/preview/Console.svelte';

	interface Props {
		lesson: Lesson;
		progress?: LessonProgress | null;
	}

	let { lesson, progress = null }: Props = $props();

	let consoleEntries = $state<import('$types/editor').ConsoleEntry[]>([]);

	$effect(() => {
		lessonState.setLesson(lesson);
		editor.setFiles(lesson.starterFiles);
	});

	function handleCodeChange(content: string) {
		editor.updateActiveFileContent(content);
	}

	function handleRun() {
		// Compilation will be wired in integration step
		consoleEntries = [];
	}

	function handleReset() {
		editor.resetToStarter(lesson.starterFiles);
		consoleEntries = [];
	}
</script>

<KeyboardShortcuts onrun={handleRun} />

<div class="workspace">
	<!-- Lesson Panel -->
	{#if !workspace.layout.lesson.collapsed}
		<aside class="panel lesson-panel" style="inline-size: {workspace.layout.lesson.width ?? 320}px">
			<LessonPanel {lesson} />
		</aside>
		<PanelResizer
			direction="horizontal"
			onresize={(delta) => workspace.setPanelWidth('lesson', (workspace.layout.lesson.width ?? 320) + delta)}
		/>
	{/if}

	<!-- Editor + Preview -->
	<div class="center-area">
		<div class="editor-preview-row">
			<!-- Editor -->
			<div class="panel editor-panel">
				<EditorTabs
					files={editor.files}
					activeIndex={editor.activeFileIndex}
					onselect={(i) => editor.setActiveFile(i)}
				/>
				<EditorToolbar onrun={handleRun} onformat={() => {}} onreset={handleReset} isCompiling={editor.isCompiling} />
				{#if editor.activeFile}
					<div class="editor-content">
						<Editor
							value={editor.activeFile.content}
							language={editor.activeFile.language === 'json' ? 'typescript' : editor.activeFile.language}
							readonly={editor.activeFile.readOnly ?? false}
							onchange={handleCodeChange}
						/>
					</div>
				{/if}
			</div>

			<!-- Preview -->
			{#if !workspace.layout.preview.collapsed}
				<PanelResizer
					direction="horizontal"
					onresize={(delta) =>
						workspace.setPanelWidth('preview', (workspace.layout.preview.width ?? 400) - delta)}
				/>
				<aside
					class="panel preview-panel"
					style="inline-size: {workspace.layout.preview.width ?? 400}px"
				>
					<Preview compilationResult={editor.compilationResult} />
				</aside>
			{/if}
		</div>

		<!-- Bottom Panel -->
		{#if !workspace.layout.bottom.collapsed}
			<PanelResizer
				direction="vertical"
				onresize={(delta) =>
					workspace.setBottomHeight((workspace.layout.bottom.height ?? 200) - delta)}
			/>
			<div
				class="panel bottom-panel"
				style="block-size: {workspace.layout.bottom.height ?? 200}px"
			>
				<div class="bottom-tabs">
					<button
						class="bottom-tab"
						class:active={workspace.layout.bottom.activeTab === 'console'}
						onclick={() => workspace.setBottomTab('console')}
					>
						Console
					</button>
					<button
						class="bottom-tab"
						class:active={workspace.layout.bottom.activeTab === 'xray'}
						onclick={() => workspace.setBottomTab('xray')}
					>
						X-Ray
					</button>
					<button
						class="bottom-tab"
						class:active={workspace.layout.bottom.activeTab === 'tutor'}
						onclick={() => workspace.setBottomTab('tutor')}
					>
						AI Tutor
					</button>
				</div>
				<div class="bottom-content">
					{#if workspace.layout.bottom.activeTab === 'console'}
						<Console entries={consoleEntries} />
					{:else if workspace.layout.bottom.activeTab === 'xray'}
						<div class="placeholder">X-Ray mode coming in Phase 2</div>
					{:else if workspace.layout.bottom.activeTab === 'tutor'}
						<div class="placeholder">AI Tutor coming in Phase 2</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<StatusBar />

<style>
	.workspace {
		display: flex;
		flex: 1;
		min-block-size: 0;
		overflow: hidden;
	}

	.center-area {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-inline-size: 0;
	}

	.editor-preview-row {
		display: flex;
		flex: 1;
		min-block-size: 0;
	}

	.panel {
		display: flex;
		flex-direction: column;
		background: var(--sf-bg-1);
		overflow: hidden;
	}

	.lesson-panel {
		flex-shrink: 0;
		border-inline-end: 1px solid var(--sf-bg-3);
	}

	.editor-panel {
		flex: 1;
		min-inline-size: 200px;
	}

	.editor-content {
		flex: 1;
		min-block-size: 0;
		overflow: hidden;
	}

	.preview-panel {
		flex-shrink: 0;
		border-inline-start: 1px solid var(--sf-bg-3);
	}

	.bottom-panel {
		flex-shrink: 0;
		border-block-start: 1px solid var(--sf-bg-3);
	}

	.bottom-tabs {
		display: flex;
		border-block-end: 1px solid var(--sf-bg-3);
		background: var(--sf-bg-2);
	}

	.bottom-tab {
		padding: var(--sf-space-2) var(--sf-space-4);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		border-block-end: 2px solid transparent;
		transition: all var(--sf-transition-fast);

		&:hover {
			color: var(--sf-text-1);
			background: var(--sf-bg-3);
		}

		&.active {
			color: var(--sf-accent);
			border-block-end-color: var(--sf-accent);
		}
	}

	.bottom-content {
		flex: 1;
		overflow: auto;
	}

	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		block-size: 100%;
		color: var(--sf-text-3);
		font-size: var(--sf-font-size-sm);
	}
</style>
