import Babact from "babact";
import useWebSocket from "../hooks/useWebSocket";
import config from "../config";

const LobbyContext = Babact.createContext();

export const LobbyProvider = ({ children } : { children?: any }) => {
	
	const [lobby, setLobby] = Babact.useState(null);

	const onPlayerJoin = (player: any) => {
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

	const onMessage = (message: string) => {
		const msg = JSON.parse(message);
		console.log('onMessage', msg)
		if (msg.event === 'lobby') {
			console.log('lobby', msg.data.lobby.joinSecret)
			setLobby(msg.data.lobby);
		}
		else if (msg.event === 'player_join') {
			onPlayerJoin(msg.data.player);
		}
		else if (msg.event === 'player_leave') {
			onPlayerLeave(msg.data.player);
		}
	};

	const ws = useWebSocket({
		onMessage
	});

	const create = async (mode: string = 'ranked_1v1') => {
		ws.connect(`${config.WS_URL}/lobbies/join?gamemode=${mode}&token=${localStorage.getItem("access_token")}`);
	};

	const join = async (id: string) => {
		ws.connect(`${config.WS_URL}/lobbies/join?secret=${id}&token=${localStorage.getItem("access_token")}`);
	};


	return (
		<LobbyContext.Provider
			value={{
				lobby,
				create,
				join
			}}
		>
			{children}
		</LobbyContext.Provider>
	);
};

export const useLobby = () => {
	return Babact.useContext(LobbyContext);
};