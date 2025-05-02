import Babact from "babact";
import { IUser, User } from "./useUsers";
import useWebSocket, { WebSocketHook } from "./useWebSocket";
import useFetch from "./useFetch";
import config from "../config";
import { IMe } from "../contexts/useAuth";
import useToast, { ToastType } from "./useToast";
import { GameMode, IGameMode, ILobbyState } from "yatt-lobbies";
import Button from "../ui/Button";
import { useLobby } from "../contexts/useLobby";

export enum StatusType {
	ONLINE = 'online',
	OFFLINE = 'offline',
	INGAME = 'ingame',
	INACTIVE = 'inactive',
	INLOBBY = 'inlobby'
}

export type FriendStatus = {
	type: StatusType,
	data?: {
		player_ids: number[],
		gamemode: IGameMode,
		state: ILobbyState
	},
}

export interface IFriend {
	account_id: number,
	profile: IUser,
	status: FriendStatus,
}


export class Friend implements IFriend {
	account_id: number;
	profile: User;
	status: FriendStatus;
	ws: WebSocketHook;
	ft_fetch: any;


	constructor(friend: IFriend, ws: WebSocketHook, ft_fetch?: any) {
		this.ft_fetch = ft_fetch;
		this.ws = ws;
		this.account_id = friend.account_id;
		this.profile = new User(friend.profile, ft_fetch);
		this.status = friend.status;
	}

	async remove() {
		const response = await this.ft_fetch(`${config.API_URL}/social/friends/${this.account_id}`, {
			method: 'DELETE',
		}, {
			error_messages: {
				404: 'Friend not found',
			}
		});
		return response;
	}

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

	setStatus(status: FriendStatus): this {
		this.status = status;
		return this;
	};

}

export interface IBlockedUser {
	account_id: number,
	profile: IUser,
}

export class BlockedUser extends User implements IBlockedUser {
	account_id: number;
	profile: User;

	constructor(user: IBlockedUser, ft_fetch: any) {
		super(user.profile, ft_fetch);
		this.account_id = user.account_id;
		this.profile = new User(user.profile, ft_fetch);
	}

	async unblock() {
		const response = await this.ft_fetch(`${config.API_URL}/social/blocks/${this.account_id}`, {
			method: 'DELETE',
		}, {
			error_messages: {
				404: 'User not found',
			}
		});
		return response;
	}

}

export interface IRequest {
	account_id: number,
	profile: IUser,
}

export class Request implements IRequest {
	account_id: number;
	profile: User;
	ft_fetch: any;

	constructor(request: IRequest, ft_fetch: any) {
		this.account_id = request.account_id;
		this.profile = new User(request.profile, ft_fetch);
		this.ft_fetch = ft_fetch;
	}

	async cancel() {
		const response = await this.ft_fetch(`${config.API_URL}/social/requests/${this.account_id}`, {
			method: 'DELETE',
		}, {
			error_messages: {
				404: 'Request not found',
			}
		});
		return response;
	};

	async accept() {
		return await this.profile.request();
	}
}

export interface ISocials {
	friends: Friend[],
	pending: {
		sent: Request[],
		received: Request[],
	},
	blocked: BlockedUser[],
}

export default function useSocial(setMeStatus: (status: FriendStatus) => void, getMe: () => IMe): {
		socials: ISocials,
		connected: boolean,
		connect: () => void
		ping: () => void
		status: (status: FriendStatus) => void,
		disconnect: () => void
	} {

	const { ft_fetch } = useFetch();
	const [socials, setSocials] = Babact.useState<ISocials>(null);
	const { createToast, removeToast } = useToast();

	const lobbyInvites = Babact.useRef([]);
	const friendInvites = Babact.useRef([]);

	const onWelcome = ({
			self,
			friends,
			pending,
			blocked
		}: {
			self: FriendStatus,
			friends: IFriend[],
			pending: {
				sent: IRequest[],
				received: IRequest[],
			},
			blocked: IBlockedUser[],
		}) => {

		setSocials({
			friends: friends.map((f: IFriend) => new Friend(f, ws, ft_fetch)),
			pending: {
				sent: pending.sent.map((r: IRequest) => new Request(r, ft_fetch)),
				received: pending.received.map((r: IRequest) => new Request(r, ft_fetch)),
			},
			blocked: blocked.map((b: IBlockedUser) => new BlockedUser(b, ft_fetch)),
		});

		setMeStatus(self);
	};

	const onStatusChange = ({ account_id, status }: {account_id: number, status: FriendStatus}) => {
		if (getMe()?.account_id === account_id)
			setMeStatus(status);
		setSocials(s => ({
			...s,
			friends: s.friends.map(f => {
				if (f.account_id === account_id)
					return f.setStatus(status);
				return f;
			})
		}));
	};

	const onNewFriendRequest = ({ account_id, profile, sender }: {account_id: number, profile: IUser, sender: number}) => {
		if (getMe()?.account_id === sender) {
			setSocials(s => ({
				...s,
				pending: {
					...s.pending,
					sent: [...s.pending.sent, new Request({account_id, profile}, ft_fetch)],
				}
			}));
		}
		else {

			if (friendInvites.current.includes(profile.username))
				return;
			friendInvites.current.push(profile.username);

			const message = (id: number) => <div className="resquest-toast flex flex-col gap-2">
				<Button
					className="close-button ghost icon"
					onClick={() => {
						friendInvites.current = friendInvites.current.filter(i => i !== profile.username);
						if (removeToast)
							removeToast(id);
					}}
				>
					<i className="fa-solid fa-xmark"></i>
				</Button>
				<h1>{profile.username} sent you a friend request</h1>
				<div className="flex gap-2">
					<Button
						className="success w-full"
						onClick={() => {
							const request = new Request({account_id, profile}, ft_fetch);
							friendInvites.current = friendInvites.current.filter(i => i !== profile.username);
							request.accept();
							if (removeToast)
								removeToast(id);
						}}
					>
						<i className="fa-solid fa-user-check"></i> Accept
					</Button>
					<Button
						className="danger w-full"
						onClick={() => {
							const request = new Request({account_id, profile}, ft_fetch);
							friendInvites.current = friendInvites.current.filter(i => i !== profile.username);
							request.cancel();
							if (removeToast)
								removeToast(id);
						}}
					>
						<i className="fa-solid fa-xmark"></i> Decline
					</Button>
				</div>
			</div>;

			if (createToast)
				createToast(message, ToastType.SUCCESS, 0);
			setSocials(s => ({
				...s,
				pending: {
					...s.pending,
					received: [...s.pending.received, new Request({account_id, profile}, ft_fetch)],
				}
			}));
		}
	}

	const onDeleteFriendRequest = ({ account_id, sender }: {account_id: number, sender: number}) => {
		if (getMe()?.account_id === sender) {
			setSocials(s => ({
				...s,
				pending: {
					...s.pending,
					sent: s.pending.sent.filter(r => r.account_id !== account_id),
				}
			}));
		}
		else {
			setSocials(s => ({
				...s,
				pending: {
					...s.pending,
					received: s.pending.received.filter(r => r.account_id !== account_id),
				}
			}));
		}
	}

	const onNewFriend = ({account_id, profile, status}: {account_id: number, profile: IUser, status: FriendStatus}) => {
		if (createToast)
			createToast(`You are now friends with ${profile.username}`, ToastType.SUCCESS);
		setSocials(s => ({
			...s,
			friends: [...s.friends, new Friend({account_id, profile, status}, ws, ft_fetch)],
			pending: {
				sent: s.pending.sent.filter(r => r.account_id !== account_id),
				received: s.pending.received.filter(r => r.account_id !== account_id),
			}
		}));
	}

	const onDeleteFriend = ({account_id}: {account_id: number}) => {
		setSocials(s => ({
			...s,
			friends: s.friends.filter(f => f.account_id !== account_id),
		}));
	};

	const onNewBlock = ({account_id, profile}: {account_id: number, profile: IUser}) => {
		setSocials(s => ({
			friends: s.friends.filter(f => f.account_id !== account_id),
			pending: {
				sent: s.pending.sent.filter(r => r.account_id !== account_id),
				received: s.pending.received.filter(r => r.account_id !== account_id),
			},
			blocked: [...s.blocked, new BlockedUser({account_id, profile}, ft_fetch)],
		}));
	}

	const onDeleteBlock = ({account_id}: {account_id: number}) => {
		setSocials(s => ({
			...s,
			blocked: s.blocked.filter(b => b.account_id !== account_id),
		}));
	}

	const onLobbyInvite = ({ join_secret, username, gamemode}: {join_secret: string, username: string, gamemode: IGameMode}) => {
		const { join } = useLobby();
		if (lobbyInvites.current.includes(username))
			return;
		lobbyInvites.current.push(username);

		const handleAccept = (id: number) => {
			join(join_secret);
			if (removeToast)
				removeToast(id);
			lobbyInvites.current = lobbyInvites.current.filter(i => i !== username);
		};

		const handleDecline = (id: number) => {
			if (removeToast)
				removeToast(id);
			lobbyInvites.current = lobbyInvites.current.filter(i => i !== username);
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
		if (createToast)
			createToast(message, ToastType.INFO, 0);
	};

	const onLobbyRequest = ({
			username,
			account_id
		}: {
			username: string,
			account_id: number
		}) => {

		const { lobby } = useLobby();
		if (lobbyInvites.current.includes(username) || !lobby)
			return;
		lobbyInvites.current.push(username);

		const handleAccept = (id: number) => {
			const follow = new Friend({
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
			if (createToast)
				createToast(`You invited ${follow.profile.username} to your lobby`, ToastType.SUCCESS);
			follow.invite(lobby.mode, lobby.join_secret);
			if (removeToast)
				removeToast(id);
			lobbyInvites.current = lobbyInvites.current.filter(i => i !== username);
		};

		const handleDecline = (id: number) => {
			if (removeToast)
				removeToast(id);
			lobbyInvites.current = lobbyInvites.current.filter(i => i !== username);
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

		if (createToast)
			createToast(message, ToastType.INFO, 0);
	};

	const onConnect = () => {
		status({type: StatusType.ONLINE});
	};

	const ws = useWebSocket({
		onEvent: {
			'welcome': onWelcome,
			'recv_status': onStatusChange,
			'recv_new_friend_request': onNewFriendRequest,
			'recv_delete_friend_request': onDeleteFriendRequest,
			'recv_new_friend': onNewFriend,
			'recv_delete_friend': onDeleteFriend,
			'recv_new_block': onNewBlock,
			'recv_delete_block': onDeleteBlock,
			'recv_lobby_invite': onLobbyInvite,
			'recv_lobby_request': onLobbyRequest,
		},
		onOpen: onConnect,
	});

	const connect = () => {
		ws.connect(`${config.WS_URL}/social/notify`, true);
	};

	const ping = () => {
		ws.send({event: 'ping'});
	};

	const status = async (status: FriendStatus) => {
		ws.send({event: 'send_status', data: status});
	};

	const disconnect = () => {
		ws.close();
	};

	Babact.useEffect(() => {
		if (ws.connected) {
			const interval = setInterval(() => {
				if (navigator.userActivation && navigator.userActivation.isActive)
					ping();
			}, 2000);
			return () => {
				clearInterval(interval);
			}
		}
	}, [ws.connected]);

	return {
		socials,
		connected: ws.connected,
		connect,
		ping,
		status,
		disconnect,
	};
}