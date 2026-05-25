<script lang="ts">
	let message = $state('');
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	export function announce(text: string, duration = 5000) {
		message = '';
		// Force re-announcement by briefly clearing
		setTimeout(() => {
			message = text;
		}, 50);
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			message = '';
		}, duration);
	}
</script>

<div class="sr-only" aria-live="polite" aria-atomic="true" role="status">
	{message}
</div>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
