import Babact from "babact";
import useWebSocket, { WebSocketHook } from "../hooks/useWebSocket";
import config from "../config";
import useToast from "../hooks/useToast";
import { useNavigate } from "babact-router-dom";

import { GameMode, ILobby, IPlayer, Lobby } from "yatt-lobbies";
import useSocial, { StatusType } from "../hooks/useSocials";
import { useAuth } from "./useAuth";

class LobbyClient extends Lobby {

	ws: WebSocketHook;

	constructor(lobby: ILobby, ws: WebSocketHook);
	constructor(lobby: LobbyClient);
	constructor(lobby: LobbyClient | ILobby, ws?: WebSocketHook) {
		super(lobby);
		if (ws) {
			this.ws = ws;
		}
		else if (lobby instanceof LobbyClient) {
			this.ws = lobby.ws;
		}
	}

	leave() {
		this.ws.send({
			event: 'disconnect'
		});
		this.ws.close();
	};

	queueStart() {
		this.ws.send({
			event: 'queue_start'
		});
	};

	queueStop() {
		this.ws.send({
			event: 'queue_stop'
		});
	};

	swapPlayers(player1: any, player2: any) {
		this.ws.send({
			event: 'swap_players',
			data: {
				account_ids: [
					player1,
					player2
				]
			}
		});
	};

	changeMode(mode: string) {
		this.ws.send({
			event: 'mode',
			data: {
				mode
			}
		});
	};

	kickPlayer(player: number) {
		this.ws.send({
			event: 'kick',
			data: {
				account_id: player
			}
		});
	};

	changeTeamName(team_index: number, name: string) {
		this.ws.send({
			event: 'team_name',
			data: {
				team_index,
				name
			}
		});
	};
}

const LobbyContext = Babact.createContext();

export const LobbyProvider = ({ children } : { children?: any }) => {
	
	const [lobby, setLobby] = Babact.useState<LobbyClient>(null);
	const { createToast } = useToast();

	const navigate = useNavigate();

	const onTeamNameChange = (team_index: number, name: string) => {
		setLobby((lobby: LobbyClient) => new LobbyClient(lobby?.setTeamName(team_index, name)));
	};

	const onStateChange = (state: any) => {
		if (state.type === 'playing')
			createToast('Match found', 'info');
		setLobby((lobby: LobbyClient) => new LobbyClient(lobby?.setState(state)));
	};

	const onModeChange = (mode: any) => {
		const newMode = new GameMode(mode);
		createToast(`Gamemode changed to ${newMode.getDisplayName()}`, 'info');
		setLobby((lobby: LobbyClient) => new LobbyClient(lobby?.setMode(mode)));
	};

	const onLeaderChange = (leader_account_id: any) => {
		setLobby((lobby: LobbyClient) => new LobbyClient(lobby?.setLeader(leader_account_id)));
	}

	const onPlayerJoin = (player: IPlayer) => {
		createToast(`${player.profile?.username} joined the lobby`, 'info');
		setLobby((lobby: LobbyClient) => new LobbyClient(lobby?.addPlayer(player)));
	};

	const onPlayerLeave = (player: any) => {
		createToast(`${player.profile?.username} left the lobby`, 'info');
		setLobby((lobby: LobbyClient) => new LobbyClient(lobby?.removePlayer(lobby.players.findIndex((p) => p.account_id === player.account_id))));
	};

	const onPlayerSwap = ([id1, id2]) => {
		setLobby((lobby: LobbyClient) => {
			if (!lobby) return;
			const newPlayers = [...lobby.players];
			const player1 = newPlayers.findIndex((p) => p.account_id === id1);
			const player2 = newPlayers.findIndex((p) => p.account_id === id2);
			const temp = newPlayers[player1];
			newPlayers[player1] = newPlayers[player2];
			newPlayers[player2] = temp;
			return new LobbyClient(lobby.setPlayers(newPlayers));
		});
	}

	const onPlayerConnect = (lobby: LobbyClient) => {
		localStorage.setItem('lobby', lobby.join_secret);
		setLobby(new LobbyClient(lobby, ws));
	}

	const onMessage = (message: string) => {
		const msg = JSON.parse(message);
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
		if (window.location.pathname.startsWith('/lobby'))
			navigate('/');
		localStorage.removeItem('lobby');
		setLobby(null);
		const errorMessages = {
			1000: 'Disconnected from lobby',
			3000: 'Unauthorized to join lobby',
			4000: 'Lobby not found',
			4001: 'Lobby is full',
			4002: 'Lobby is locked',
			4003: 'Connect from another location',
			4006: 'Kick from the lobby'
		};
		if (e.code === 1000)
			createToast(errorMessages[e.code], 'success');
		else if (errorMessages[e.code])
			createToast(errorMessages[e.code], 'danger', 6000);
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

	// TODO: Add a refresh alert to confirm leaving the lobby
	Babact.useEffect(() => {
		const lobby = localStorage.getItem('lobby');
		if (lobby) {
			ws.connect(`${config.WS_URL}/lobbies/join?secret=${lobby}&token=${localStorage.getItem("access_token")}`);
		}
	}, []);

	const { status, connected } = useAuth();

	Babact.useEffect(() => {
		if (lobby && connected)
			status({
				type: StatusType.INLOBBY,
				data: {...lobby, join_secret: null}
			});
		else if (!lobby && connected)
			status({
				type: StatusType.ONLINE,
			});
	}, [lobby]);

	return (
		<LobbyContext.Provider
			value={{
				lobby,
				create,
				join,
			}}
		>
			{children}
		</LobbyContext.Provider>
	);
};

export const useLobby = (): {
	lobby: LobbyClient,
	create: (mode: string) => void,
	join: (id: string) => void
} => {
	return Babact.useContext(LobbyContext);
};