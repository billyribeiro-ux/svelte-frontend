<script lang="ts">
	import Icon from '$components/ui/Icon.svelte';

	interface Props {
		code: string;
		language?: string;
	}

	let { code, language = 'svelte' }: Props = $props();

	let highlighted = $derived(highlightCode(code.trim(), language));
	let copied = $state(false);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(code.trim());
			copied = true;
			setTimeout(() => copied = false, 1500);
		} catch {
			// Clipboard API may fail in some contexts
		}
	}
</script>

<div class="code-block">
	<div class="code-header">
		<span class="code-language">{language}</span>
		<button class="copy-btn" onclick={handleCopy} aria-label="Copy code">
			{#if copied}
				<Icon icon="ph:check" size={14} />
			{:else}
				<Icon icon="ph:copy" size={14} />
			{/if}
		</button>
	</div>
	<pre><code>{@html highlighted}</code></pre>
</div>

<script lang="ts" module>
	function escapeHtml(text: string): string {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}

	function highlightCode(code: string, language: string): string {
		let escaped = escapeHtml(code);

		// Keywords
		const jsKeywords = /\b(const|let|var|function|return|if|else|for|while|import|from|export|default|class|new|this|typeof|instanceof|async|await|try|catch|throw|switch|case|break|continue)\b/g;
		escaped = escaped.replace(jsKeywords, '<span class="hl-keyword">$1</span>');

		// Svelte runes
		escaped = escaped.replace(/(\$state|\$derived|\$effect|\$props|\$bindable|\$inspect)(?:\.(?:raw|by|pre|root|snapshot))?/g, '<span class="hl-rune">$&</span>');

		// Strings
		escaped = escaped.replace(/(&#39;[^&#]*?&#39;|&quot;[^&]*?&quot;|`[^`]*?`)/g, '<span class="hl-string">$1</span>');

		// Comments
		escaped = escaped.replace(/(\/\/.*$)/gm, '<span class="hl-comment">$1</span>');

		// Numbers
		escaped = escaped.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="hl-number">$1</span>');

		// Svelte template syntax
		if (language === 'svelte' || language === 'html') {
			escaped = escaped.replace(/(\{#\w+|\{:\w+|\{\/\w+|\{@\w+)/g, '<span class="hl-keyword">$1</span>');
			escaped = escaped.replace(/(&lt;\/?[\w-]+)/g, '<span class="hl-tag">$1</span>');
		}

		return escaped;
	}
</script>

<style>
	.code-block {
		position: relative;
		margin-block: var(--sf-space-3);
		border-radius: var(--sf-radius-md);
		overflow: hidden;
		border: 1px solid var(--sf-bg-3);
	}

	.code-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--sf-space-2) var(--sf-space-3);
		background: var(--sf-bg-2);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.copy-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--sf-space-1);
		background: none;
		border: none;
		border-radius: var(--sf-radius-sm);
		color: var(--sf-text-3);
		cursor: pointer;
		opacity: 0;
		transition: opacity var(--sf-transition-fast), color var(--sf-transition-fast), background var(--sf-transition-fast);

		.code-block:hover & {
			opacity: 1;
		}

		&:hover {
			color: var(--sf-text-0);
			background: var(--sf-bg-3);
		}
	}

	.code-language {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
		text-transform: uppercase;
		font-weight: 500;
	}

	pre {
		margin: 0;
		padding: var(--sf-space-4);
		background: var(--sf-editor-bg);
		overflow-x: auto;
	}

	code {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-0);
		line-height: 1.6;
	}

	:global(.hl-keyword) { color: var(--sf-syntax-keyword); }
	:global(.hl-rune) { color: var(--sf-syntax-rune); font-weight: 600; }
	:global(.hl-string) { color: var(--sf-syntax-string); }
	:global(.hl-comment) { color: var(--sf-syntax-comment); font-style: italic; }
	:global(.hl-number) { color: var(--sf-syntax-number); }
	:global(.hl-tag) { color: var(--sf-syntax-tag); }
</style>
