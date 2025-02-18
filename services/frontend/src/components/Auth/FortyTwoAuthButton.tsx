import Babact from "babact";

export default function FortyTwoAuthButton() {

	const handleMessage = (event) => {
		if (event.origin !== window.location.origin) return;

		if (event.data.token) {
			console.log(event.data.token);
		}
	};

	const openPopup = () => {
		window.open('https://z1r3p1:7979/api/auth/fortytwo/', '_blank', "popup; width=600; height=600");
	};

	Babact.useEffect(() => {
		window.addEventListener('message', handleMessage);
		return () => {
			window.removeEventListener('message', handleMessage);
		}
	}, []);

	return <a onClick={openPopup} className='fortytwo-auth-button flex items-center'>
		<img src='/assets/images/fortytwo-logo.png'/>
		<p>Login with 42intra</p>
	</a>
}