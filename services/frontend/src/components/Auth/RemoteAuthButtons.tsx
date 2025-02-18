import Babact from "babact"
import Button from "../../ui/Button";

export default function RemoteAuthButtons() {

	const handleFortytwo = (event) => {
		if (event.origin !== window.location.origin) return;

		if (event.data.token) {
			console.log(event.data.token);
		}
	};

	Babact.useEffect(() => {
		// Define the function globally
		(window as any).handleCredentialResponse = (response: any) => {
			console.log(response.credential);
		};
		window.addEventListener('message', handleFortytwo);
		return () => {
			window.removeEventListener('message', handleFortytwo);
		}
	}, []);
	
	return <div>
		<div className="w-full">
			<script src="https://accounts.google.com/gsi/client" async></script>
			<div id="g_id_onload"
				data-client_id="9744497548-ecens5hjhfugrc0l4a3nl9bqc3qr08dh.apps.googleusercontent.com"
				data-callback="handleCredentialResponse"
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
				>
			</div>
		</div>
		<Button onClick={() => {
			window.open('https://z1r3p1:7979/api/auth/fortytwo/', '_blank', "popup; width=600; height=600");
		}}>
			Login with 42intra
		</Button>
	</div>
}