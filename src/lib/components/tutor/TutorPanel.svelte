<script lang="ts">
	import type { TutorSuggestion } from '$types/tutor';
	import { tutorState } from '$stores/tutor.svelte';
	import TutorMessage from './TutorMessage.svelte';
	import TutorInput from './TutorInput.svelte';
	import TutorSuggestions from './TutorSuggestions.svelte';

	interface Props {
		lessonTitle?: string;
		currentCode?: string;
		errors?: string[];
	}

	let { lessonTitle, currentCode, errors }: Props = $props();

	let messagesEl = $state<HTMLDivElement | undefined>(undefined);

	$effect(() => {
		// Track message count to trigger scroll
		tutorState.messageCount;
		scrollToBottom();
	});

	function scrollToBottom() {
		if (!messagesEl) return;
		requestAnimationFrame(() => {
			messagesEl!.scrollTop = messagesEl!.scrollHeight;
		});
	}

	async function sendMessage(content: string) {
		tutorState.addUserMessage(content);
		tutorState.isLoading = true;
		tutorState.setSuggestions([]);

		try {
			const res = await fetch('/api/tutor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: content,
					context: {
						lessonTitle,
						currentCode,
						errors,
						concepts: []
					}
				})
			});

			if (!res.ok) throw new Error('Tutor request failed');

			const data = await res.json();
			tutorState.addAssistantMessage(data.response);

			if (data.suggestions) {
				tutorState.setSuggestions(data.suggestions);
			}
		} catch {
			tutorState.addAssistantMessage(
				"I'm having trouble connecting right now. Please try again in a moment."
			);
		} finally {
			tutorState.isLoading = false;
		}
	}

	function handleSuggestionSelect(suggestion: TutorSuggestion) {
		sendMessage(suggestion.prompt);
	}
</script>

<aside class="tutor-panel" aria-label="AI Tutor">
	<header class="tutor-panel__header">
		<div class="tutor-panel__title">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
			</svg>
			<span>AI Tutor</span>
		</div>
		<button class="tutor-panel__close" onclick={() => tutorState.toggle()} aria-label="Close tutor">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
	</header>

	<div class="tutor-panel__messages" bind:this={messagesEl}>
		{#if tutorState.messages.length === 0}
			<div class="tutor-panel__empty">
				<p class="tutor-panel__empty-title">Need help?</p>
				<p class="tutor-panel__empty-text">Ask me about your code, concepts, or any errors you encounter.</p>
			</div>
		{/if}

		{#each tutorState.messages as message (message.id)}
			<TutorMessage {message} />
		{/each}

		{#if tutorState.isLoading}
			<div class="tutor-panel__loading">
				<span class="tutor-panel__dot"></span>
				<span class="tutor-panel__dot"></span>
				<span class="tutor-panel__dot"></span>
			</div>
		{/if}
	</div>

	<TutorSuggestions
		suggestions={tutorState.suggestions}
		onselect={handleSuggestionSelect}
	/>

	<TutorInput onsend={sendMessage} disabled={tutorState.isLoading} />
</aside>

<style>
	.tutor-panel {
		display: flex;
		flex-direction: column;
		block-size: 100%;
		background: var(--sf-bg-1);
		border-inline-start: 1px solid var(--sf-bg-3);
		overflow: hidden;
	}

	.tutor-panel__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-block: var(--sf-space-3);
		padding-inline: var(--sf-space-4);
		border-block-end: 1px solid var(--sf-bg-3);
		background: var(--sf-bg-2);
		flex-shrink: 0;
	}

	.tutor-panel__title {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 600;
		color: var(--sf-text-0);
	}

	.tutor-panel__close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		inline-size: 28px;
		block-size: 28px;
		border: none;
		border-radius: var(--sf-radius-sm);
		background: transparent;
		color: var(--sf-text-2);
		cursor: pointer;
		transition: all var(--sf-transition-fast);

		&:hover {
			background: var(--sf-bg-3);
			color: var(--sf-text-0);
		}
	}

	.tutor-panel__messages {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-3);
		padding: var(--sf-space-4);
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--sf-bg-4) transparent;
	}

	.tutor-panel__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
		text-align: center;
		gap: var(--sf-space-2);
		padding: var(--sf-space-6);
	}

	.tutor-panel__empty-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-base);
		font-weight: 600;
		color: var(--sf-text-1);
		margin: 0;
	}

	.tutor-panel__empty-text {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-3);
		margin: 0;
		max-inline-size: 240px;
		line-height: 1.5;
	}

	.tutor-panel__loading {
		display: flex;
		align-self: flex-start;
		gap: var(--sf-space-1);
		padding-block: var(--sf-space-3);
		padding-inline: var(--sf-space-4);
		background: var(--sf-bg-2);
		border-radius: var(--sf-radius-lg);
		border-end-start-radius: var(--sf-radius-sm);
	}

	.tutor-panel__dot {
		inline-size: 6px;
		block-size: 6px;
		border-radius: 50%;
		background: var(--sf-text-3);
		animation: tutor-bounce 1.4s infinite ease-in-out both;

		&:nth-child(1) {
			animation-delay: -0.32s;
		}

		&:nth-child(2) {
			animation-delay: -0.16s;
		}
	}

	@keyframes tutor-bounce {
		0%, 80%, 100% {
			transform: scale(0.6);
			opacity: 0.4;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
