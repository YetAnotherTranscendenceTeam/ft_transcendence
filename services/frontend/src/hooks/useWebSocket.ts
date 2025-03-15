import Babact from "babact";

export default function useWebSocket() {
	const ws = Babact.useRef(null);
	const [connected, setConnected] = Babact.useState(false);
	const [messages, setMessages] = Babact.useState([]);
	const [message, setMessage] = Babact.useState('');
	const [error, setError] = Babact.useState(null);
	const [loading, setLoading] = Babact.useState(false);
	const [reconnect, setReconnect] = Babact.useState(false);
	const [reconnectInterval, setReconnectInterval] = Babact.useState(null);

	const connect = (url) => {
		setLoading(true);
		setError(null);
		ws.current = new WebSocket(url);
		ws.current.onopen = (e) => {
			console.log('onopen', e);
			setConnected(true);
			setLoading(false);
		};
		ws.current.onmessage = (event) => {
			setMessages(messages => [...messages, event.data]);
		};
		ws.current.onerror = (error) => {
			console.log('onerror', error);
			setError(error);
			setLoading(false);
		};
		ws.current.onclose = (e) => {
			console.log('onclose', e);
			setConnected(false);
			setLoading(false);
			if (reconnect) {
				setReconnectInterval(setInterval(() => {
					connect(url);
				}, 5000));
			}
		};
	};

	const disconnect = () => {
		setReconnect(false);
		clearInterval(reconnectInterval);
		ws.current.close();
	};

	const send = (message) => {
		ws.current.send(message);
	};

	const toggleReconnect = () => {
		setReconnect(!reconnect);
	};

	return {
		connected,
		messages,
		message,
		error,
		loading,
		reconnect,
		connect,
		disconnect,
		send,
		setMessage,
		toggleReconnect
	};
}