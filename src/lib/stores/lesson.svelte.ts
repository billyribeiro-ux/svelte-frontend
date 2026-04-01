import type { Lesson, Checkpoint } from '$types/lesson';

class LessonState {
	current = $state<Lesson | null>(null);
	checkpointsCompleted = $state<Set<string>>(new Set());
	hintsRevealed = $state<Record<string, number>>({});
	timeStarted = $state<number | null>(null);

	isComplete = $derived(
		this.current !== null &&
			this.current.checkpoints.length > 0 &&
			this.current.checkpoints.every((cp) => this.checkpointsCompleted.has(cp.id))
	);

	progress = $derived(
		this.current && this.current.checkpoints.length > 0
			? this.checkpointsCompleted.size / this.current.checkpoints.length
			: 0
	);

	currentCheckpoint = $derived.by(() => {
		if (!this.current) return null;
		return (
			this.current.checkpoints.find((cp) => !this.checkpointsCompleted.has(cp.id)) ?? null
		);
	});

	setLesson(lesson: Lesson) {
		this.current = lesson;
		this.checkpointsCompleted = new Set();
		this.hintsRevealed = {};
		this.timeStarted = Date.now();
	}

	completeCheckpoint(checkpointId: string) {
		this.checkpointsCompleted = new Set([...this.checkpointsCompleted, checkpointId]);
	}

	revealNextHint(checkpointId: string): string | null {
		const checkpoint = this.current?.checkpoints.find((cp) => cp.id === checkpointId);
		if (!checkpoint) return null;

		const currentLevel = this.hintsRevealed[checkpointId] ?? 0;
		if (currentLevel >= checkpoint.hints.length) return null;

		this.hintsRevealed = { ...this.hintsRevealed, [checkpointId]: currentLevel + 1 };
		return checkpoint.hints[currentLevel] ?? null;
	}

	getRevealedHints(checkpointId: string): string[] {
		const checkpoint = this.current?.checkpoints.find((cp) => cp.id === checkpointId);
		if (!checkpoint) return [];
		const count = this.hintsRevealed[checkpointId] ?? 0;
		return checkpoint.hints.slice(0, count);
	}

	getTimeSpent(): number {
		if (!this.timeStarted) return 0;
		return Math.floor((Date.now() - this.timeStarted) / 1000);
	}
}

export const lessonState = new LessonState();
