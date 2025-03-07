import Babact from "babact";
import useWebSocket from "../hooks/useWebSocket";
import config from "../config";
import useEffect from "babact/dist/hooks/useEffect";
import useToast from "../hooks/useToast";

const LobbyContext = Babact.createContext();

export const LobbyProvider = ({ children } : { children?: any }) => {
	
	const [lobby, setLobby] = Babact.useState(null);
	const { createToast } = useToast();

	const onPlayerJoin = (player: any) => {
		createToast(`${player.profile?.username} joined the lobby`, 'info');
		setLobby((lobby) => (lobby && {
			...lobby,
			players: [...lobby.players, player]
		}));
	};

	const onPlayerLeave = (player: any) => {
		setLobby((lobby) => (lobby && {
			...lobby,
			players: lobby.players.filter((p: any) => p.account_id !== player.account_id)
		}));
	};

	const onPlayerConnect = (lobby) => {
		console.log('lobby', lobby.joinSecret)
		// navigator.clipboard.writeText(lobby.joinSecret);
		localStorage.setItem('lobby', lobby.joinSecret);
		setLobby(lobby);
	}

	const onPlayerSwap = ([id1, id2]) => {
		setLobby((lobby) => {
			const newPlayers = [...lobby.players];
			const player1 = newPlayers.findIndex((p) => p.account_id === id1);
			const player2 = newPlayers.findIndex((p) => p.account_id === id2);
			const temp = newPlayers[player1];
			newPlayers[player1] = newPlayers[player2];
			newPlayers[player2] = temp;
			console.log(lobby.players);
			return {
				...lobby,
				players: newPlayers
			};
		});
	}

	const onMessage = (message: string) => {
		const msg = JSON.parse(message);
		console.log('onMessage', msg)
		if (msg.event === 'lobby') {
			onPlayerConnect(msg.data.lobby);
		}
		else if (msg.event === 'player_join') {
			onPlayerJoin(msg.data.player);
		}
		else if (msg.event === 'player_leave') {
			onPlayerLeave(msg.data.player);
		}
		else if (msg.event === 'swap_players') {
			onPlayerSwap(msg.data.account_ids);
		}
	};

	const onClose = (e) => {
		console.log('onClose', e)
		if (e.code === 1008)
			createToast(e.reason, 'danger');
		localStorage.removeItem('lobby');
		setLobby(null);
	};

	const onError = (error: any) => {
		console.error(error);
	};

	const ws = useWebSocket({
		onMessage,
		onClose,
		onError
	});

	const create = async (mode: string = 'ranked_1v1') => {
		ws.connect(`${config.WS_URL}/lobbies/join?gamemode=${mode}&token=${localStorage.getItem("access_token")}`);
	};

	const join = async (id: string) => {
		ws.connect(`${config.WS_URL}/lobbies/join?secret=${id}&token=${localStorage.getItem("access_token")}`);
	};

	const swapPlayers = (player1: any, player2: any) => {
		ws.send(JSON.stringify({
			event: 'swap_players',
			data: {
				account_ids: [
					player1,
					player2
				]
			}
		}));
	};

	useEffect(() => {
		const lobby = localStorage.getItem('lobby');
		if (lobby) {
			ws.connect(`${config.WS_URL}/lobbies/join?secret=${lobby}&token=${localStorage.getItem("access_token")}`);
		}
	}, []);

	return (
		<LobbyContext.Provider
			value={{
				lobby,
				create,
				join,
				swapPlayers
			}}
		>
			{children}
		</LobbyContext.Provider>
	);
};

export const useLobby = () => {
	return Babact.useContext(LobbyContext);
};