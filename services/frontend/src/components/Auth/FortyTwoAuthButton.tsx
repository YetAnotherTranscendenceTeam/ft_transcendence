import Babact from "babact";
import config from "../../config";

export default function FortyTwoAuthButton({
		isOpen = false
	}: {
		isOpen: boolean
	}) {

	const handleMessage = (event) => {
		if (event.origin !== window.location.origin) return;

		if (event.data.token) {
			console.log(event.data.token);
		}
	};

	const openPopup = () => {
		window.open(`${config.API_URL}/auth/fortytwo/`, '_blank', "popup; width=600; height=600");
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