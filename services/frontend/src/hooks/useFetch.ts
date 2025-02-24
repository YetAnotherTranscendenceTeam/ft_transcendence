import Babact from "babact";
import useToast from "./useToast";

export default function useFetch() {

	const {createToast} = useToast();
	const [isLoading, setIsLoading] = Babact.useState(false);

	const ft_fetch = async (
		url: string,
		fetch_options: Object,
		option: {
			show_error?: boolean
			success_message?: string,
			error_messages?: { [key: number]: string }
		} = {}
	) => {
		setIsLoading(true);
		try {
			const response = await fetch(url, fetch_options);
			if (response.ok) {
				const data = await response.json();
				if (option.success_message)
					createToast(option.success_message, 'success', 7000);
				setIsLoading(false);
				return data;
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