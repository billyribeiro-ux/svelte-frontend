export const load = async ({ params }: { params: { trackSlug: string; moduleSlug: string } }) => {
	return {
		trackSlug: params.trackSlug,
		moduleSlug: params.moduleSlug
	};
};
