<script lang="ts">
	interface Props {
		code: string;
		language?: string;
	}

	let { code, language = 'svelte' }: Props = $props();
</script>

<div class="code-block">
	<div class="code-header">
		<span class="code-language">{language}</span>
	</div>
	<pre><code>{code.trim()}</code></pre>
</div>

<style>
	.code-block {
		margin-block: var(--sf-space-3);
		border-radius: var(--sf-radius-md);
		overflow: hidden;
		border: 1px solid var(--sf-bg-3);
	}

	.code-header {
		padding: var(--sf-space-2) var(--sf-space-3);
		background: var(--sf-bg-2);
		border-block-end: 1px solid var(--sf-bg-3);
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
</style>
