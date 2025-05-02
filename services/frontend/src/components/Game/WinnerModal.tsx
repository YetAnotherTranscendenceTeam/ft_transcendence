import Babact from "babact";
import { usePong } from "../../contexts/usePong";
import Button from "../../ui/Button";
import Timer from "./Timer";
import JSConfetti from "js-confetti";

export default function WinnerModal({
		onClick,
		onPlayAgain,
	}: {
		onClick: () => void;
		onPlayAgain: () => void;
	}) {

	// const { scores } = usePong();

	// const [playAgainTimeout, setPlayAgainTimeout] = Babact.useState<boolean>(false);

	// const winner = scores[0] > scores[1] ? 'left' : 'right';

	// Babact.useEffect(() => {
	// 	const confetti = new JSConfetti();
	// 	confetti.addConfetti({
	// 		confettiNumber: 400,
	// 		confettiRadius: 4,
	// 	});

	// }, [])


	// return <div className="flex flex-col gap-4 items-center justify-center w-full h-full">
	// 	<div className="winner-modal flex flex-col gap-2 items-center">
	// 		<div className={`winner ${winner}`}>
	// 			{winner === 'left' ? 'Left Player Wins!' : 'Right Player Wins!'}
	// 		</div>
	// 	</div>
	// 	{playAgainTimeout ? 
	// 		<Timer
	// 			timer={5}
	// 			onTimeout={() => {
	// 				onPlayAgain();
	// 			}}
	// 		/>
	// 		: <Button
	// 			className="primary"
	// 			onClick={() => {
	// 				setPlayAgainTimeout(true);
	// 				onClick();
	// 			}}
	// 		>
	// 			<i className="fa-solid fa-rotate-right"></i> Play Again
	// 		</Button>
	// 	}
	// </div>
}