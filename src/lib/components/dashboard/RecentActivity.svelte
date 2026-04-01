<script lang="ts">
	import Icon from '$components/ui/Icon.svelte';

	interface ActivityItem {
		id: string;
		lessonTitle: string;
		trackTitle: string;
		href: string;
		status: 'completed' | 'in-progress';
		timestamp: number;
	}

	interface Props {
		activities: ActivityItem[];
	}

	let { activities }: Props = $props();

	function formatTime(ts: number): string {
		const diff = Date.now() - ts;
		const minutes = Math.floor(diff / 60000);
		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}
</script>

<div class="recent-activity">
	<h3 class="section-title">Recent Activity</h3>
	{#if activities.length === 0}
		<p class="empty">Start a lesson to see your activity here.</p>
	{:else}
		<div class="activity-list">
			{#each activities as activity (activity.id)}
				<a href={activity.href} class="activity-item">
					<span class="activity-icon" class:completed={activity.status === 'completed'}>
						<Icon icon={activity.status === 'completed' ? 'ph:check-circle' : 'ph:play-circle'} size={16} />
					</span>
					<div class="activity-info">
						<span class="activity-lesson">{activity.lessonTitle}</span>
						<span class="activity-track">{activity.trackTitle}</span>
					</div>
					<span class="activity-time">{formatTime(activity.timestamp)}</span>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.section-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-md);
		font-weight: 600;
		color: var(--sf-text-0);
		margin: 0 0 var(--sf-space-3) 0;
	}

	.empty {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-3);
	}

	.activity-list {
		display: flex;
		flex-direction: column;
	}

	.activity-item {
		display: flex;
		align-items: center;
		gap: var(--sf-space-3);
		padding: var(--sf-space-3);
		text-decoration: none;
		border-radius: var(--sf-radius-md);
		transition: background var(--sf-transition-fast);

		&:hover {
			background: var(--sf-bg-2);
		}
	}

	.activity-icon {
		color: var(--sf-text-3);

		&.completed {
			color: var(--sf-success);
		}
	}

	.activity-info {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-inline-size: 0;
	}

	.activity-lesson {
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		color: var(--sf-text-0);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.activity-track {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
	}

	.activity-time {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		flex-shrink: 0;
	}
</style>
