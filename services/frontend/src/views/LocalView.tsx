import Babact from "babact";
import { GameScene } from "../components/Babylon/types";
import { usePong } from "../contexts/usePong";
import useEscape from "../hooks/useEscape";
import { PongState } from "pong";
import GameOverlay from "../components/Game/GameOverlay";
import { useOverlay } from "../contexts/useOverlay";

export default function LocalView() {

	const { app, overlay, togglePause, startGame, restartGame } = usePong();
	const { setIsForcedOpen } = useOverlay();

	Babact.useEffect(() => {
		setIsForcedOpen(false);
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

	return <div>
		<GameOverlay
			onStart={handleStart}
			onResume={handleResume}
			onRestart={handleRestart}
		/>
	</div>
}