import Babact from "babact";
import useWebSocket, { WebSocketHook } from "../hooks/useWebSocket";
import config from "../config";
import useToast, { ToastType } from "../hooks/useToast";
import { useNavigate } from "babact-router-dom";
import { GameMode, ILobby, IMatchParameters, IPlayer, Lobby, PongEventType } from "yatt-lobbies";
import { useAuth } from "./useAuth";
import { Team } from "../hooks/useTournament";
import ConfirmLobbyLeaveModal from "../components/Lobby/ConfirmLobbyLeaveModal";
import { useRTTournament } from "./useRTTournament";

export class LobbyClient extends Lobby {

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

	changeTeamName(name: string) {
		this.ws.send({
			event: 'team_name',
			data: {
				name
			}
		});
	};

	changeParameters(parameter: IMatchParameters) {
		this.ws.send({
			event: 'match_parameters',
			data: {
				...parameter
			}
		});
	}

	override getTeams(): Team[] {
		return super.getTeams().map(team => new Team(team));
	}

}

const LobbyContext = Babact.createContext<{
		lobby: LobbyClient,
		create: (mode: string) => void,
		join: (id: string) => void,
		setOnLeave: (onLeave: () => void) => void
	}>();

export const LobbyProvider = ({ children } : { children?: any }) => {
	
	const [lobby, setLobby] = Babact.useState<LobbyClient>(null);
	const [onLeave, setOnLeave] = Babact.useState<() => void>(null);
	const { createToast } = useToast();
	const { connect } = useRTTournament()

	const { me } = useAuth();

	Babact.useEffect(() => {
		if (!me && lobby)
			lobby.leave();
	}, [me]);

	const navigate = useNavigate();

	const onTeamNameChange = (team_index: number, name: string) => {
		setLobby((lobby) => new LobbyClient(lobby?.setTeamName(team_index, name)));
	};

	const onStateChange = (state: any) => {
		if (state.type === 'playing') {
			if (state.match.type === 'tournament') {
				navigate(`/tournaments/${state.match.tournament.id}`);
				connect(state.match.tournament.id);
			}
			else if (state.match.type === 'match') {
				navigate(`/matches/${state.match.match.match_id}`);
			}
		}
		setLobby((lobby: LobbyClient) => new LobbyClient(lobby?.setState(state)));
	};

	const onModeChange = (mode: any) => {
		const newMode = new GameMode(mode);
		createToast(`Gamemode changed to ${newMode.getDisplayName()} ${newMode.type}`, ToastType.INFO);
		setLobby((lobby: LobbyClient) => new LobbyClient(lobby?.setMode(mode)));
	};

	const onLeaderChange = (leader_account_id: any) => {
		setLobby((lobby: LobbyClient) => new LobbyClient(lobby?.setLeader(leader_account_id)));
	}

	const onPlayerJoin = (player: IPlayer) => {
		createToast(`${player.profile?.username} joined the lobby`, ToastType.INFO);
		setLobby((lobby: LobbyClient) => new LobbyClient(lobby?.addPlayer(player)));
	};

	const onPlayerLeave = (player: any) => {
		createToast(`${player.profile?.username} left the lobby`, ToastType.INFO);
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
		setLobby(new LobbyClient(lobby, ws));
		if (window.location.pathname === '/')
			navigate(`/lobby/${lobby.join_secret}`);
	}

	const onMatchParametersChange = (parameters: IMatchParameters) => {
		setLobby((lobby: LobbyClient) => new LobbyClient(lobby?.setMatchParameters(parameters)));
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
			createToast(msg.data.message, ToastType.DANGER);
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
		else if (msg.event === 'match_parameters') {
			onMatchParametersChange(msg.data.match_parameters);
		}
	};

	const onClose = (e) => {
		if (window.location.pathname.startsWith('/lobby'))
			navigate('/');
		setLobby(null);
		const errorMessages = {
			1000: 'You have been disconnected from the lobby',
			3000: 'You are not authorized to join this lobby',
			4000: 'The lobby you tried to join does not exist',
			4001: 'The lobby you tried to join is currently full',
			4002: 'The lobby you tried to join is currently locked',
			4003: 'Your account has joined a lobby from another location',
			4006: 'You have been kicked out of the lobby'
		};
		if (e.code === 1000)
			createToast(errorMessages[e.code], ToastType.SUCCESS);
		else if (errorMessages[e.code])
			createToast(errorMessages[e.code],  ToastType.DANGER, 6000);
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
		const handleCreate = () => ws.connect(`${config.WS_URL}/lobbies/join?gamemode=${mode}`, true);
		if (lobby)
			setOnLeave(() => handleCreate)
		else
			handleCreate();
	};

	const join = async (id: string) => {
		const handleJoin = () => ws.connect(`${config.WS_URL}/lobbies/join?secret=${id}`, true);
		if (lobby)
			setOnLeave(() => handleJoin)
		else
			handleJoin();
	};

	return (
		<LobbyContext.Provider
			value={{
				lobby,
				create,
				join,
				setOnLeave
			}}
		>
			<ConfirmLobbyLeaveModal
				isOpen={!!onLeave}
				onClose={() => setOnLeave(null)}
				onConfirm={() => onLeave && onLeave()}
				lobby={lobby}
				key={'lobby-leave-modal'}
			/>
			{children}
		</LobbyContext.Provider>
	);
};

export const useLobby = () => {
	return Babact.useContext(LobbyContext);
};