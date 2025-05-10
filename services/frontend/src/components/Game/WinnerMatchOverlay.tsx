import Babact from "babact";
import { usePong } from "../../contexts/usePong";
import PlayAgainButton from "./PlayAgainButton";
import { useUi } from "../../contexts/useUi";

export default function WinnerMatchOverlay() {


	const { overlay } = usePong();
	const { confetti } = useUi();

	Babact.useEffect(() => {
		confetti.addConfetti({
			confettiNumber: 400,
			confettiRadius: 4,
		});
	}, [])


	if (!overlay)
		return null;
	const winner = overlay.scores[0] > overlay.scores[1] ? 0 : 1;

	return <div className='winner-match-overlay flex flex-col gap-4 justify-center items-center'>
		<h2>
			<i className="fa-solid fa-solid fa-crown"></i>
			{overlay.local && (winner === 0 ? 'Left Player wins!' : 'Right Player wins!')}
			{!overlay.local && `${overlay.teams[winner].getDisplayName()} wins!`}
		</h2>
		<PlayAgainButton />
	</div>
}