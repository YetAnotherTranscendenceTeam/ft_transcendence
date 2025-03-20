import Babact from "babact";
import { IUser, User } from "./useUsers";
import useWebSocket, { WebSocketHook } from "./useWebSocket";
import useFetch from "./useFetch";
import config from "../config";
import { useAuth } from "../contexts/useAuth";
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
		console.log(follow, ws);
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
		console.log('invite', gamemode, join_secret, this.ws);
		this.ws.send(JSON.stringify({
			event: 'send_lobby_invite',
			data: {
				gamemode,
				join_secret,
				account_id: this.account_id,
			}
		}));
	};

	setStatus(status: FollowStatus): this {
		this.status = status;
		return this;
	};

}

export default function useSocial(): {
		follows: Follow[],
		connect: () => void
		ping: () => void
		status: (status: FollowStatus) => void
	} {

	const [follows, setFollows] = Babact.useState<Follow[]>([]);

	const onWelcome = ({ follows, self }: {follows: IFollow[], self: FollowStatus}) => {
		const { setMeStatus } = useAuth();
		setFollows(follows.map(f => new Follow(f, ws)));
		setMeStatus(self);
	};

	const onStatusChange = ({ account_id, status }: {account_id: number, status: FollowStatus}) => {
		const { setMeStatus, me } = useAuth();
		if (me?.account_id === account_id)
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

	const onLobbyInvite = ({ join_secret, from, gamemode}: {join_secret: string, from: string, gamemode: IGameMode}) => {
		const { createToast, removeToast } = useToast();
		const { join } = useLobby();

		const message = (id) => <div>
			<h1>{from} invited you to their lobby</h1>
			<p>{new GameMode(gamemode).getDisplayName()}</p>
			<div>
				<Button
					onClick={() => join(join_secret)}
				>
					<i className="fa-regular fa-sign-in"></i> Join
				</Button>
				<Button onClick={() => removeToast(id)}>
					<i className="fa-solid fa-user-minus"></i> Decline
				</Button>
			</div>
		</div>;

		createToast(message, 'info', 0);
	};

	const ws = useWebSocket({
		eventHandlers: {
			'welcome': onWelcome,
			'status': onStatusChange,
			'follow': onFollow,
			'unfollow': onUnfollow,
			'receive_lobby_invite': onLobbyInvite,
		},
		onClose: () => {
			console.error('Social WS closed');
		},
		onError: (e) => {
			console.error('Social WS error', e);
		}
	});

	const connect = () => {
		ws.connect(`${config.WS_URL}/social/notify?access_token=${localStorage.getItem('access_token')}`);
	};

	const ping = () => {
		ws.send(JSON.stringify({event: 'ping'}));
	};

	const status = (status: FollowStatus) => {
		ws.send(JSON.stringify({event: 'update_status', data: status}));
	};

	return {
		follows,
		connect,
		ping,
		status,
	};
}