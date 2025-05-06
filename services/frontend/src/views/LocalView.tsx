import Babact from "babact";
import { GameScene } from "../components/Babylon/types";
import { usePong } from "../contexts/usePong";
import Overlay from "../templates/Overlay";
import useEscape from "../hooks/useEscape";
import { PongState } from "pong";
import GameOverlay from "../components/Game/GameOverlay";

export default function LocalView() {

	const { app, overlay, togglePause, startGame } = usePong();

	Babact.useEffect(() => {
		app.setGameScene(GameScene.LOCAL);
	}, []);

	const handleStart = () => {
		startGame();
	}

	const handlePause = () => {
		togglePause(true);
	}

	const handleResume = () => {
		togglePause(false);
	}

	useEscape(overlay?.gameStatus.name === PongState.PLAYING.name, () => handlePause())

	Babact.useEffect(() => {
		console.log('local view mounted');
		return () => {
			console.log('local view unmounted');
		}
	}, []);

	if (!overlay)
		return;

	return <div>
		<GameOverlay
			onStart={handleStart}
			onResume={handleResume}
		/>
	</div>
}