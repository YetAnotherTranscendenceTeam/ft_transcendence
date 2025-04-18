import Babact from "babact";

export type SSEHook = {
	connected: boolean,
	connect: (url: string) => void,
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

	const connect = async (url: string) => {
		if (sse.current) {
			close();
		}
		sse.current = new EventSource(url);
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