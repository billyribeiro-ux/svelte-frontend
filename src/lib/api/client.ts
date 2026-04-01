import type { ApiResult } from '$types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function apiFetch<T>(
	path: string,
	options?: RequestInit
): Promise<ApiResult<T>> {
	const url = `${BASE_URL}${path}`;

	try {
		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				...options?.headers
			},
			...options
		});

		if (!response.ok) {
			const body = await response.json().catch(() => null);
			return {
				data: null,
				error: {
					message: body?.message ?? response.statusText,
					code: body?.code ?? 'HTTP_ERROR',
					status: response.status
				}
			};
		}

		const data: T = await response.json();
		return { data, error: null };
	} catch (err) {
		return {
			data: null,
			error: {
				message: err instanceof Error ? err.message : 'Network request failed',
				code: 'NETWORK_ERROR',
				status: 0
			}
		};
	}
}
