import { Mutex } from "async-mutex";
import config from "../config";

export async function APIFetch(url: string, fetch_options?: RequestInit) {
	await APIRefreshToken();
	try {
		const response = await fetch(url, {
			...fetch_options,
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('access_token') ?? ''}`,
				...fetch_options?.headers
			}
		})
		return response;
	}
	catch (e: unknown) {
		const message = e instanceof Error ? e.message : 'Unknown error';
		return new Response(JSON.stringify({
			message,
			statusCode: 500,
			code: 500
		}), {
			status: 500,
			statusText: 'Internal Server Error',
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}

const refreshMutex = new Mutex();

export async function APIRefreshToken() {
	const release = await refreshMutex.acquire();

	const expired_at = localStorage.getItem('expire_at');
	if (!expired_at || new Date(expired_at) > new Date(new Date().getTime() + 1000 * 60 * 2)) {
		release();
		return;
	}

	try {

		const response = await fetch(`${config.API_URL}/token/refresh`, {
			method: 'POST',
			credentials: 'include'
		});
		if (!response.ok)
			throw new Error('Failed to refresh token');
		const data = await response.json();
		localStorage.setItem('access_token', data.access_token);
		localStorage.setItem('expire_at', data.expire_at);
	}
	catch (e: unknown) {
		console.error('Error refreshing token', e);
		localStorage.removeItem('access_token');
		localStorage.removeItem('expire_at');
	}
	release();
}