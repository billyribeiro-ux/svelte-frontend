<script lang="ts">
	import { workspace } from '$stores/workspace.svelte';
	import { tutorState } from '$stores/tutor.svelte';
	import type { Keybinding } from '$utils/keybindings';
	import { matchesKeybinding } from '$utils/keybindings';

	interface Props {
		onrun?: () => void;
	}

	let { onrun }: Props = $props();

	const keybindings: Keybinding[] = [
		{
			key: '1',
			mod: true,
			handler: () => workspace.togglePanel('lesson'),
			description: 'Toggle lesson panel'
		},
		{
			key: '2',
			mod: true,
			handler: () => (workspace.activePanel = 'editor'),
			description: 'Focus editor'
		},
		{
			key: '3',
			mod: true,
			handler: () => workspace.togglePanel('preview'),
			description: 'Toggle preview panel'
		},
		{
			key: 'j',
			mod: true,
			handler: () => workspace.togglePanel('bottom'),
			description: 'Toggle bottom panel'
		},
		{
			key: 'k',
			mod: true,
			handler: () => (workspace.commandPaletteOpen = !workspace.commandPaletteOpen),
			description: 'Toggle command palette'
		},
		{
			key: 't',
			mod: true,
			handler: () => tutorState.toggle(),
			description: 'Toggle AI tutor'
		},
		{
			key: 'Enter',
			mod: true,
			handler: () => onrun?.(),
			description: 'Run code'
		}
	];

	function handleKeydown(event: KeyboardEvent) {
		for (const binding of keybindings) {
			if (matchesKeybinding(event, binding)) {
				event.preventDefault();
				binding.handler();
				return;
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />
