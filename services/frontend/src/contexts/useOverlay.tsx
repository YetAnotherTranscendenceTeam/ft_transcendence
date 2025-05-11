import Babact from "babact";
import Overlay from "../components/Overlay/Overlay";
import { usePong } from "./usePong";
import { PongState } from "pong";

const OverlayContext = Babact.createContext<{}>();

export const OverlayProvider = ({ children } : {children?: any}) => {

	const { overlay } = usePong();

	return (
		<OverlayContext.Provider
			value={null}
		>
			<Overlay
				hidden={overlay && (overlay.gameStatus.name === PongState.PLAYING.name || overlay.gameStatus.name === PongState.FREEZE.name)}
			>
				{children}
			</Overlay>
		</OverlayContext.Provider>
	);
};

export const useOverlay = () => {
	return Babact.useContext(OverlayContext);
};