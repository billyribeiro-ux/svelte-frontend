<script lang="ts">
	import type { TutorMessage } from '$types/tutor';
	import { fly } from 'svelte/transition';

	interface Props {
		message: TutorMessage;
	}

	let { message }: Props = $props();

	const isUser = $derived(message.role === 'user');

	const relativeTime = $derived.by(() => {
		const diff = Date.now() - message.timestamp;
		const seconds = Math.floor(diff / 1000);
		if (seconds < 60) return 'just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		return `${Math.floor(hours / 24)}d ago`;
	});

	function renderContent(text: string): string {
		let html = text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');

		// Headings: ### text
		html = html.replace(/^### (.+)$/gm, '<strong class="tutor-heading">$1</strong>');

		// Bold: **text**
		html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

		// Inline code: `text`
		html = html.replace(/`([^`]+)`/g, '<code class="tutor-inline-code">$1</code>');

		// Line breaks
		html = html.replace(/\n/g, '<br>');

		return html;
	}

	const rendered = $derived(renderContent(message.content));
</script>

<div class="tutor-message" class:tutor-message--user={isUser} class:tutor-message--assistant={!isUser} in:fly={{ y: 8, duration: 200 }}>
	<div class="tutor-message__bubble">
		{@html rendered}
	</div>
	<span class="tutor-message__time">{relativeTime}</span>
</div>

<style>
	.tutor-message {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-1);
		max-inline-size: 85%;
		&.tutor-message--user {
			align-self: flex-end;
			align-items: flex-end;
		}

		&.tutor-message--assistant {
			align-self: flex-start;
			align-items: flex-start;
		}
	}

	.tutor-message__bubble {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		line-height: 1.6;
		padding-block: var(--sf-space-2);
		padding-inline: var(--sf-space-3);
		border-radius: var(--sf-radius-lg);
		word-break: break-word;

		.tutor-message--user & {
			background: var(--sf-accent);
			color: var(--sf-accent-text);
			border-end-end-radius: var(--sf-radius-sm);
		}

		.tutor-message--assistant & {
			background: var(--sf-bg-2);
			color: var(--sf-text-0);
			border-end-start-radius: var(--sf-radius-sm);
		}

		:global(.tutor-inline-code) {
			font-family: var(--sf-font-mono);
			font-size: 0.9em;
			background: oklch(0 0 0 / 0.15);
			padding: 0.1em 0.35em;
			border-radius: var(--sf-radius-sm);
		}

		:global(.tutor-heading) {
			display: block;
			font-size: var(--sf-font-size-base);
			margin-block-end: var(--sf-space-1);
		}
	}

	.tutor-message__time {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		padding-inline: var(--sf-space-1);
	}
</style>
