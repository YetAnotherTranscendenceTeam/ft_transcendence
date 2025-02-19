import Babact from "babact"
import FortyTwoAuthButton from "./FortyTwoAuthButton";
import GoogleAuthButton from "./GoogleAuthButton";

export default function RemoteAuthButtons() {

	const handleFortytwo = (event) => {
		if (event.origin !== window.location.origin) return;

		if (event.data.token) {
			console.log(event.data.token);
		}
	};

	Babact.useEffect(() => {
		(window as any).handleCredentialResponse = (response: any) => {
			console.log(response.credential);
		};
		window.addEventListener('message', handleFortytwo);
		return () => {
			window.removeEventListener('message', handleFortytwo);
		}
	}, []);
	
	return <div className="flex flex-col gap-4">
		<GoogleAuthButton />
		<FortyTwoAuthButton />
	</div>
}