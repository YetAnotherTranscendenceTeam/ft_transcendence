import Babact from "babact";
import useFetch from "../../hooks/useFetch";
import config from "../../config";
import { useAuth } from "../../contexts/useAuth";
import TwoFAConfirmationModal from "./TwoFAConfirmationModal";

export default function GoogleAuthButton() {

	const { ft_fetch } = useFetch();
	const { auth } = useAuth();
	const [payload, setPayload] = Babact.useState<string>(null);

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
		if (res && res.statusCode === 202 && res.code === '2FA_VERIFICATION') {
			setPayload(res.payload_token);
		}
		else if (res)
			auth(res.access_token, res.expire_at);
	};

	const handle2FA = async (otp: string, method: string) => {
		const response = await ft_fetch(`${config.API_URL}/auth/2fa`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				payload_token: payload,
				otp,
				otp_method: method,
			})
		}, {
			show_error: true,
			error_messages: {
				403: 'Invalid Code'
			},
			on_error: (res) => {
				if (res.status !== 403)
					setPayload(null);
			}
		});
		if (response) {
			const { access_token, expire_at } = response;
			setPayload(null);
			auth(access_token, expire_at);
		}
		return response;
	}

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
		<TwoFAConfirmationModal
			title="2FA Verification"
			isOpen={!!payload}
			onClose={() => setPayload(null)}
			onConfirm={async (otp) => handle2FA(otp, 'app')}
		/>
	</div>
}