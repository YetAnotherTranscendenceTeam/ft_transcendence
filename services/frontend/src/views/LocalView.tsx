import Babact from "babact";
import { GameScene } from "../components/Babylon/types";
import { usePong } from "../contexts/usePong";
import Scores from "../components/Game/Scores";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Key from "../ui/Key";
import LocalStartModal from "../components/Game/LocalStartModal";
import Overlay from "../templates/Overlay";

export default function LocalView() {

	const { app, scores } = usePong();
	const [startTime, setStartTime] = Babact.useState<Date>(null);

	Babact.useEffect(() => {
		//app.startScene(GameScene.LOCAL)
	}, []);

  return <Overlay>
	<div className='local-view flex flex-col gap-2 items-center'>
		{startTime && <Scores scores={scores} startTime={startTime}/>}
		<LocalStartModal
			isOpen={!startTime}
			onStart={() => setStartTime(new Date())}
		/>
	</div>
</Overlay>
}