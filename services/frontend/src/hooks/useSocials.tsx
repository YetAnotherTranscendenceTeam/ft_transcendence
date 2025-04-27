import Babact from "babact";
import { IUser, User } from "./useUsers";
import useWebSocket, { WebSocketHook } from "./useWebSocket";
import useFetch from "./useFetch";
import config from "../config";
import { IMe } from "../contexts/useAuth";
import useToast, { ToastType } from "./useToast";
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

export interface IFriend {
	account_id: number,
	profile: IUser,
	status: FollowStatus,
}


export class Friend implements IFriend {
	account_id: number;
	profile: User;
	status: FollowStatus;
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
			success_message: `${this.profile.username} removed from friends`,
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

	setStatus(status: FollowStatus): this {
		this.status = status;
		return this;
	};

}

export interface IBlockedUser {
	account_id: number,
	profile: User,
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
			success_message: 'User unblocked',
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

export default function useSocial(setMeStatus: (status: FollowStatus) => void, getMe: () => IMe): {
		socials: ISocials,
		connected: boolean,
		connect: () => void
		ping: () => void
		status: (status: FollowStatus) => void,
		disconnect: () => void
	} {

	const { ft_fetch } = useFetch();
	const [socials, setSocials] = Babact.useState<ISocials>(null);

	const inivites = Babact.useRef([]);

	const onWelcome = ({
			self,
			friends,
			pending,
			blocked
		}: {
			self: FollowStatus,
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

	const onStatusChange = ({ account_id, status }: {account_id: number, status: FollowStatus}) => {
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
		const { createToast, removeToast } = useToast();
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

			if (inivites.current.includes(profile.username))
				return;
			inivites.current.push(profile.username);

			const message = (id: number) => <div className="resquest-toast flex flex-col gap-2">
				<Button
					className="close-button ghost icon"
					onClick={() => {
						inivites.current = inivites.current.filter(i => i !== profile.username);
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
							inivites.current = inivites.current.filter(i => i !== profile.username);
							request.accept();
							removeToast(id);
						}}
					>
						<i className="fa-solid fa-user-check"></i> Accept
					</Button>
					<Button
						className="danger w-full"
						onClick={() => {
							const request = new Request({account_id, profile}, ft_fetch);
							inivites.current = inivites.current.filter(i => i !== profile.username);
							request.cancel();
							removeToast(id);
						}}
					>
						<i className="fa-solid fa-xmark"></i> Decline
					</Button>
				</div>
			</div>;

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

	const onNewFriend = ({account_id, profile, status}: {account_id: number, profile: IUser, status: FollowStatus}) => {
		const { createToast } = useToast();
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
		if (inivites.current.includes(username) || !lobby)
			return;
		inivites.current.push(username);

		const { createToast, removeToast } = useToast();

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
			createToast(`You invited ${follow.profile.username} to your lobby`, ToastType.SUCCESS);
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

		createToast(message, ToastType.INFO, 0);
	};

	const onConnect = () => {
		status({type: StatusType.ONLINE});
	};

	const ws = useWebSocket({
		onEvent: {
			'welcome': onWelcome,
			'status': onStatusChange,
			'receive_new_friend_request': onNewFriendRequest,
			'receive_delete_friend_request': onDeleteFriendRequest,
			'receive_new_friend': onNewFriend,
			'receive_delete_friend': onDeleteFriend,
			'receive_lobby_invite': onLobbyInvite,
			'receive_lobby_request': onLobbyRequest,
		},
		onOpen: onConnect,
	});

	const connect = () => {
		ws.connect(`${config.WS_URL}/social/notify`, true);
	};

	const ping = () => {
		ws.send({event: 'ping'});
	};

	const status = async (status: FollowStatus) => {
		ws.send({event: 'send_status', data: status});
	};

	const disconnect = () => {
		ws.close();
	};

	return {
		socials,
		connected: ws.connected,
		connect,
		ping,
		status,
		disconnect,
	};
}