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

export async function APIRefreshToken() {
	const expired_at = localStorage.getItem('expire_at');
	if (!expired_at)
		return;
	const expired_at_date = new Date(expired_at);
	if (expired_at_date > new Date(new Date().getTime() + 1000 * 60 * 2))
		return;
	const response = await fetch(`${config.API_URL}/token/refresh`, {
		method: 'POST',
		credentials: 'include'
	});
	if (response.ok) {
		const data = await response.json();
		localStorage.setItem('access_token', data.access_token);
		localStorage.setItem('expire_at', data.expire_at);
	}
	else {
		localStorage.removeItem('access_token');
		localStorage.removeItem('expire_at');
	}
}