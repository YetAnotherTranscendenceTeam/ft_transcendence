import Babact from "babact";
import { User } from "./useUsers";
import useFetch from "./useFetch";
import config from "../config";


export default function useUser(account_id: number): {
		user: User,
		loading: boolean,
} {

	const [user, setUser] = Babact.useState<User>(null);

	const { ft_fetch, isLoading } = useFetch();

	const fetchUser = async () => {
		const response = await ft_fetch(`${config.API_URL}/users/${account_id}`);
		if (response) {
			setUser(new User(response, ft_fetch));
		}
	}

	Babact.useEffect(() => {
		fetchUser();
	}, [account_id]);

	return {
		user,
		loading: isLoading,
	}


}