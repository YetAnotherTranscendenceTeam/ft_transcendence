import Babact from "babact";
import { usePong } from "../../contexts/usePong";
import JSConfetti from "js-confetti";
import { useLobby } from "../../contexts/useLobby";
import Button from "../../ui/Button";

export default function WinnerMatchOverlay({
		onRestart,
	}: {
		onRestart?: () => void;
		[key: string]: any
	}) {


	const { overlay } = usePong();
	const { lobby, create } = useLobby();

	Babact.useEffect(() => {
		if (overlay?.gameStatus.name === 'ENDED') {
			const confetti = new JSConfetti();
			confetti.addConfetti({
				confettiNumber: 400,
				confettiRadius: 4,
			});
		}
	}, [overlay])


	const handlePlayAgain = () => {
		if (overlay.local && onRestart) {
			onRestart();
		}
		if (lobby && lobby.state.joinable) {
			lobby.queueStart();
		}
		else {
			create(overlay.gamemode.name);
		}
	}

	if (!overlay)
		return null;
	const winner = overlay.scores[0] > overlay.scores[1] ? 0 : 1;

	return <div className='winner-match-overlay flex flex-col'>
		{overlay.local && <h2>
			<i className="fa-solid fa-trophy"></i>
			{winner === 0 ? 'Left Player wins!' : 'Right Player wins!'}
		</h2>}
		{!overlay.local && <h2>
			<i className="fa-solid fa-trophy"></i>
			{overlay.teams[winner].getDisplayName()} wins!
		</h2>}
		<Button
			onClick={handlePlayAgain}
		>
			<i className="fa-solid fa-arrow-rotate-left"></i>
			Play again
		</Button>
	</div>
}