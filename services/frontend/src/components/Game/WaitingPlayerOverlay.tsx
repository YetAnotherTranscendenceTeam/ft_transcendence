import Babact from "babact";
import Spinner from "../../ui/Spinner";

export default function WaitingPlayerOverlay() {

	return <div className="flex gap-4 items-center justify-center">
		<Spinner />
		<p>Waiting for other players...</p>
	</div>

}