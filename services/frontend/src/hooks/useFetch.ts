import Babact from "babact";
import useToast from "./useToast";
import config from "../config";

export default function useFetch() {

	const {createToast} = useToast();
	const [isLoading, setIsLoading] = Babact.useState(false);

	const refreshToken = async () => {
		const expired_at = localStorage.getItem('expire_at');
		if (!expired_at)
			return;
		const expired_at_date = new Date(expired_at);
		if (expired_at_date > new Date())
			return;
		const response = await ft_fetch(`${config.API_URL}/token/refresh`, {
			method: 'POST',
			credentials: 'include'
		}, {
			disable_bearer: true
		});
		if (response) {
			localStorage.setItem('access_token', response.access_token);
			localStorage.setItem('expire_at', response.expire_at);
		}
	};

	const ft_fetch = async (
		url: string,
		fetch_options?: RequestInit,
		option: {
			show_error?: boolean
			success_message?: string,
			error_messages?: { [key: number]: string },
			disable_bearer?: boolean
		} = {}
	) => {
		setIsLoading(true);
		try {
			if (!option.disable_bearer)
				await refreshToken();
			const headers = fetch_options?.headers || {};
			const token = localStorage.getItem('access_token');
			if (!option.disable_bearer && token) {
				headers['Authorization'] = `Bearer ${token}`;
			}
			const response = await fetch(url, {
				...fetch_options,
				headers
			});
			if (response.ok) {
				let data = true;
				if (response.status !== 204) {
					data = await response.json();
				}
				if (option.success_message)
					createToast(option.success_message, 'success', 7000);
				setIsLoading(false);
				return data as any;
			}
			else {
				const { message, statusCode } = await response.json();
				throw new Error(option.error_messages?.[statusCode] || message);
			}
		}
		catch (error) {
			if (option.show_error)
				createToast(error.message, 'danger', 7000);
			setIsLoading(false);
		}
	}

	return { ft_fetch, isLoading, refreshToken };
}