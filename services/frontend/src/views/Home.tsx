import Babact from "babact"
import { usePong } from "../contexts/usePong"
import { GameScene } from "../components/Babylon/types";
 
export default function Home() {

	const { app } = usePong();

	Babact.useEffect(() => {
		console.log('Home mounted');
		app.setGameScene(GameScene.MENU);
		return () => {
			console.log('Home unmounted');
		}
	}, [])

	return <div key="home">
		<h1>Home</h1>
	</div>
}