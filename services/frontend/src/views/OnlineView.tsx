import Babact from "babact";
import { GameScene } from "../components/Babylon/types";
import { usePong } from "../contexts/usePong";
import Scores from "../components/Game/Scores";
import LocalStartModal from "../components/Game/LocalStartModal";
import Overlay from "../templates/Overlay";
import NextRoundModal from "../components/Game/NextRoundModal";
import useEscape from "../hooks/useEscape";
import GamePausedModal from "../components/Game/GamePausedModal";
import WinnerModal from "../components/Game/WinnerModal";
import { useNavigate, useParams } from "babact-router-dom";
import OnlineStartModal from "../components/Game/OnlineStartModal";
import GameOverlay from "../components/Game/GameOverlay";

export default function OnlineView() {

	const { app } = usePong();
	const { id } = useParams();
	const navigate = useNavigate();

	Babact.useEffect(() => {
		app.connect(id);
	}, [id]);

	return <Overlay
		// hidden={hidden}
		// modal={getModal()}
	>
		<GameOverlay/>
	</Overlay>
}