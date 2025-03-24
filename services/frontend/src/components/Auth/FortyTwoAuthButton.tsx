import Babact from "babact";
import config from "../../config";
import useToast from "../../hooks/useToast";
import { useAuth } from "../../contexts/useAuth";

export default function FortyTwoAuthButton({
		isOpen = false
	}: {
		isOpen: boolean
	}) {

	const { createToast } = useToast();
	const { auth } = useAuth();

	const handleMessage = (event) => {
		if (event.origin !== window.location.origin) return;
		const { token, expire_at, statusCode } = event.data;
		if (token)
			auth(token, expire_at);
		else if (statusCode == 401) {
			createToast('Authentication failed', 'danger', 7000);
		}
		else if (statusCode == 502) {
			createToast('42Intra is unavailable right now', 'danger', 7000);
		}
	};

	const openPopup = () => {
		window.open(`${config.API_URL}/auth/fortytwo/`, '_blank', "popup; width=600; height=700");
	};

	Babact.useEffect(() => {
		if (isOpen) {
			window.addEventListener('message', handleMessage);
		}
		return () => {
			window.removeEventListener('message', handleMessage);
		}
	}, [isOpen]);

	return <a onClick={openPopup} className='fortytwo-auth-button flex items-center'>
		<img src='/assets/images/fortytwo-logo.png'/>
		<p>Sign in with 42Intra</p>
	</a>
}