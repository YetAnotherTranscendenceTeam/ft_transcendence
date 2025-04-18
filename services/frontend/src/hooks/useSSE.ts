import Babact from "babact";
import useFetch from "./useFetch";

export type SSEHook = {
	connected: boolean,
	connect: (url: string, enableToken?: boolean) => void,
	close: () => void,
}

export default function useSSE({
	onMessage,
	onError,
	onOpen,
	onEvent = null
} : {
	// for events with no 'event' field
	onMessage?: (event: string, message: string) => void,
	onError?: (error: any) => void,
	onOpen?: (event) => void,
	onEvent?: { [key: string]: (event: any) => void }
} = {}): SSEHook {
	const sse = Babact.useRef<EventSource>(null);
	const [connected, setConnected] = Babact.useState<boolean>(false);

	const { refreshToken } = useFetch();

	const connect = async (url: string, enableToken: boolean = false) => {
		if (sse.current) {
			close();
		}
		let SSEUrl = url
		if (enableToken) {
			await refreshToken();
			const parsedUrl = new URL(url);
			if (parsedUrl.search === '')
				SSEUrl += '?';
			else
				SSEUrl += '&';
			SSEUrl += `access_token=${localStorage.getItem('access_token')}`;
			console.log('SSEUrl', SSEUrl);
		}
		sse.current = new EventSource(SSEUrl);
		if (onEvent) {
			for (let event in onEvent) {
				sse.current.addEventListener(event, (e) => {
					const data = JSON.parse(e.data);
					onEvent[event](data);
				});
			}
		}
		sse.current.onopen = (event) => {
			if (onOpen) {
				onOpen(event);
			}
			setConnected(true);
		};
		sse.current.onerror = (error) => {
			if (onError) {
				onError(error);
			}
			setConnected(false);
		};
		sse.current.onmessage = (event) => {
			if (onMessage) {
				onMessage(event.type, event.data);
			}
		}
	}
	const close = () => {
		sse.current.close();
		sse.current = null;
	}

	return {
		connected,
		connect,
		close
	}
};