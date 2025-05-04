import Babact from "babact";
import useToast, { ToastType } from "./useToast";
import config from "../config";

export default function useFetch() {

	const {createToast} = useToast();
	const [isLoading, setIsLoading] = Babact.useState<boolean>(false);

	const forceRefresh = async () => {
		const response = await ft_fetch(`${config.API_URL}/token/refresh`, {
			method: 'POST',
			credentials: 'include'
		}, {
			disable_bearer: true,
			show_error: true,
			success_message: 'Refreshed token'
		});
		if (response) {
			localStorage.setItem('access_token', response.access_token);
			localStorage.setItem('expire_at', response.expire_at);
		}
	}


	const refreshToken = async () => {
		const expired_at = localStorage.getItem('expire_at');
		if (!expired_at)
			return;
		const expired_at_date = new Date(expired_at).getTime();
		if (expired_at_date > Date.now() + 1000 * 60 * 5)
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
			error_messages?: { [key: number | string]: string },
			disable_bearer?: boolean,
			on_error?: (res: Response) => void
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
					createToast(option.success_message, ToastType.SUCCESS, 7000);
				setIsLoading(false);
				return data as any;
			}
			else {
				if (option.on_error)
					option.on_error(response);
				const { message, statusCode, code } = await response.json();
				throw new Error(option.error_messages?.[code] || option.error_messages?.[statusCode] || message);
			}
		}
		catch (error) {
			if (option.show_error)
				createToast(error.message, ToastType.DANGER, 7000);
			setIsLoading(false);
		}
	}

	return { ft_fetch, isLoading, refreshToken, forceRefresh };
}