import Babact from "babact";
import { usePong } from "../../contexts/usePong";

export default function WinnerRoundOverlay({}: {}) {

	const { overlay } = usePong();

	if (!overlay)
		return;

	return <div className={`winner-round-overlay flex flex-col gap-2 justify-center items-center`}>
		<p>Next round in</p>
	</div>
}