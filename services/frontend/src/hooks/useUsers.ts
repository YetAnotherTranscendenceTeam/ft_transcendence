import Babact from "babact"
import useFetch from "./useFetch"
import config from "../config";
import { useAuth } from "../contexts/useAuth";


export interface IUser {
	account_id: number,
	username: string,
	avatar: string,
}

export default function useUsers(): {
		users: IUser[],
		fetchUsersMatched: (username: string, limit?: number) => void,
		isLoading: boolean,
		followUser: (user: IUser) => void
	} {
	const [users, setUsers] = Babact.useState<IUser[]>([])

	const { follows, me } = useAuth();

	const { ft_fetch, isLoading } = useFetch();

	const fetchUsersMatched = async (username: string = '', limit: number = 20) => {
		const response = await ft_fetch(`${config.API_URL}/users?filter[username:match]=${username}&limit=${limit}&filter[account_id:not]=${follows.map(f => f.account_id).join(',')},${me.account_id}`);
		if (response) {
			setUsers(response);
		}
	}

	const followUser = async (user: IUser) => {
		const res = await ft_fetch(`${config.API_URL}/social/follows/${user.account_id}`, {
			method: 'POST',
		}, {
			success_message: `You are now following ${user.username}`,
			show_error: true,
			error_messages: {
				409: `You are already following ${user.username}`,
				403: `You can't follow yourself`
			}
		});

		if (res)
			setUsers(users.filter(u => u.account_id !== user.account_id));
	}

	Babact.useEffect(() => {
		console.log(follows, me);
		if (follows && me)
			fetchUsersMatched();
	}, [me, follows])

	return {
		users,
		fetchUsersMatched,
		isLoading,
		followUser
	}

}