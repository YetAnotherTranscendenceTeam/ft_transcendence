import Babact from "babact";
import { GameScene } from "../components/Babylon/types";
import { GameStatus, usePong } from "../contexts/usePong";
import Scores from "../components/Game/Scores";
import LocalStartModal from "../components/Game/LocalStartModal";
import Overlay from "../templates/Overlay";
import NextRoundModal from "../components/Game/NextRoundModal";
import useEscape from "../hooks/useEscape";
import GamePausedModal from "../components/Game/GamePausedModal";
import WinnerModal from "../components/Game/WinnerModal";

export default function LocalView() {

	const { app, scores, setPaused, gameStatus, gameTime, setGameStatus, startGame, resetGame } = usePong();
	const [hidden, setHidden] = Babact.useState<boolean>(false);

	Babact.useEffect(() => {
		app.setGameScene(GameScene.LOCAL);
		resetGame();
	}, []);

	const handleStart = () => {
		startGame();
	}

	Babact.useEffect(() => {
		if ((scores[0] > 0 || scores[1] > 0) && gameStatus !== GameStatus.ENDED) {
			setGameStatus(GameStatus.FREEZE);
			console.log("Score updated");
		}
	}, [scores]);

	const handlePause = () => {
		setPaused(true);
		setHidden(false);
	}

	const handleResume = () => {
		setPaused(false);
	}

	useEscape(gameStatus === GameStatus.PLAYING, () => handlePause())

	const getModal = () => {
		if (gameStatus === GameStatus.FREEZE)
			return <NextRoundModal
				onNextRound={() => {
					setGameStatus(GameStatus.PLAYING);
					app.nextRound();
				}}
			/>
		if (gameStatus === GameStatus.WAITING)
			return <LocalStartModal
				onClick={() => setHidden(true)}
				onStart={() => handleStart()}
			/>
		if (gameStatus === GameStatus.PAUSED)
			return <GamePausedModal
				onClick={() => setHidden(true)}
				onResume={() => handleResume()}
			/>
		if (gameStatus === GameStatus.ENDED)
			return <WinnerModal
				onClick={() => setHidden(true)}
				onPlayAgain={() => {
					handleStart();
				}}
			/>
		return null;
	}

	const displayScores = hidden || gameStatus === GameStatus.PAUSED;

	Babact.useEffect(() => {
		if (gameStatus === GameStatus.ENDED) {
			setHidden(false);
		}
	}, [gameStatus])

	return <Overlay
		hidden={hidden}
		modal={getModal()}
	>
		<div className='local-view flex flex-col gap-2 items-center'>
			{displayScores && <Scores scores={scores} timer={gameTime}/>}
		</div>
	</Overlay>
}