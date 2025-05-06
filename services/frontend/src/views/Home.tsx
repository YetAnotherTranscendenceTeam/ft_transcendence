import Babact from "babact"
import Overlay from "../templates/Overlay"
import { usePong } from "../contexts/usePong"
import { GameScene } from "../components/Babylon/types";
 
export default function Home() {

	const { app } = usePong();

	Babact.useEffect(() => {
		app.setGameScene(GameScene.MENU);
	}, [])

	return <div>
		<h1>Home</h1>
	</div>
}