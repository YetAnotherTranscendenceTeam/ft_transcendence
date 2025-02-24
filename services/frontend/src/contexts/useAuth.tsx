import Babact from "babact";
import useFetch from "../hooks/useFetch";
import config from "../config";

const AuthContext = Babact.createContext({});

export type Profile = {
	account_id?: number,
	username?: string,
	avatar?: string,
	elo?: number
};

export const AuthProvider = ({ children } : {children?: any}) => {

	const [me, setMe] = Babact.useState(null);

	const { ft_fetch } = useFetch();

	const fetch_me = async () => {
		const response = await ft_fetch(`${config.API_URL}/me`, {});
		console.log('fetch_me', response);
		if (response)
			setMe(response);
		else
			logout();
	};

	const auth = async (token, expire_at) => {
		console.log('auth', token, expire_at);
		localStorage.setItem('access_token', token);
		localStorage.setItem('expire_at', expire_at);
		fetch_me();
	};

	const logout = () => {
		setMe(null);
		localStorage.removeItem('access_token');
		localStorage.removeItem('expire_at');
	};

	Babact.useEffect(() => {
		fetch_me();
	}, []);

	return (
		<AuthContext.Provider
			value={{
				me, auth, logout
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return Babact.useContext(AuthContext);
};