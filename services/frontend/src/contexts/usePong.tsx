import Babact from "babact";
import PongClient from "../components/Babylon/PongClient";
import Babylon from "../components/Babylon/Babylon";
import { ScoredEvent } from "../components/Babylon/types";

const PongContext = Babact.createContext<{
		app: PongClient,
		scores: number[],
		lastWinner: number,
		gameStatus: GameStatus,
		setPaused: (paused: boolean) => void,
		startGame: () => void,
		setGameStatus: (status: GameStatus) => void,
		resetGame: () => void,
		gameTime: number,
	}>();

export enum GameStatus {
	WAITING,
	PLAYING,
	FREEZE,
	PAUSED,
	ENDED,
}

export const PongProvider = ({ children } : {children?: any}) => {

	const appRef = Babact.useRef<PongClient>(null);
	const [scores, setScores] = Babact.useState([0, 0]);
	const [lastWinner, setLastWinner] = Babact.useState<number>(null);
	const [gameStatus, setGameStatus] = Babact.useState<GameStatus>(GameStatus.WAITING);
	const [gameTime, setGameTime] = Babact.useState<number>(0);

	const handleScoreUpdate = (event: ScoredEvent) => {
		setScores([...event.score]);
		setLastWinner(event.side);
	}

	Babact.useEffect(() => {
        appRef.current = new PongClient(
			{
				scoreUpdateCallback : (score) =>  {
					handleScoreUpdate(score);
				},
				timeUpdateCallback: (time) =>  {
					if (gameTime !== time) {
						setGameTime(time);
					}
				},
				endGameCallback: () => {
					setGameStatus(GameStatus.ENDED);
					console.log("Game ended");
				}
			}
		);

        return () => {
            appRef.current.destroy();
        }
    }, []);

	const setPaused = (paused: boolean) => {
		if (paused) {
			appRef.current?.pauseGame();
			setGameStatus(GameStatus.PAUSED);
		}
		else {
			appRef.current?.resumeGame();
			setGameStatus(GameStatus.PLAYING);
		}
	}

	const resetGame = () => {
		setScores([0, 0]);
		setLastWinner(null);
		setGameTime(0);
		setGameStatus(GameStatus.WAITING);
	}

	const startGame = () => {
		setScores([0, 0]);
		setLastWinner(null);
		setGameTime(0);
		setGameStatus(GameStatus.PLAYING);
		appRef.current?.startGame();
	}

	return (
		<PongContext.Provider
			value={{
				app: appRef.current,
				scores,
				lastWinner,
				gameStatus,
				setPaused,
				startGame,
				setGameStatus,
				resetGame,
				gameTime,
			}}
		>
			<Babylon key="babylon" app={appRef.current}/>
			{children}
		</PongContext.Provider>
	);
};

export const usePong = () => {
	return Babact.useContext(PongContext);
};