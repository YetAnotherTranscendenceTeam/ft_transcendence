import Babact from "babact";
import PongClient from "../components/Babylon/PongClient";
import Babylon from "../components/Babylon/Babylon";

const PongContext = Babact.createContext<{
		app: PongClient,
		scores: number[]
	}>();

export const PongProvider = ({ children } : {children?: any}) => {

	const appRef = Babact.useRef<PongClient>(null);
	const [scores, setScores] = Babact.useState([0, 0]);

	Babact.useEffect(() => {
        appRef.current = new PongClient((s) => setScores(s));

        return () => {
            appRef.current.destroy();
        }
    }, []);

	return (
		<PongContext.Provider
			value={{
				app: appRef.current,
				scores,
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