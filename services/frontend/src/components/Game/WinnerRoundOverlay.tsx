import Babact from "babact";
import { usePong } from "../../contexts/usePong";
import Avatar from "../../ui/Avatar";

export default function WinnerRoundOverlay({}: {}) {

	const { overlay } = usePong();

	if (!overlay)
		return;

	return <div className={`winner-round-overlay flex flex-col gap-2 justify-center items-center`}>
		{overlay.lastWinner !== null && overlay.local &&
			<p>{overlay.lastWinner === 0 ? 'Left player' : 'Right player'} has won the last round! </p>
		}
		{overlay.lastWinner !== null && !overlay.local &&
			<p>
				{overlay.teams[overlay.lastWinner].getDisplayName()} has won the last round!
			</p>
		}
		<p>Get ready for the next round!</p>
	</div>
}