import Babact from "babact";
import { GameScene } from "../components/Babylon/types";
import { usePong } from "../contexts/usePong";
import Scores from "../components/Game/Scores";
import LocalStartModal from "../components/Game/LocalStartModal";
import Overlay from "../templates/Overlay";
import useEscape from "../hooks/useEscape";
import GamePausedModal from "../components/Game/GamePausedModal";
import WinnerModal from "../components/Game/WinnerMatchOverlay";
import { useNavigate, useParams } from "babact-router-dom";
import OnlineStartModal from "../components/Game/OnlineStartModal";
import GameOverlay from "../components/Game/GameOverlay";
import { PongState } from "pong";

export default function OnlineView() {

	const { app } = usePong();
	const { id } = useParams();
	const navigate = useNavigate();

	const { overlay } = usePong();

	Babact.useEffect(() => {
		app.connect(id);
	}, [id]);

	if (!overlay)
		return;
	return <Overlay
		hidden={overlay.gameStatus.name === PongState.PLAYING.name || overlay.gameStatus.name === PongState.FREEZE.name}
		// modal={getModal()}
	>
		<GameOverlay/>
	</Overlay>
}