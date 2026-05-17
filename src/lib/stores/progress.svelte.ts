import { getStorageItem, setStorageItem } from '$utils/local-storage';

const STORAGE_KEY = 'sf-progress-v1';
const ACTIVITY_KEY = 'sf-activity-v1';

interface ActivityEntry {
	lessonId: string;
	lessonTitle: string;
	trackTitle: string;
	href: string;
	timestamp: number;
	status: 'completed' | 'in-progress';
}

interface ProgressData {
	completedLessons: string[];
	inProgressLessons: string[];
	lastActive: Record<string, number>; // lessonId → timestamp
}

function getDefaultData(): ProgressData {
	return { completedLessons: [], inProgressLessons: [], lastActive: {} };
}

class ProgressStore {
	private _data = $state<ProgressData>(getStorageItem(STORAGE_KEY, getDefaultData()));
	private _activity = $state<ActivityEntry[]>(getStorageItem(ACTIVITY_KEY, []));

	// ── Derived stats ──────────────────────────────────────────────

	completedSet = $derived(new Set(this._data.completedLessons));
	inProgressSet = $derived(new Set(this._data.inProgressLessons));

	completedCount = $derived(this._data.completedLessons.length);

	recentActivity = $derived(
		[...this._activity]
			.sort((a, b) => b.timestamp - a.timestamp)
			.slice(0, 10)
	);

	/** Current learning streak in days */
	streak = $derived.by(() => {
		if (this._activity.length === 0) return 0;
		const days = new Set(
			this._activity.map((a) =>
				new Date(a.timestamp).toISOString().split('T')[0]
			)
		);
		let streak = 0;
		const today = new Date();
		for (let i = 0; i < 365; i++) {
			const d = new Date(today);
			d.setDate(today.getDate() - i);
			const key = d.toISOString().split('T')[0]!;
			if (days.has(key)) {
				streak++;
			} else if (i > 0) {
				break;
			}
		}
		return streak;
	});

	/** Estimated hours (2 min per lesson on average) */
	hoursLearned = $derived(
		Math.round((this._data.completedLessons.length * 12) / 60 * 10) / 10
	);

	// ── Per-track helpers ──────────────────────────────────────────

	getTrackCompleted(trackSlug: string): number {
		return this._data.completedLessons.filter((id) =>
			id.startsWith(trackSlug + '.')
		).length;
	}

	getLessonStatus(lessonId: string): 'completed' | 'in-progress' | 'not-started' {
		if (this.completedSet.has(lessonId)) return 'completed';
		if (this.inProgressSet.has(lessonId)) return 'in-progress';
		return 'not-started';
	}

	// ── Mutations ─────────────────────────────────────────────────

	markInProgress(lessonId: string, lessonTitle: string, trackTitle: string, href: string) {
		if (this.completedSet.has(lessonId)) return;
		if (!this.inProgressSet.has(lessonId)) {
			this._data = {
				...this._data,
				inProgressLessons: [...this._data.inProgressLessons, lessonId],
				lastActive: { ...this._data.lastActive, [lessonId]: Date.now() }
			};
			this._persist();
		}
		this._addActivity(lessonId, lessonTitle, trackTitle, href, 'in-progress');
	}

	markCompleted(lessonId: string, lessonTitle: string, trackTitle: string, href: string) {
		const alreadyDone = this.completedSet.has(lessonId);
		this._data = {
			completedLessons: alreadyDone
				? this._data.completedLessons
				: [...this._data.completedLessons, lessonId],
			inProgressLessons: this._data.inProgressLessons.filter((id) => id !== lessonId),
			lastActive: { ...this._data.lastActive, [lessonId]: Date.now() }
		};
		this._persist();
		this._addActivity(lessonId, lessonTitle, trackTitle, href, 'completed');
	}

	reset() {
		this._data = getDefaultData();
		this._activity = [];
		this._persist();
	}

	// ── Private helpers ──────────────────────────────────────────

	private _persist() {
		setStorageItem(STORAGE_KEY, this._data);
		setStorageItem(ACTIVITY_KEY, this._activity);
	}

	private _addActivity(
		lessonId: string,
		lessonTitle: string,
		trackTitle: string,
		href: string,
		status: 'completed' | 'in-progress'
	) {
		// Remove existing entry for same lesson then add fresh at front
		this._activity = [
			{ lessonId, lessonTitle, trackTitle, href, timestamp: Date.now(), status },
			...this._activity.filter((a) => a.lessonId !== lessonId)
		].slice(0, 50);
		setStorageItem(ACTIVITY_KEY, this._activity);
	}
}

export const progressStore = new ProgressStore();
