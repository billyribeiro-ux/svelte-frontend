export const load = async ({ parent }: { parent: () => Promise<any> }) => {
	const { user } = await parent();
	return { user };
};
