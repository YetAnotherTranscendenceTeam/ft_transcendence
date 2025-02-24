import Babact from "babact";

const AuthContext = Babact.createContext({});

export type Profile = {
	account_id?: number,
	username?: string,
	avatar?: string,
	elo?: number
};

export const AuthProvider = ({ children } : {children?: any}) => {

	const [me, setMe] = Babact.useState(null);

	const fetch_me = async () => {
		if (localStorage.getItem('access_token'))
			setMe({
				account_id: 1,
				username: 'test',
				avatar: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
				elo: 600
			});
	};

	const auth = async (token, expire_at) => {
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