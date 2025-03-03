import Babact from "babact";
import useToast from "./useToast";

export default function useFetch() {

	const {createToast} = useToast();
	const [isLoading, setIsLoading] = Babact.useState(false);

	const ft_fetch = async (
		url: string,
		fetch_options?: RequestInit,
		option: {
			show_error?: boolean
			success_message?: string,
			error_messages?: { [key: number]: string }
		} = {}
	) => {
		setIsLoading(true);
		const token = localStorage.getItem('access_token');
		try {
			const response = await fetch(url, {
				...fetch_options,
				headers: {
					...fetch_options.headers,
					'Authorization': `Bearer ${token}`
				}
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

	return { ft_fetch, isLoading };
}