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

	constructor(user: IUser){
		this.account_id = user.account_id;
		this.username = user.username;
		this.avatar = user.avatar;
	}

	async follow() {
		const { ft_fetch } = useFetch();
		await ft_fetch(`${config.API_URL}/social/follows/${this.account_id}`, {
			method: 'POST',
		}, {
			success_message: `You are now following ${this.username}`,
			show_error: true,
			error_messages: {
				"MAX_FOLLOWS": `You can't follow more users`,
				"SELF_FOLLOW": `You can't follow yourself`,
				409: `You are already following ${this.username}`,
			}
		});
	}
}

export default function useUsers(): {
		users: User[],
		search: (username: string, limit?: number, account_id_not?: number[]) => void,
		isLoading: boolean,
	} {
	const [users, setUsers] = Babact.useState<User[]>([])

	const { ft_fetch, isLoading } = useFetch();

	const search = async (username: string = '', limit: number = 20, account_id_not: number[] = []) => {
		const response = await ft_fetch(`${config.API_URL}/users?filter[username:match]=${username}&limit=${limit}&filter[account_id:not]=${account_id_not.join(',')}`);
		if (response) {
			setUsers(response.map((u: IUser) => new User(u)));
		}
	}

	return {
		users,
		search,
		isLoading,
	}

}