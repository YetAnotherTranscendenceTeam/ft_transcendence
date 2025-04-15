import Babact from "babact";
import { GameScene } from "../components/Babylon/types";
import { usePong } from "../contexts/usePong";
import Scores from "../components/Game/Scores";
import LocalStartModal from "../components/Game/LocalStartModal";
import Overlay from "../templates/Overlay";
import NextRoundModal from "../components/Game/NextRoundModal";

export default function LocalView() {

	const { app, scores } = usePong();
	const [startTime, setStartTime] = Babact.useState<Date>(null);
	const [freeze, setFreeze] = Babact.useState<boolean>(false);

	Babact.useEffect(() => {
		app.setGameScene(GameScene.LOCAL);
	}, []);

	const handleStart = () => {
		app.startGame();
		setStartTime(new Date());
	}

	Babact.useEffect(() => {
		if (scores[0] > 0 || scores[1] > 0) {
			setFreeze(true);
		}
	}, [scores[0], scores[1]]);


	const getModal = () => {
		if (freeze)
			return <NextRoundModal
				onNextRound={() => {
					setFreeze(false);
					app.nextRound();
				}}
			/>
		if (!startTime)
			return <LocalStartModal
				onStart={() => handleStart()}
			/>
		else
			return null;
	}


	return <Overlay
		modal={getModal()}
	>
		<div className='local-view flex flex-col gap-2 items-center'>
			{startTime && <Scores scores={scores} startTime={startTime}/>}
		</div>
	</Overlay>
}