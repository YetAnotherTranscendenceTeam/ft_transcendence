import Babact from "babact";
import useFetch from "../hooks/useFetch";
import config from "../config";
import { IUser } from "../hooks/useUsers";
import useSocial, { Friend, FriendStatus, ISocials } from "../hooks/useSocials";
import { GameModeType } from "yatt-lobbies";

const AuthContext = Babact.createContext<{
		me: IMe,
		socials: ISocials,
		connected: boolean,
		auth: (token: string, expire_at: number) => void,
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
		) => Promise<Response | null>,
		setLastTournament: (tournament: {
			tournament_id: number,
			gamemode: GameModeType,
			active: number,
		}) => void,
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
			on_error: (res) => {
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

	const setLastTournament = async (tournament: {
			tournament_id: number,
			gamemode: string,
			active: number,
	}) => {
		if (!me)
			return;
		setMe(me => ({...me, last_tournament: tournament}));
	}

	const { connect, socials, ping, status, connected, disconnect } = useSocial(setMeStatus, getMe);

	return (
		<AuthContext.Provider
			value={{
				me,
				socials,
				connected,
				auth,
				logout,
				refresh,
				ping,
				status,
				confirm2FA,
				setLastTournament,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return Babact.useContext(AuthContext);
};