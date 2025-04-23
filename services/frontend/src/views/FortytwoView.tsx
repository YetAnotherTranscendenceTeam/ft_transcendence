import Babact from "babact";
import TwoFAConfirmationModal from "../components/Auth/TwoFAConfirmationModal";
import useFetch from "../hooks/useFetch";
import config from "../config";
import { useAuth } from "../contexts/useAuth";

export default function FortytwoView() {
	const urlParams = new URLSearchParams(window.location.search);
	const token = urlParams.get('token');
	const expire_at = urlParams.get('expire_at');
	const statusCode = urlParams.get('statusCode');
	const payload = urlParams.get('payload_token');

	const { confirm2FA } = useAuth();

	if (statusCode === '202') {

		return <TwoFAConfirmationModal
			title="2FA Verification"
			isOpen={true}
			onClose={() => window.close()}
			onConfirm={async (otp) =>
				confirm2FA({
					payload_token: payload,
					otp,
					otp_method: 'app',
				},
				() => window.close(),
				(access_token, expire_at) => {
					window.opener.postMessage({ token: access_token, expire_at }, window.location.origin);
					window.close();
				},
				false
			)}
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