import Babact from "babact";
import useFetch from "../hooks/useFetch";
import config from "../config";
import { IUser } from "../hooks/useUsers";
import useFollows, { Follow, FollowStatus, IFollow } from "../hooks/useFollows";

const AuthContext = Babact.createContext({});

interface ICredentials {
	account_id: number,
	email: string,
}

export interface IMe extends IUser {
	credentials: ICredentials,
}

export const AuthProvider = ({ children } : {children?: any}) => {

	const [me, setMe] = Babact.useState<IMe>(null);

	const { ft_fetch } = useFetch();

	const fetchMe = async () => {
		if (!localStorage.getItem('access_token'))
			return;
		const response = await ft_fetch(`${config.API_URL}/me`, {});
		if (response)
			setMe(response);
		else{
			console.log('logout');
			logout();
		}
	};

	const auth = async (token, expire_at) => {
		localStorage.setItem('access_token', token);
		localStorage.setItem('expire_at', expire_at);
		fetchMe();
	};

	const logout = async () => {
		setMe(null);
		localStorage.removeItem('access_token');
		localStorage.removeItem('expire_at');
		await ft_fetch(`${config.API_URL}/token/revoke`, {
			method: "POST",
			credentials: "include",
		})
	};

	const refresh = () => {
		fetchMe();
	};

	Babact.useEffect(() => {
		fetchMe();
	}, []);

	const {follows, connect, ping, status} = useFollows();

	Babact.useEffect(() => {
		if (me)
			connect();
	}, [me]);

	return (
		<AuthContext.Provider
			value={{
				me, auth, logout, refresh, follows
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = (): {
		me: IMe,
		auth: (token: string, expire_at: number) => void,
		logout: () => void,
		refresh: () => void,
		ping: () => void,
		status: (status: FollowStatus) => void,
		follows: Follow[],
	} => {
	return Babact.useContext(AuthContext);
};