import Babact from "babact";
import PongClient from "../components/Babylon/PongClient";
import Babylon from "../components/Babylon/Babylon";
import { scoredEvent } from "../components/Babylon/types";

const PongContext = Babact.createContext<{
		app: PongClient,
		scores: number[],
		lastWinner: number,
	}>();

export const PongProvider = ({ children } : {children?: any}) => {

	const appRef = Babact.useRef<PongClient>(null);
	const [scores, setScores] = Babact.useState([0, 0]);
	const [lastWinner, setLastWinner] = Babact.useState<number>(null);

	const handleScoreUpdate = (event: scoredEvent) => {
		setScores(event.score);
		setLastWinner(event.side);
	}

	Babact.useEffect(() => {
        appRef.current = new PongClient((e) => handleScoreUpdate(e));

        return () => {
            appRef.current.destroy();
        }
    }, []);

	return (
		<PongContext.Provider
			value={{
				app: appRef.current,
				scores,
				lastWinner,
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