import Babact from "babact";
import useFetch from "../hooks/useFetch";
import config from "../config";
import { IUser } from "../hooks/useUsers";
import useSocial, { FriendStatus, ISocials } from "../hooks/useSocials";
import { useNavigate } from "babact-router-dom";
import { APIClearToken, APISetToken } from "../hooks/useAPI";

const AuthContext = Babact.createContext<{
		me: IMe,
		socials: ISocials,
		connected: boolean,
		socialConnect: () => void,
		auth: (token: string, expire_at: string) => void,
		logout: () => void,
		refresh: () => void,
		ping: () => void,
		status: (status: FriendStatus) => void,
		confirm2FA: (
			body: {
				payload_token: string,
				otp: string,
				otp_method: string,
			},
			onError: () => void,
			onSuccess: (access_token: string, expire_at: string) => void,
			login?: boolean,
		) => Promise<any>,
	}>();

export enum AuthMethod {
	password_auth = 'password_auth',
	google_auth = 'google_auth',
	fortytwo_auth = 'fortytwo_auth',
}

export enum SecondFactor {
	none = 'none',
	app = 'app',
}

interface ICredentials {
	account_id: number,
	email: string,
	auth_method: AuthMethod,
	otp_methods: string[],
}


export interface IMe extends IUser {
	credentials: ICredentials,
	status: FriendStatus,
	last_tournament?: {
		tournament_id: number,
		gamemode: string,
		active: number,
	},
	last_match?: {
		match_id: number,
		tournament_id: number,
		gamemode: string,
		state: number,
	},
}

export const AuthProvider = ({ children } : {children?: any}) => {

	const [me, setMe] = Babact.useState<IMe>(null);
	const meRef = Babact.useRef(null);

	const { ft_fetch } = useFetch();
	const navigate = useNavigate();

	const fetchMe = async () => {
		if (!localStorage.getItem('access_token'))
			return;
		const response = await ft_fetch(`${config.API_URL}/me`);
		if (response) {
			setMe({...response, status: me?.status ?? null});
			if (response.last_match && response.last_match.state < 2 && window.location.pathname !== `/matches/${response.last_match.match_id}`) {
				navigate(`/matches/${response.last_match.match_id}`);
			}
		}
		else{
			logout();
		}
	};

	const auth = async (token: string, expire_at: string) => {
		await APISetToken(token, expire_at);
		fetchMe();
	};

	const logout = async () => {
		await APIClearToken();
		await ft_fetch(`${config.API_URL}/token/revoke`, {
			method: "POST",
			credentials: "include",
		})
		setMe(null);
		if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/local'))
			navigate('/');
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

	Babact.useEffect(() => {
		if (me)
			connect();
	}, [me?.account_id]);

	const setMeStatus = (status: FriendStatus) => {
		setMe(me => ({...me, status}));
	};

	const getMe = () => {
		return meRef.current;
	};

	const confirm2FA = async (
		body : {
			payload_token: string,
			otp: string,
			otp_method: string,
		},
		onError: () => void,
		onSuccess: (access_token: string, expire_at: string) => void,
		login: boolean = true,
	) => {
		const response = await ft_fetch(`${config.API_URL}/auth/2fa`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		}, {
			show_error: true,
			onError: (res) => {
				if (res.status !== 403)
					onError();
			},
			error_messages: {
				403: 'Invalid code',
			}
		})

		if (response) {
			const { access_token, expire_at } = response;
			if (login)
				auth(access_token, expire_at);
			onSuccess(access_token, expire_at);
		}
		return response;
	}

	const { connect, socials, ping, status, connected, disconnect } = useSocial(setMeStatus, getMe);

	return (
		<AuthContext.Provider
			value={{
				me,
				socials,
				connected,
				socialConnect: connect,
				auth,
				logout,
				refresh,
				ping,
				status,
				confirm2FA
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return Babact.useContext(AuthContext);
};