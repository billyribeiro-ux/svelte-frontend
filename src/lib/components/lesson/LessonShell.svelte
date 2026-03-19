<script lang="ts">
	import type { LessonData } from '$lib/types';
	import { Splitpanes, Pane } from 'svelte-splitpanes';
	import LessonContent from './LessonContent.svelte';
	import IDE from '$components/ide/IDE.svelte';
	import { markComplete, isComplete } from '$lib/stores/progress.svelte';

	let { lesson }: { lesson: LessonData } = $props();

	const completed = $derived(isComplete(lesson.meta.id));

	function handleMarkComplete() {
		markComplete(lesson.meta.id);
	}
</script>

<div class="lesson-shell">
	<Splitpanes theme="modern-theme">
		<Pane minSize={25} size={40}>
			<LessonContent
				title={lesson.meta.title}
				objectives={lesson.objectives}
				description={lesson.description}
				lessonId={lesson.meta.id}
				onmarkComplete={handleMarkComplete}
				isCompleted={completed}
			/>
		</Pane>
		<Pane minSize={30} size={60}>
			<IDE files={lesson.files} />
		</Pane>
	</Splitpanes>
</div>

<style>
	.lesson-shell {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	:global(.lesson-shell .modern-theme .splitpanes__splitter) {
		background-color: var(--bg-secondary);
		width: 4px;
		border: none;
		transition: background-color var(--transition-fast);
	}

	:global(.lesson-shell .modern-theme .splitpanes__splitter:hover) {
		background-color: var(--accent);
	}
</style>
