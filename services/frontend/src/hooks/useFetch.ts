import Babact from "babact";
import useToast, { ToastType } from "./useToast";
import { APIFetch } from "./useAPI";

export type FetchOptions = {
	show_error?: boolean
	success_message?: string,
	error_messages?: { [key: number | string]: string },
	onError?: (res: Response) => void,
	setTotal?: (total: number) => void,
}

export class HTTPError {
	message: string;
	statusCode: number;
	code: number;

	constructor({
		message,
		statusCode,
		code
	}: {
		message: string,
		statusCode: number,
		code: number
	}) {
		this.message = message;
		this.statusCode = statusCode;
		this.code = code;
	}
}

export default function useFetch() {

	const {createToast} = useToast();
	const [isLoading, setIsLoading] = Babact.useState<boolean>(false);

	const ft_fetch = async (
		url: string,
		fetch_options?: RequestInit,
		option: FetchOptions = {}
	) => {
		setIsLoading(true);
		const response = await APIFetch(url, fetch_options);
		const data = await handleAPIResponse(response, option);
		setIsLoading(false);
		const total = response.headers?.get('X-Total-Count');
		if (total && option.setTotal) {
			option.setTotal(parseInt(total));
		}
		return data;
	}

	const handleAPIResponse = async (response: Response, option: FetchOptions) => {
		if (response.ok) {
			if (option.success_message)
				createToast(option.success_message, ToastType.SUCCESS, 7000);
			if (response.status === 204) {
				return {};
			}
			return await response.json();
		}
		else {
			if (option.onError) option.onError(response);
			const error = await response.json();
			const { message, statusCode, code } = error;
			const error_message = option.error_messages?.[code] || option.error_messages?.[statusCode] || message;
			if (option.show_error)
				createToast(error_message, ToastType.DANGER, 7000);
			return null;
		}
	}

	return { ft_fetch, isLoading, handleAPIResponse };
}