import Babact from "babact";
import { GameScene } from "../components/Babylon/types";
import { usePong } from "../contexts/usePong";
import Scores from "../components/Game/Scores";

export default function LocalView() {

	const { app, scores } = usePong();
	const startTime = Babact.useRef<Date>(new Date());

	Babact.useEffect(() => {
		//app.startScene(GameScene.LOCAL)
	}, []);

  return <div className='local-view flex flex-col gap-2 items-center'>
	<Scores scores={scores} startTime={startTime.current}/>
  </div>
}