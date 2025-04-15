import Babact from "babact";
import { GameScene } from "../components/Babylon/types";
import { usePong } from "../contexts/usePong";
import Scores from "../components/Game/Scores";
import LocalStartModal from "../components/Game/LocalStartModal";
import Overlay from "../templates/Overlay";

export default function LocalView() {

	const { app, scores } = usePong();
	const [startTime, setStartTime] = Babact.useState<Date>(null);

	Babact.useEffect(() => {
		app.setGameScene(GameScene.LOCAL);
	}, []);

	const handleStart = () => {
		app.startGame();
		setStartTime(new Date());
	}


	return <Overlay>
		<div className='local-view flex flex-col gap-2 items-center'>
			{startTime && <Scores scores={scores} startTime={startTime}/>}
			<LocalStartModal
				isOpen={!startTime}
				onStart={() => handleStart()}
			/>
		</div>
	</Overlay>
}