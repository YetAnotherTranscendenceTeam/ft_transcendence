import Babact from "babact";
import Overlay from "../components/Overlay/Overlay";
import { usePong } from "./usePong";
import { PongState } from "pong";

const OverlayContext = Babact.createContext<{
	setIsForcedOpen: (isOverlayHidden: boolean) => void;
	toggleOverlay: () => void;
}>();

export const OverlayProvider = ({ children } : {children?: any}) => {

	const { overlay } = usePong();

	const [isForcedOpen, setIsForcedOpen] = Babact.useState<boolean>(false);

	const isPlaying = overlay?.gameStatus?.name === PongState.PLAYING.name || overlay?.gameStatus?.name === PongState.FREEZE.name;

	const hidden = isPlaying && !isForcedOpen;

	return (
		<OverlayContext.Provider
			value={{
				setIsForcedOpen,
				toggleOverlay: () => setIsForcedOpen(prev => !prev),
			}}
		>
			<Overlay
				hidden={hidden}
			>
				{children}
			</Overlay>
		</OverlayContext.Provider>
	);
};

export const useOverlay = () => {
	return Babact.useContext(OverlayContext);
};