import Babact from "babact";
import { GameScene } from "../components/Babylon/types";
import { usePong } from "../contexts/usePong";
import Overlay from "../templates/Overlay";
import useEscape from "../hooks/useEscape";
import { IPongState, PongState } from "pong";
import GameOverlay from "../components/Game/GameOverlay";

export default function LocalView() {

	const { app, overlay, togglePause, startGame } = usePong();
	// const [hidden, setHidden] = Babact.useState<boolean>(false);

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

	// const getModal = () => {
	// 	if (gameStatus === GameStatus.FREEZE)
	// 		return <NextRoundModal
	// 			onNextRound={() => {
	// 				setGameStatus(GameStatus.PLAYING);
	// 				app.nextRound();
	// 			}}
	// 		/>
	// 	if (gameStatus === GameStatus.WAITING)
	// 		return <LocalStartModal
	// 			onClick={() => setHidden(true)}
	// 			onStart={() => handleStart()}
	// 		/>
	// 	if (gameStatus === GameStatus.PAUSED)
	// 		return <GamePausedModal
	// 			onClick={() => setHidden(true)}
	// 			onResume={() => handleResume()}
	// 		/>
	// 	if (gameStatus === GameStatus.ENDED)
	// 		return <WinnerModal
	// 			onClick={() => setHidden(true)}
	// 			onPlayAgain={() => {
	// 				handleStart();
	// 			}}
	// 		/>
	// 	return null;
	// }

	// Babact.useEffect(() => {
	// 	if (overlay.gameStatus.name === PongState.ENDED.name) {
	// 		setHidden(false);
	// 	}
	// }, [overlay])

	if (!overlay)
		return;

	return <Overlay
		// modal={getModal()}
		hidden={overlay.gameStatus.name === PongState.PLAYING.name || overlay.gameStatus.name === PongState.FREEZE.name}
	>
		<GameOverlay
			onStart={handleStart}
			onResume={handleResume}
		/>
	</Overlay>
}