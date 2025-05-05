import Babact from "babact";
import { GameScene } from "../components/Babylon/types";
import { usePong } from "../contexts/usePong";
import Overlay from "../templates/Overlay";
import useEscape from "../hooks/useEscape";
import { PongState } from "pong";
import GameOverlay from "../components/Game/GameOverlay";

export default function LocalView() {

	const { app, overlay, togglePause, startGame, restartGame } = usePong();

	Babact.useEffect(() => {
		app.setGameScene(GameScene.LOCAL);
	}, []);

	const handleStart = () => {
		startGame();
	}

	const handleRestart = () => {
		restartGame();
	}

	const handlePause = () => {
		togglePause(true);
	}

	const handleResume = () => {
		togglePause(false);
	}

	useEscape(overlay?.gameStatus.name === PongState.PLAYING.name, () => handlePause())


	if (!overlay)
		return;

	return <Overlay
		hidden={overlay.gameStatus.name === PongState.PLAYING.name || overlay.gameStatus.name === PongState.FREEZE.name}
	>
		<GameOverlay
			onStart={handleStart}
			onResume={handleResume}
			onRestart={handleRestart}
		/>
	</Overlay>
}