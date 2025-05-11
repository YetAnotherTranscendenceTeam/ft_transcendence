import Babact from "babact";
import { usePong } from "../contexts/usePong";
import { useParams } from "babact-router-dom";
import GameOverlay from "../components/Game/GameOverlay";
import { useOverlay } from "../contexts/useOverlay";
import useEscape from "../hooks/useEscape";

export default function SpectatorView() {

	const { app, overlay } = usePong();
	const { id } = useParams();
	const { toggleOverlay } = useOverlay();

	useEscape(true, () => toggleOverlay());

	Babact.useEffect(() => {
		app.connect(id, true);
	}, [id]);

	if (!overlay)
		return;
	return <div>
		<GameOverlay/>
		<p>Spectating Mode</p>
	</div>
}
