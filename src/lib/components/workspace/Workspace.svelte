<script lang="ts">
	import type { Lesson } from '$types/lesson';
	import type { ConsoleEntry, DOMMutation } from '$types/editor';
	import { workspace } from '$stores/workspace.svelte';
	import { editor } from '$stores/editor.svelte';
	import { lessonState } from '$stores/lesson.svelte';
	import { compileSvelte } from '$engine/compiler/svelte-compiler';
	import { validateCheckpoint } from '$engine/analysis/checkpoint-validator';
	import { debounce } from '$utils/debounce';
	import PanelResizer from './PanelResizer.svelte';
	import StatusBar from './StatusBar.svelte';
	import KeyboardShortcuts from './KeyboardShortcuts.svelte';
	import LessonPanel from '$components/lesson/LessonPanel.svelte';
	import Editor from '$components/editor/Editor.svelte';
	import EditorTabs from '$components/editor/EditorTabs.svelte';
	import EditorToolbar from '$components/editor/EditorToolbar.svelte';
	import Preview from '$components/preview/Preview.svelte';
	import Console from '$components/preview/Console.svelte';
	import XRayPanel from '$components/xray/XRayPanel.svelte';
	import TutorPanel from '$components/tutor/TutorPanel.svelte';

	interface Props {
		lesson: Lesson;
		progress?: { status: string; checkpointsCompleted: string[]; codeSnapshots: Record<string, string>; timeSpentSeconds: number } | null;
	}

	let { lesson, progress = null }: Props = $props();

	let consoleEntries = $state<ConsoleEntry[]>([]);
	let domMutations = $state<DOMMutation[]>([]);
	let previewContainer = $state<HTMLDivElement | null>(null);

	$effect(() => {
		lessonState.setLesson(lesson);
		editor.setFiles(lesson.starterFiles);
	});

	// Auto-compile on file changes (debounced)
	const compileDebounced = debounce(() => {
		compileCurrentFile();
	}, 300);

	function compileCurrentFile() {
		const file = editor.activeFile;
		if (!file) return;

		editor.isCompiling = true;
		const result = compileSvelte(file.content, file.name);
		editor.setCompilationResult(result);
	}

	function handleCodeChange(content: string) {
		editor.updateActiveFileContent(content);
		compileDebounced();
	}

	function handleRun() {
		consoleEntries = [];
		compileCurrentFile();
	}

	function handleFormat() {
		const file = editor.activeFile;
		if (!file) return;
		const lines = file.content.split('\n');
		const formatted = lines.map((line) => line.trimEnd()).join('\n').trim() + '\n';
		if (formatted !== file.content) {
			editor.updateActiveFileContent(formatted);
		}
	}

	function handleReset() {
		editor.resetToStarter(lesson.starterFiles);
		consoleEntries = [];
		domMutations = [];
	}

	function handleSolve() {
		if (lesson.solutionFiles.length > 0) {
			editor.setFiles(lesson.solutionFiles);
			// Mark all checkpoints as completed
			for (const cp of lesson.checkpoints) {
				lessonState.completeCheckpoint(cp.id);
			}
			// Auto-compile the solution
			compileCurrentFile();
		}
	}

	function handleValidateCheckpoint(checkpointId: string) {
		const checkpoint = lesson.checkpoints.find((cp) => cp.id === checkpointId);
		if (!checkpoint) return;

		const code = editor.activeFile?.content ?? '';
		const result = validateCheckpoint(checkpoint, code, editor.compilationResult);

		if (result.passed) {
			lessonState.completeCheckpoint(checkpointId);
		}

		return result;
	}

	function handleConsoleEntry(entry: ConsoleEntry) {
		consoleEntries = [...consoleEntries, entry];
	}

	function handleDOMMutation(mutation: DOMMutation) {
		domMutations = [...domMutations, mutation];
	}
</script>

<KeyboardShortcuts onrun={handleRun} />

<div class="workspace">
	<!-- Lesson Panel -->
	{#if !workspace.layout.lesson.collapsed}
		<aside class="panel lesson-panel" style="inline-size: {workspace.layout.lesson.width ?? 320}px">
			<LessonPanel {lesson} onvalidate={handleValidateCheckpoint} onsolve={handleSolve} trackSlug={lesson.trackId} moduleSlug={lesson.moduleId} />
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
				<EditorToolbar onrun={handleRun} onformat={handleFormat} onreset={handleReset} isCompiling={editor.isCompiling} />
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
					<Preview
						compilationResult={editor.compilationResult}
						onConsole={handleConsoleEntry}
						onDOMMutation={handleDOMMutation}
					/>
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
						{#if consoleEntries.length > 0}
							<span class="tab-badge">{consoleEntries.length}</span>
						{/if}
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
						<Console entries={consoleEntries} onclear={() => consoleEntries = []} />
					{:else if workspace.layout.bottom.activeTab === 'xray'}
						<XRayPanel
							compilationResult={editor.compilationResult}
							sourceCode={editor.activeFile?.content ?? ''}
							{domMutations}
						/>
					{:else if workspace.layout.bottom.activeTab === 'tutor'}
						<TutorPanel
							lessonTitle={lesson.title}
							currentCode={editor.activeFile?.content ?? ''}
							errors={editor.compilationResult?.errors.map(e => e.message) ?? []}
						/>
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
		display: flex;
		align-items: center;
		gap: var(--sf-space-1);
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

	.tab-badge {
		font-size: var(--sf-font-size-xs);
		background: var(--sf-accent);
		color: var(--sf-accent-text);
		padding: 0 6px;
		border-radius: var(--sf-radius-full);
		line-height: 1.5;
	}

	.bottom-content {
		flex: 1;
		overflow: auto;
	}

</style>
