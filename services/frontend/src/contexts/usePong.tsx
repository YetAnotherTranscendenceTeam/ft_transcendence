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
		restartGame: () => void,
		resetOverlay: () => void
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
					let errors = {
						'UNAUTHORIZED': 'You are not authorized to join this game',
						'NOT_FOUND': 'Game not found',
						'FORBIDDEN': 'You are not allowed to join this game',
						'OTHER_LOCATION': 'This game is being played in another location',
						'BAD_GATEWAY': 'Spectator mode is unavailable',
						'CONNECTION_LOST': 'Connection lost with spectator service',
					}
					if (errors[error.reason])
						createToast(errors[error.reason], ToastType.DANGER);
					navigate('/');
				},
				loadingComplete: () => {
					// called when the game is loaded
				}
			}
		);
		appRef.current.load();

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

	const resetOverlay = () => {
		setOverlay(null);
	}

	Babact.useEffect(() => {
		resetOverlay();
	}, [window.location.pathname]);

	return (
		<PongContext.Provider
			value={{
				app: appRef.current,
				overlay,
				togglePause,
				startGame,
				restartGame,
				resetOverlay
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