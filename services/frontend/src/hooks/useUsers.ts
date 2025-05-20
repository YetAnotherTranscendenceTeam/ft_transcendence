import Babact from "babact"
import useFetch from "./useFetch"
import config from "../config";


export interface IUser {
	account_id: number,
	username: string,
	avatar: string,
}

export class User implements IUser {
	account_id: number;
	username: string;
	avatar: string;
	ft_fetch: any;

	constructor(user: IUser, ft_fetch: any) {
		this.ft_fetch = ft_fetch;
		this.account_id = user.account_id;
		this.username = user.username;
		this.avatar = user.avatar;
	}

	async request() {
		const response = await this.ft_fetch(`${config.API_URL}/social/requests/${this.account_id}`, {
			method: 'POST',
		}, {
			error_messages: {
				409: 'Friend request pending',
				404: 'User not found',
				'MAX_FRIENDS': 'Friends limit reached',
				'IS_BLOCKED': 'User blocked',
				'IS_FRIEND': 'Already friends',
				'SELF_REQUEST': "Can't friend yourself",
			}
		});
		return response;
	}

	async block() {
		const response = await this.ft_fetch(`${config.API_URL}/social/blocks/${this.account_id}`, {
			method: 'POST',
		}, {
			error_messages: {
				404: 'User not found',
				409: 'Already blocked',
				'MAX_BLOCKS': 'Block limit reached',
				'SELF_BLOCK': "Can't block yourself",
			}
		});
		return response;
	}
}

export default function useUsers(): {
		users: User[],
		search: (username: string, limit?: number, account_id_not?: number[]) => void,
		isLoading: boolean,
	} {
	const [users, setUsers] = Babact.useState<User[]>([])
	const [isLoading, setIsLoading] = Babact.useState(false);

	const { ft_fetch } = useFetch();

	const search = async (username: string = '', limit: number = 20, account_id_not: number[] = []) => {
		setIsLoading(true);
		const response = await ft_fetch(`${config.API_URL}/users?filter[username:match]=${username}&limit=${limit}&filter[account_id:not]=${account_id_not.join(',')}`);
		if (response) {
			setUsers(response.map((u: IUser) => new User(u, ft_fetch)));
		}
		setIsLoading(false);
	}

	return {
		users,
		search,
		isLoading,
	}

}