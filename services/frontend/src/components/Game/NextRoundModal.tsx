import Babact from "babact";
import Timer from "./Timer";
import { usePong } from "../../contexts/usePong";

export default function NextRoundModal({
		onNextRound,
	}: {
		onNextRound: () => void,
		[key: string]: any
	}) {
	
	const { lastWinner } = usePong();

	return <div className={`next-round-modal flex flex-col gap-2 justify-center items-center`}>

		{ lastWinner !== null && 
			<h2>{lastWinner === 0 ? 'Left player' : 'Right player'} has won the last round! </h2>
		}
		<h2>Get ready for the next round!</h2>
		<Timer timer={3} onTimeout={() => onNextRound()}/>
	</div>
}