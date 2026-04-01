<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$components/ui/Icon.svelte';
	import { userState } from '$stores/user.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		data: {
			user: {
				id: string;
				email: string;
				displayName: string;
				avatarUrl: string | null;
			};
		};
	}

	let { children, data }: Props = $props();

	let sidebarCollapsed = $state(false);

	const navItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: 'ph:house' },
		{ href: '/learn', label: 'Learn', icon: 'ph:book-open' },
		{ href: '/learn/graph', label: 'Concept Graph', icon: 'ph:graph' },
		{ href: '/settings', label: 'Settings', icon: 'ph:gear' }
	];

	const currentPath = $derived(page.url.pathname);

	function isActive(href: string): boolean {
		if (href === '/dashboard') return currentPath === '/dashboard';
		return currentPath.startsWith(href);
	}

	$effect(() => {
		if (data.user) {
			userState.setUser(data.user as any);
		}
	});
</script>

<div class="app-shell" class:sidebar-collapsed={sidebarCollapsed}>
	<aside class="sidebar">
		<div class="sidebar-header">
			<a href="/" class="sidebar-brand">
				{#if sidebarCollapsed}
					<span class="brand-mark">SF</span>
				{:else}
					<span class="brand-text">SvelteForge</span>
				{/if}
			</a>
			<button
				class="sidebar-toggle"
				onclick={() => sidebarCollapsed = !sidebarCollapsed}
				aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			>
				<Icon icon={sidebarCollapsed ? 'ph:caret-right' : 'ph:caret-left'} size={16} />
			</button>
		</div>

		<nav class="sidebar-nav" aria-label="Main navigation">
			{#each navItems as item}
				<a
					href={item.href}
					class="nav-item"
					class:nav-item--active={isActive(item.href)}
					aria-current={isActive(item.href) ? 'page' : undefined}
				>
					<Icon icon={item.icon} size={20} />
					{#if !sidebarCollapsed}
						<span class="nav-label">{item.label}</span>
					{/if}
				</a>
			{/each}
		</nav>
	</aside>

	<div class="main-area">
		<header class="topbar">
			<div class="breadcrumb-area">
				<!-- Breadcrumbs can be populated by child pages -->
			</div>
			<div class="user-area">
				<span class="user-name">{data.user.displayName}</span>
				<div class="user-avatar" aria-hidden="true">
					{#if data.user.avatarUrl}
						<img src={data.user.avatarUrl} alt="" class="avatar-img" />
					{:else}
						<span class="avatar-fallback">
							{data.user.displayName.charAt(0).toUpperCase()}
						</span>
					{/if}
				</div>
			</div>
		</header>

		<main class="content">
			{@render children()}
		</main>
	</div>
</div>

<style>
	.app-shell {
		display: grid;
		grid-template-columns: 240px 1fr;
		min-block-size: 100dvh;
		transition: grid-template-columns var(--sf-transition-base);

		&.sidebar-collapsed {
			grid-template-columns: 60px 1fr;
		}
	}

	.sidebar {
		background: var(--sf-bg-1);
		border-inline-end: 1px solid var(--sf-bg-3);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--sf-space-4);
		min-block-size: 56px;
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.sidebar-brand {
		text-decoration: none;
		color: var(--sf-text-0);
		flex-shrink: 0;
	}

	.brand-text {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-md);
		font-weight: 700;
		white-space: nowrap;
	}

	.brand-mark {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-md);
		font-weight: 800;
		color: var(--sf-accent);
	}

	.sidebar-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: var(--sf-text-2);
		cursor: pointer;
		padding: var(--sf-space-1);
		border-radius: var(--sf-radius-sm);
		transition: color var(--sf-transition-fast);

		&:hover {
			color: var(--sf-text-0);
		}
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-1);
		padding: var(--sf-space-3);
		flex: 1;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--sf-space-3);
		padding-block: var(--sf-space-2);
		padding-inline: var(--sf-space-3);
		border-radius: var(--sf-radius-md);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		color: var(--sf-text-1);
		text-decoration: none;
		white-space: nowrap;
		transition: background var(--sf-transition-fast), color var(--sf-transition-fast);

		&:hover {
			background: var(--sf-bg-2);
			color: var(--sf-text-0);
		}

		&.nav-item--active {
			background: var(--sf-accent-subtle);
			color: var(--sf-accent);
		}
	}

	.nav-label {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.main-area {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-block: var(--sf-space-3);
		padding-inline: var(--sf-space-5);
		min-block-size: 56px;
		border-block-end: 1px solid var(--sf-bg-3);
		background: var(--sf-bg-0);
	}

	.breadcrumb-area {
		flex: 1;
	}

	.user-area {
		display: flex;
		align-items: center;
		gap: var(--sf-space-3);
	}

	.user-name {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		color: var(--sf-text-1);
	}

	.user-avatar {
		inline-size: 32px;
		block-size: 32px;
		border-radius: var(--sf-radius-full);
		overflow: hidden;
		background: var(--sf-accent-subtle);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar-img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.avatar-fallback {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 600;
		color: var(--sf-accent);
	}

	.content {
		flex: 1;
		overflow-y: auto;
		padding: var(--sf-space-5);
	}
</style>
