import Babact from "babact";

export type WebSocketHook = {
	connected: boolean,
	connect: (url: string) => void,
	close: () => void,
	send: (message: string) => void
}

export default function useWebSocket({
		onMessage,
		onError,
		onClose,
		onOpen,
		eventHandlers = null
	} : {
		onMessage?: (message: string) => void,
		onError?: (error: any) => void,
		onClose?: (event) => void,
		onOpen?: (event) => void,
		eventHandlers?: { [key: string]: (event) => void }
	} = {}): WebSocketHook {
	const ws = Babact.useRef(null);
	const [connected, setConnected] = Babact.useState(false);

	const connect = (url: string) => {
		if (ws.current) {
			close();
		}
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
			if (eventHandlers) {
				const msg = JSON.parse(event.data);
				if (eventHandlers[msg.event]) {
					eventHandlers[msg.event](msg.data);
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

	const send = (message) => {
		ws.current.send(message);
	};

	return {
		connected,
		connect,
		close,
		send
	};
}