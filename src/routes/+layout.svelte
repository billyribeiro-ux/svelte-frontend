<script lang="ts">
	import '../app.css';
	import Toast from '$components/ui/Toast.svelte';

	let { children } = $props();
</script>

{@render children()}
<Toast />
