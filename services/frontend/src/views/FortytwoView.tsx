
export default function FortytwoView() {
	const urlParams = new URLSearchParams(window.location.search);
	const token = urlParams.get('token');
	const expire_at = urlParams.get('expire_at');
	const statusCode = urlParams.get('statusCode');

	if (token && expire_at) {
		window.opener.postMessage({ token, expire_at }, window.location.origin);
	}
	else {
		window.opener.postMessage({ statusCode }, window.location.origin);
	}
	window.close();
	return null;
}