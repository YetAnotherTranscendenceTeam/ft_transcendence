import Babact from "babact";
import { IUser, User } from "./useUsers";
import useWebSocket, { WebSocketHook } from "./useWebSocket";
import useFetch from "./useFetch";
import config from "../config";
import { IMe } from "../contexts/useAuth";
import useToast from "./useToast";
import { GameMode, IGameMode } from "yatt-lobbies";
import Button from "../ui/Button";
import { useLobby } from "../contexts/useLobby";

export enum StatusType {
	ONLINE = 'online',
	OFFLINE = 'offline',
	INGAME = 'ingame',
	INACTIVE = 'inactive',
	INLOBBY = 'inlobby',
}

export type FollowStatus = {
	type: StatusType,
	data?: any,
}

export interface IFollow {
	account_id: number,
	profile: IUser,
	status: FollowStatus,
}

export class Follow implements IFollow {
	account_id: number;
	profile: User;
	status: FollowStatus;
	ws: WebSocketHook;


	constructor(follow: IFollow, ws: WebSocketHook){
		this.ws = ws;
		this.account_id = follow.account_id;
		this.profile = new User(follow.profile);
		this.status = follow.status;
	}

	unfollow(): void {
		const { ft_fetch } = useFetch();
		ft_fetch(`${config.API_URL}/social/follows/${this.account_id}`, {
			method: 'DELETE',
		}, {
			success_message: `You unfollowed ${this.profile.username}`,
			show_error: true,
			error_messages: {
				404: `You are not following ${this.profile.username}`,
			}
		});
	};

	invite(gamemode: GameMode, join_secret: string): void {
		this.ws.send({
			event: 'send_lobby_invite',
			data: {
				gamemode,
				join_secret,
				account_id: this.account_id,
			}
		});
	};

	request(): void {
		this.ws.send({
			event: 'send_lobby_request',
			data: {
				account_id: this.account_id,
			}
		});
	};

	setStatus(status: FollowStatus): this {
		this.status = status;
		return this;
	};

}

export default function useSocial(setMeStatus: (status: FollowStatus) => void, getMe: () => IMe): {
		follows: Follow[],
		connected: boolean,
		connect: () => void
		ping: () => void
		status: (status: FollowStatus) => void
	} {

	const [follows, setFollows] = Babact.useState<Follow[]>([]);

	const inivites = Babact.useRef([]);

	const onWelcome = ({ follows, self }: {follows: IFollow[], self: FollowStatus}) => {
		setFollows(follows.map(f => new Follow(f, ws)));
		setMeStatus(self);
	};

	const onStatusChange = ({ account_id, status }: {account_id: number, status: FollowStatus}) => {
		if (getMe()?.account_id === account_id)
			setMeStatus(status);
		setFollows(follows => follows.map(f => {
			if (f.account_id === account_id)
				return f.setStatus(status);
			return f;
		}));
	};

	const onFollow = (follow: IFollow) => {
		setFollows(follows => follows.concat(new Follow(follow, ws)));
	};

	const onUnfollow = ({ account_id }: {account_id: number}) => {
		setFollows(follows => follows.filter(f => f.account_id !== account_id));
	};

	const onLobbyInvite = ({ join_secret, username, gamemode}: {join_secret: string, username: string, gamemode: IGameMode}) => {
		const { createToast, removeToast } = useToast();
		const { join } = useLobby();

		if (inivites.current.includes(username))
			return;
		inivites.current.push(username);

		const handleAccept = (id: number) => {
			join(join_secret);
			removeToast(id);
			inivites.current = inivites.current.filter(i => i !== username);
		};

		const handleDecline = (id: number) => {
			removeToast(id);
			inivites.current = inivites.current.filter(i => i !== username);
		};

		const message = (id: number) => <div className="flex flex-col gap-2">
			<h1>{username} invited you to their lobby</h1>
			<p>Game mode : {new GameMode(gamemode).getDisplayName()} {new GameMode(gamemode).type}</p>
			<div className="flex gap-2">
				<Button
					className="success w-full"
					onClick={() => handleAccept(id)}
				>
					<i className="fa-solid fa-check"></i> Accept
				</Button>
				<Button
					className="danger w-full"
					onClick={() => handleDecline(id)}
				>
					<i className="fa-solid fa-xmark"></i> Decline
				</Button>
			</div>
		</div>;

		createToast(message, 'info', 0);
	};

	const onLobbyRequest = ({ username, account_id }: {username: string, account_id: number}) => {
		
		const { lobby } = useLobby();
		if (inivites.current.includes(username) || !lobby)
			return;
		inivites.current.push(username);

		const { createToast, removeToast } = useToast();

		const handleAccept = (id: number) => {
			const follow = new Follow({
				account_id,
				profile: {
					avatar: '',
					username: username,
					account_id,
				},
				status: {
					type: StatusType.OFFLINE,
				}
			}, ws);
			createToast(`You invited ${follow.profile.username} to your lobby`, 'success');
			follow.invite(lobby.mode, lobby.join_secret);
			removeToast(id);
			inivites.current = inivites.current.filter(i => i !== username);
		};

		const handleDecline = (id: number) => {
			removeToast(id);
			inivites.current = inivites.current.filter(i => i !== username);
		};

		const message = (id) => <div className="flex flex-col gap-2">
			<h1>{username} requested to join your lobby</h1>
			<div className="flex gap-2">
				<Button
					onClick={() => handleAccept(id)}
					className="success w-full"
				>
					<i className="fa-regular fa-paper-plane"></i> Invite to lobby
				</Button>
				<Button
					className="danger"
					onClick={() => handleDecline(id)}
				>
					<i className="fa-solid fa-xmark"></i> Decline
				</Button>
			</div>
		</div>

		createToast(message, 'info', 0);
	};

	const onConnect = () => {
		const { lobby } = useLobby();
		if (lobby)
			status({type: StatusType.INLOBBY, data: {...lobby, join_secret: null}});
		else
			status({type: StatusType.ONLINE});
	};

	const ws = useWebSocket({
		onEvent: {
			'welcome': onWelcome,
			'status': onStatusChange,
			'follow': onFollow,
			'unfollow': onUnfollow,
			'receive_lobby_invite': onLobbyInvite,
			'receive_lobby_request': onLobbyRequest,
		},
		onOpen: onConnect,
	});

	const connect = () => {
		ws.connect(`${config.WS_URL}/social/notify?access_token=${localStorage.getItem('access_token')}`);
	};

	const ping = () => {
		ws.send({event: 'ping'});
	};

	const status = async (status: FollowStatus) => {
		ws.send({event: 'update_status', data: status});
	};

	return {
		follows,
		connected: ws.connected,
		connect,
		ping,
		status,
	};
}