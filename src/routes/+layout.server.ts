export const load = async () => {
	return {
		user: {
			id: 'dev-user-1',
			email: 'developer@svelteforge.dev',
			displayName: 'Developer',
			avatarUrl: null,
			authProvider: 'email' as const,
			createdAt: new Date().toISOString(),
			preferences: {
				theme: 'dark' as const,
				editorKeymap: 'default' as const,
				editorFontSize: 14,
				editorTabSize: 2,
				panelLayout: 'default' as const
			}
		}
	};
};
