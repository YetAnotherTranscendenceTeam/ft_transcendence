import Babact from "babact";
import PongClient from "../components/Babylon/PongClient";
import Babylon from "../components/Babylon/Babylon";
import { ScoredEvent } from "../components/Babylon/types";

const PongContext = Babact.createContext<{
		app: PongClient,
		scores: number[],
		lastWinner: number,
		paused: boolean,
		setPaused: (paused: boolean) => void,
		gameTime: number,
	}>();

export const PongProvider = ({ children } : {children?: any}) => {

	const appRef = Babact.useRef<PongClient>(null);
	const [scores, setScores] = Babact.useState([0, 0]);
	const [lastWinner, setLastWinner] = Babact.useState<number>(null);
	const [gamePaused, setGamePaused] = Babact.useState<boolean>(false);
	const [gameTime, setGameTime] = Babact.useState<number>(0);

	const handleScoreUpdate = (event: ScoredEvent) => {
		setScores(event.score);
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
		}
		else {
			appRef.current?.resumeGame();
		}
		setGamePaused(paused);
	}

	return (
		<PongContext.Provider
			value={{
				app: appRef.current,
				scores,
				lastWinner,
				paused: gamePaused,
				setPaused,
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