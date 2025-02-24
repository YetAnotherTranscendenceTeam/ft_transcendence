import Babact from "babact";
import config from "../../config";
import useToast from "../../hooks/useToast";

export default function FortyTwoAuthButton({
		isOpen = false
	}: {
		isOpen: boolean
	}) {

	const { createToast } = useToast();

	const handleMessage = (event) => {
		if (event.origin !== window.location.origin) return;

		const { token, expire_at } = event.data;
		if (token)
			console.log(token, expire_at);
		else {
			createToast('Authentication failed', 'danger', 7000);
		}

	};

	const openPopup = () => {
		window.open(`${config.API_URL}/auth/fortytwo/`, '_blank', "popup; width=600; height=700");
	};

	Babact.useEffect(() => {
		if (isOpen) {
			window.addEventListener('message', handleMessage);
			return () => {
				window.removeEventListener('message', handleMessage);
			}
		}
	}, [isOpen]);

	return <a onClick={openPopup} className='fortytwo-auth-button flex items-center'>
		<img src='/assets/images/fortytwo-logo.png'/>
		<p>Login with 42intra</p>
	</a>
}