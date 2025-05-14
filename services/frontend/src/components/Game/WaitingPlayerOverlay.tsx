import Babact from "babact";
import Spinner from "../../ui/Spinner";
import { usePong } from "../../contexts/usePong";

export default function WaitingPlayerOverlay() {

	const { overlay } = usePong();

	if (!overlay)
		return;
	return <div className="flex flex-col gap-4 items-center justify-center">
		<div className="flex gap-2 items-center justify-center">
			<Spinner />
			{
				window.location.pathname.startsWith('/spectate/') ?
				<p>Waiting for game to start...</p>:
				<p>Waiting for other players...</p>
			}
		</div>
		{overlay.countDown > 0 && <p className="auto-start">Automatic start in {Math.floor(overlay.countDown)}s</p>}
	</div>

}