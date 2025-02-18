import Babact from "babact";
import RemoteAuthButtons from "./RemoteAuthButtons";

export default function LoginForm({isOpened}) {

	return <div className={`login-form ${isOpened ? 'open' : ''}`}>
		<RemoteAuthButtons/>
	</div>	
}