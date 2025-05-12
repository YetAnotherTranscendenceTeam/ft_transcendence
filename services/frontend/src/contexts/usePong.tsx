import Babact from "babact";
import PongClient, { IPongOverlay } from "../components/Babylon/PongClient";
import Babylon from "../components/Babylon/Babylon";
import { Team } from "../hooks/useTournament";
import useToast, { ToastType } from "../hooks/useToast";
import { useNavigate } from "babact-router-dom";

const PongContext = Babact.createContext<{
		app: PongClient,
		overlay: PongOverlay,
		togglePause: (paused: boolean) => void,
		startGame: () => void,
		restartGame: () => void
	}>();

export type PongOverlay = IPongOverlay & {
	teams: Team[];
}

export const PongProvider = ({ children } : {children?: any}) => {

	const appRef = Babact.useRef<PongClient>(null);
	
	const [overlay, setOverlay] = Babact.useState<PongOverlay>(null);
	const { createToast } = useToast();
	const navigate = useNavigate();

	Babact.useEffect(() => {
        appRef.current = new PongClient(
			{
				updateOverlay: (params: IPongOverlay) =>  {
					setOverlay({
						...params,
						teams: params.teams.map((team) => new Team(team)),
					});
				},
				onConnectionError: (error) => {
					console.error('pong ws error', error);
					if (error.reason === 'UNAUTHORIZED' || error.reason === 'NOT_FOUND' || error.reason === 'FORBIDDEN') {
						createToast('This game is not available', ToastType.DANGER);
					}
					else if (error.reason === 'ENDED') {
						createToast('Match is over', ToastType.SUCCESS);
					}
					else if (error.reason === "OTHER_LOCATION") {
						createToast("This game is being played in another location", ToastType.DANGER);
					}
					navigate('/');
				}
			}
		);

        return () => {
            appRef.current.destroy();
        }
    }, []);

	// LOCAL RELATED!
	const togglePause = (paused: boolean) => {
		if (paused) {
			appRef.current?.pauseGame();
		}
		else {
			appRef.current?.resumeGame();
		}
	}

	// LOCAL RELATED!
	const startGame = () => {
		appRef.current?.startGame();
	}

	// LOCAL RELATED!
	const restartGame = () => {
		appRef.current?.restartGame();
	}

	return (
		<PongContext.Provider
			value={{
				app: appRef.current,
				overlay,
				togglePause,
				startGame,
				restartGame
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