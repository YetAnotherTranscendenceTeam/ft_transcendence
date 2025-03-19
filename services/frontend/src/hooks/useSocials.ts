import Babact from "babact";
import { IUser, User } from "./useUsers";
import useWebSocket from "./useWebSocket";
import useFetch from "./useFetch";
import config from "../config";

export enum FollowStatus {
	ONLINE = 'online',
	OFFLINE = 'offline',
	INGAME = 'ingame',
	INACTIVE = 'inactive',
	INLOBBY = 'inlobby',
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

	constructor(follow: IFollow){
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

	const onWelcome = ({ follows }: {follows: IFollow[]}) => {
		setFollows(follows.map(f => new Follow(f)));
	};

	const onStatusChange = ({ account_id, status }: {account_id: number, status: FollowStatus}) => {
		setFollows(follows => follows.map(f => {
			if (f.account_id === account_id)
				return f.setStatus(status);
			return f;
		}));
	};

	const onFollow = (follow: IFollow) => {
		setFollows(follows => follows.concat(new Follow(follow)));
	};

	const onUnfollow = ({ account_id }: {account_id: number}) => {
		setFollows(follows => follows.filter(f => f.account_id !== account_id));
	};

	const ws = useWebSocket({
		eventHandlers: {
			'welcome': onWelcome,
			'status': onStatusChange,
			'follow': onFollow,
			'unfollow': onUnfollow,
		}
	});

	const connect = () => {
		ws.connect(`${config.WS_URL}/social/notify?access_token=${localStorage.getItem('access_token')}`);
	};

	const ping = () => {
		ws.send(JSON.stringify({event: 'ping'}));
	};

	const status = (status: FollowStatus) => {
		ws.send(JSON.stringify({event: 'status', data: status}));
	};

	return {
		follows,
		connect,
		ping,
		status,
	};
}