<script lang="ts">
	import Progress from '$components/ui/Progress.svelte';
	import Icon from '$components/ui/Icon.svelte';

	interface Props {
		title: string;
		icon: string;
		totalLessons: number;
		completedLessons: number;
		href: string;
	}

	let { title, icon, totalLessons, completedLessons, href }: Props = $props();

	let percentage = $derived(totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0);
</script>

<a {href} class="progress-card">
	<div class="card-header">
		<Icon {icon} size={20} />
		<h3 class="card-title">{title}</h3>
	</div>
	<div class="card-body">
		<Progress value={percentage} showLabel />
		<div class="card-stats">
			<span>{completedLessons}/{totalLessons} lessons</span>
		</div>
	</div>
</a>

<style>
	.progress-card {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-3);
		padding: var(--sf-space-5);
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		text-decoration: none;
		transition: border-color var(--sf-transition-fast), box-shadow var(--sf-transition-fast);

		&:hover {
			border-color: var(--sf-accent);
			box-shadow: var(--sf-shadow-md);
		}
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
		color: var(--sf-accent);
	}

	.card-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-md);
		font-weight: 600;
		color: var(--sf-text-0);
		margin: 0;
	}

	.card-stats {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
	}
</style>
