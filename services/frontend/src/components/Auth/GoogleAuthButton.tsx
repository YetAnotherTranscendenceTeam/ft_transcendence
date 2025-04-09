import Babact from "babact";
import useFetch from "../../hooks/useFetch";
import config from "../../config";
import { useAuth } from "../../contexts/useAuth";

export default function GoogleAuthButton() {

	const { ft_fetch } = useFetch();
	const { auth } = useAuth();

	const handleCredential = async (response: any) => {
		const res = await ft_fetch(`${config.API_URL}/auth/google`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ token: response.credential })
		}, {
			show_error: true,
		})
		if (res)
			auth(res.access_token, res.expire_at);
	};

	Babact.useEffect(() => {
		(window as any).handleCredential = handleCredential;
	}, []);

	return <div className='w-full'>
		<script src="https://accounts.google.com/gsi/client" async></script>
		<div id="g_id_onload"
			data-client_id={config.GOOGLE_CLIENT_ID}
			data-callback="handleCredential"
			data-auto_prompt="false"
			>
		</div>
		<div
			className="g_id_signin"
			data-type="standard"
			data-size="large"
			data-theme="outline"
			data-text="sign_in_with"
			data-shape="rectangular"
			data-logo_alignment="left"
			data-locale="en"
			data-width="336"
			>
		</div>
	</div>
}