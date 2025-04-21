import Babact from "babact";
import TwoFAConfirmationModal from "../components/Auth/TwoFAConfirmationModal";
import useFetch from "../hooks/useFetch";
import config from "../config";

export default function FortytwoView() {
	const urlParams = new URLSearchParams(window.location.search);
	const token = urlParams.get('token');
	const expire_at = urlParams.get('expire_at');
	const statusCode = urlParams.get('statusCode');
	const payload = urlParams.get('payload_token');

	const { ft_fetch } = useFetch();

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
					window.close();
			}
		});

		if (response) {
			const { access_token, expire_at } = response;
			window.opener.postMessage({ token: access_token, expire_at }, window.location.origin);
			window.close();
		}
		return response;
	}

	if (statusCode === '202') {

		return <TwoFAConfirmationModal
			title="2FA Verification"
			isOpen={true}
			onClose={() => window.close()}
			onConfirm={async (otp) => handle2FA(otp, 'app')}
		/>
	}

	if (token && expire_at) {
		window.opener.postMessage({ token, expire_at }, window.location.origin);
	}
	else {
		window.opener.postMessage({ statusCode }, window.location.origin);
	}
	window.close();
	return null;
}