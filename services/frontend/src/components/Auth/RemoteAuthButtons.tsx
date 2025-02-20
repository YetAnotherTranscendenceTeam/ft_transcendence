import Babact from "babact"
import FortyTwoAuthButton from "./FortyTwoAuthButton";
import GoogleAuthButton from "./GoogleAuthButton";

export default function RemoteAuthButtons({isOpen}) {
	return <div className="flex flex-col gap-4">
		<GoogleAuthButton />
		<FortyTwoAuthButton  isOpen={isOpen}/>
	</div>
}