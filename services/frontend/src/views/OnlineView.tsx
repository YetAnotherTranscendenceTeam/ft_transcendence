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
import { useNavigate, useParams } from "babact-router-dom";
import OnlineStartModal from "../components/Game/OnlineStartModal";

export default function OnlineView() {

	const { app, scores, setPaused, gameStatus, gameTime, setGameStatus, startGame, resetGame, playerSide } = usePong();
	const [hidden, setHidden] = Babact.useState<boolean>(false);
	const { id } = useParams();
	const navigate = useNavigate();

	Babact.useEffect(() => {
		app.connect(id);
		resetGame();
	}, []);


	Babact.useEffect(() => {
		if ((scores[0] > 0 || scores[1] > 0) && gameStatus !== GameStatus.ENDED) {
			setGameStatus(GameStatus.FREEZE);
			console.log("Score updated");
		}
	}, [scores]);

	const getModal = () => {
		if (gameStatus === GameStatus.WAITING || (
			gameStatus === GameStatus.FREEZE && (scores[0] === 0 && scores[1] === 0)
		)) {
			console.log("gameStatus", {gameStatus});
			return <OnlineStartModal playerSide={playerSide} frozen={gameStatus === GameStatus.WAITING} onTimeout={() => {
				setGameStatus(GameStatus.PLAYING);
			}}/>
		}
		if (gameStatus === GameStatus.FREEZE)
			return <NextRoundModal
			onNextRound={() => {
				setGameStatus(GameStatus.PLAYING);
			}}
		/>
		if (gameStatus === GameStatus.ENDED)
			return <WinnerModal
				onClick={() => {
					navigate("/")
				}}
				onPlayAgain={() => {
				}}
				/>
		return null;
	}

	const displayScores = hidden || gameStatus === GameStatus.FREEZE;

	Babact.useEffect(() => {
		if (gameStatus === GameStatus.ENDED) {
			setHidden(false);
		}
		else
			setHidden(true);
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