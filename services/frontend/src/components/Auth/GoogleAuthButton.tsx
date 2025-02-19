import Babact from "babact";

export default function GoogleAuthButton() {

	const handleCredential = (response: any) => {
		console.log(response.credential);
	};

	Babact.useEffect(() => {
		(window as any).handleCredential = handleCredential;
	}, []);

	return <div className='w-full'>
		<script src="https://accounts.google.com/gsi/client" async></script>
		<div id="g_id_onload"
			data-client_id="9744497548-ecens5hjhfugrc0l4a3nl9bqc3qr08dh.apps.googleusercontent.com"
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
			data-width="300"
			>
		</div>
	</div>
}