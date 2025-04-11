import Babact from "babact";
import useFetch from "./useFetch";

export type WebSocketHook = {
	connected: boolean,
	connect: (url: string) => void,
	close: () => void,
	send: (message: string | object) => void,
}

export default function useWebSocket({
		onMessage,
		onError,
		onClose,
		onOpen,
		onEvent = null
	} : {
		onMessage?: (message: string) => void,
		onError?: (error: any) => void,
		onClose?: (event) => void,
		onOpen?: (event) => void,
		onEvent?: { [key: string]: (event) => void }
	} = {}): WebSocketHook {

	const ws = Babact.useRef(null);
	const [connected, setConnected] = Babact.useState<boolean>(false);
	const { refreshToken } = useFetch();

	const connect = async (url: string) => {
		if (ws.current) {
			close();
		}
		await refreshToken();
		ws.current = new WebSocket(url);
		ws.current.onopen = (event) => {
			if (onOpen) {
				onOpen(event);
			}
			setConnected(true);
		};
		ws.current.onmessage = (event) => {
			if (onMessage) {
				onMessage(event.data);
			}
			if (onEvent) {
				const msg = JSON.parse(event.data);
				if (onEvent[msg.event]) {
					onEvent[msg.event](msg.data);
				}
			}

		};
		ws.current.onerror = (error) => {
			if (onError) {
				onError(error);
			}
		};
		ws.current.onclose = (event) => {
			setConnected(false);
			if (onClose) {
				onClose(event);
			}
		};
	};

	const close = () => {
		setConnected(false);
		ws.current.close();
	};

	const send = (message: string | object) => {
		ws.current.send(JSON.stringify(message));
	};

	return {
		connected,
		connect,
		close,
		send
	};
}