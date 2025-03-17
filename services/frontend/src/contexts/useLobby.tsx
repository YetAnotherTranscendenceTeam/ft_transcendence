import Babact from "babact";
import useWebSocket from "../hooks/useWebSocket";
import config from "../config";
import useEffect from "babact/dist/hooks/useEffect";
import useToast from "../hooks/useToast";
import { useNavigate } from "babact-router-dom";

import { GameMode, ILobby, removePlayer } from "yatt-lobbies";

const LobbyContext = Babact.createContext();

export const LobbyProvider = ({ children } : { children?: any }) => {
	
	const [lobby, setLobby] = Babact.useState(null);
	const { createToast } = useToast();

	const navigate = useNavigate();

	const onTeamNameChange = (team_index: number, name: string) => {
		setLobby((lobby: ILobby) => (lobby && {
			...lobby,
			team_names: lobby.team_names.map((team, i) => i === team_index ? name : team)
		}));
	};

	const onStateChange = (state: any) => {
		if (state.type === 'playing')
			createToast('Match found', 'info');
		setLobby((lobby: ILobby) => (lobby && {
			...lobby,
			state
		}));
	};

	const onModeChange = (mode: any) => {
		const newMode = new GameMode(mode);
		createToast(`Gamemode changed to ${newMode.getDisplayName()}`, 'info');
		setLobby((lobby: ILobby) => (lobby && {
			...lobby,
			mode: newMode
		}));
	};

	const onLeaderChange = (leader_account_id: any) => {
		setLobby((lobby: ILobby) => (lobby && {
			...lobby,
			leader_account_id
		}));
	}

	const onPlayerJoin = (player: any) => {
		createToast(`${player.profile?.username} joined the lobby`, 'info');
		setLobby((lobby: ILobby) => (lobby && {
			...lobby,
			players: [...lobby.players, player]
		}));
	};

	const onPlayerLeave = (player: any) => {
		setLobby((lobby: ILobby) => (lobby && {
			...lobby,
			players: removePlayer(lobby.players, lobby.mode, lobby.players.findIndex((p) => p.account_id === player.account_id))
		}));
	};
	
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
				players: newPlayers,
			};
		});
	}

	const onPlayerConnect = (lobby: ILobby) => {
		localStorage.setItem('lobby', lobby.join_secret);
		setLobby({
			...lobby,
			mode: new GameMode(lobby.mode),
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
		else if (msg.event === 'leader_change') {
			onLeaderChange(msg.data.leader_account_id);
		}
		else if (msg.event === 'error') {
			createToast(msg.data.message, 'danger');
		}
		else if (msg.event === 'mode_change') {
			onModeChange(msg.data.mode);
		}
		else if (msg.event === 'state_change') {
			onStateChange(msg.data.state);
		}
		else if (msg.event === 'team_name') {
			onTeamNameChange(msg.data.team_index, msg.data.name);
		}
	};

	const onClose = (e) => {
		console.log('onClose', e)
		if (window.location.pathname.startsWith('/lobby'))
			navigate('/');
		localStorage.removeItem('lobby');
		setLobby(null);
		if (e.code === 1008)
			createToast(e.reason, 'danger');
		else if (e.code === 1000)
			createToast('Kicked from lobby', 'danger', 10000);
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

	const leave = () => {
		ws.send(JSON.stringify({
			event: 'disconnect'
		}));
		ws.disconnect();
	};

	const queueStart = () => {
		ws.send(JSON.stringify({
			event: 'queue_start'
		}));
	};

	const queueStop = () => {
		ws.send(JSON.stringify({
			event: 'queue_stop'
		}));
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

	const changeMode = (mode: string) => {
		ws.send(JSON.stringify({
			event: 'mode',
			data: {
				mode
			}
		}));
	};

	const kickPlayer = (player: number) => {
		console.log('kick', player)
		ws.send(JSON.stringify({
			event: 'kick',
			data: {
				account_id: player
			}
		}));
	};

	const changeTeamName = (team_index: number, name: string) => {
		ws.send(JSON.stringify({
			event: 'team_name',
			data: {
				team_index,
				name
			}
		}));
	};

	useEffect(() => {
		const lobby = localStorage.getItem('lobby');
		if (lobby) {
			ws.connect(`${config.WS_URL}/lobbies/join?secret=${lobby}&token=${localStorage.getItem("access_token")}`);
		}
	}, []);

	useEffect(() => {
		console.log('lobby', lobby)
	}, [lobby]);

	return (
		<LobbyContext.Provider
			value={{
				lobby,
				create,
				join,
				leave,
				swapPlayers,
				changeMode,
				queueStart,
				queueStop,
				kickPlayer,
				changeTeamName
			}}
		>
			{children}
		</LobbyContext.Provider>
	);
};

export const useLobby = (): {
	lobby: ILobby,
	create: (mode: string) => void,
	join: (id: string) => void,
	leave: () => void,
	swapPlayers: (player1: number, player2: number) => void,
	changeMode: (mode: string) => void,
	queueStart: () => void,
	queueStop: () => void,
	kickPlayer: (player: number) => void,
	changeTeamName: (team_index: number, name: string) => void
} => {
	return Babact.useContext(LobbyContext);
};