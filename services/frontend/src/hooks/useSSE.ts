import Babact from "babact";

export type SSEHook = {
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
		sse.current.onopen = onOpen;
		sse.current.onerror = onError;
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
		connect,
		close
	}
};