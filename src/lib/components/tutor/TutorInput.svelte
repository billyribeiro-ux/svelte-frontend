<script lang="ts">
	interface Props {
		onsend: (message: string) => void;
		disabled?: boolean;
	}

	let { onsend, disabled = false }: Props = $props();

	let value = $state('');
	let textareaEl = $state<HTMLTextAreaElement | undefined>(undefined);

	function handleSend() {
		const trimmed = value.trim();
		if (!trimmed || disabled) return;
		onsend(trimmed);
		value = '';
		if (textareaEl) {
			textareaEl.style.blockSize = 'auto';
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			handleSend();
		}
	}

	function handleInput() {
		if (!textareaEl) return;
		textareaEl.style.blockSize = 'auto';
		textareaEl.style.blockSize = `${textareaEl.scrollHeight}px`;
	}
</script>

<div class="tutor-input">
	<textarea
		bind:this={textareaEl}
		bind:value
		{disabled}
		class="tutor-input__textarea"
		placeholder="Ask about your code..."
		rows="1"
		onkeydown={handleKeydown}
		oninput={handleInput}
	></textarea>
	<button
		class="tutor-input__send"
		disabled={disabled || !value.trim()}
		onclick={handleSend}
		aria-label="Send message"
	>
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<line x1="22" y1="2" x2="11" y2="13"></line>
			<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
		</svg>
	</button>
</div>

<style>
	.tutor-input {
		display: flex;
		align-items: flex-end;
		gap: var(--sf-space-2);
		padding: var(--sf-space-3);
		border-block-start: 1px solid var(--sf-bg-3);
		background: var(--sf-bg-1);
	}

	.tutor-input__textarea {
		flex: 1;
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-0);
		background: var(--sf-bg-2);
		border: 1px solid var(--sf-bg-4);
		border-radius: var(--sf-radius-md);
		padding-block: var(--sf-space-2);
		padding-inline: var(--sf-space-3);
		resize: none;
		outline: none;
		max-block-size: 120px;
		line-height: 1.5;
		transition: border-color var(--sf-transition-fast);

		&::placeholder {
			color: var(--sf-text-3);
		}

		&:focus {
			border-color: var(--sf-accent);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	.tutor-input__send {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		inline-size: 36px;
		block-size: 36px;
		border: none;
		border-radius: var(--sf-radius-md);
		background: var(--sf-accent);
		color: var(--sf-accent-text);
		cursor: pointer;
		flex-shrink: 0;
		transition: all var(--sf-transition-fast);

		&:hover:not(:disabled) {
			background: var(--sf-accent-hover);
		}

		&:disabled {
			opacity: 0.4;
			cursor: not-allowed;
		}
	}
</style>
