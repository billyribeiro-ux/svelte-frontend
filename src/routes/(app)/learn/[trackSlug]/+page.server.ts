export const load = async ({ params }: { params: { trackSlug: string } }) => {
	return {
		trackSlug: params.trackSlug
	};
};
