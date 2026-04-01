<script lang="ts" module>
	import { toast } from 'svelte-sonner';

	export function showToast(
		message: string,
		options?: {
			type?: 'success' | 'error' | 'warning' | 'info';
			description?: string;
			duration?: number;
		}
	) {
		const { type, description, duration = 4000 } = options ?? {};

		switch (type) {
			case 'success':
				toast.success(message, { description, duration });
				break;
			case 'error':
				toast.error(message, { description, duration });
				break;
			case 'warning':
				toast.warning(message, { description, duration });
				break;
			case 'info':
				toast.info(message, { description, duration });
				break;
			default:
				toast(message, { description, duration });
		}
	}
</script>

<script lang="ts">
	import { Toaster } from 'svelte-sonner';
</script>

<Toaster
	position="bottom-right"
	toastOptions={{
		style: `
			font-family: var(--sf-font-sans);
			font-size: var(--sf-font-size-sm);
			background: var(--sf-bg-1);
			color: var(--sf-text-0);
			border: 1px solid var(--sf-bg-3);
			border-radius: var(--sf-radius-md);
			box-shadow: var(--sf-shadow-lg);
		`,
		classes: {
			success: 'sf-toast--success',
			error: 'sf-toast--error',
			warning: 'sf-toast--warning',
			info: 'sf-toast--info'
		}
	}}
/>

<style>
	:global([data-sonner-toaster]) {
		z-index: var(--sf-z-toast) !important;
	}

	:global(.sf-toast--success) {
		border-inline-start: 3px solid var(--sf-success) !important;
	}

	:global(.sf-toast--error) {
		border-inline-start: 3px solid var(--sf-error) !important;
	}

	:global(.sf-toast--warning) {
		border-inline-start: 3px solid var(--sf-warning) !important;
	}

	:global(.sf-toast--info) {
		border-inline-start: 3px solid var(--sf-info) !important;
	}
</style>
