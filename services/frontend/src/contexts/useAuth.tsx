import Babact from "babact";
import useFetch from "../hooks/useFetch";
import config from "../config";
import { IUser } from "../hooks/useUsers";
import useSocial, { Follow, FollowStatus } from "../hooks/useSocials";

const AuthContext = Babact.createContext<{
		me: IMe,
		follows: Follow[],
		connected: boolean,
		auth: (token: string, expire_at: number) => void,
		logout: () => void,
		refresh: () => void,
		ping: () => void,
		status: (status: FollowStatus) => void,
	}>();

export enum AuthMethod {
	password_auth = 'password_auth',
	google_auth = 'google_auth',
	fortytwo_auth = 'fortytwo_auth',
}

export enum SecondFactor {
	none = 'none',
	totp = 'totp',
}

interface ICredentials {
	account_id: number,
	email: string,
	auth_method: AuthMethod,
	second_factor: string,
}

export interface IMe extends IUser {
	credentials: ICredentials,
	status: FollowStatus,
}

export const AuthProvider = ({ children } : {children?: any}) => {

	const [me, setMe] = Babact.useState<IMe>(null);
	const meRef = Babact.useRef(null);

	const { ft_fetch } = useFetch();

	const fetchMe = async () => {
		if (!localStorage.getItem('access_token'))
			return;
		const response = await ft_fetch(`${config.API_URL}/me`, {});
		if (response){
			setMe({...response, status: null});
			connect();
		}
		else{
			logout();
		}
	};

	const auth = async (token, expire_at) => {
		localStorage.setItem('access_token', token);
		localStorage.setItem('expire_at', expire_at);
		fetchMe();
	};

	const logout = async () => {
		await ft_fetch(`${config.API_URL}/token/revoke`, {
			method: "POST",
			credentials: "include",
		}, {
			disable_bearer: true,
		})
		setMe(null);
		localStorage.removeItem('access_token');
		localStorage.removeItem('expire_at');
	};

	const refresh = () => {
		fetchMe();
	};

	Babact.useEffect(() => {
		fetchMe();
	}, []);

	Babact.useEffect(() => {
		meRef.current = me;
		if (!me && connected)
			disconnect();
	}, [me]);

	const setMeStatus = (status: FollowStatus) => {
		setMe(me => ({...me, status}));
	};

	const getMe = () => {
		return meRef.current;
	};

	const { connect, follows, ping, status, connected, disconnect } = useSocial(setMeStatus, getMe);

	return (
		<AuthContext.Provider
			value={{
				me,
				follows,
				connected,
				auth,
				logout,
				refresh,
				ping,
				status,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return Babact.useContext(AuthContext);
};