import Babact from "babact";
import { usePong } from "../contexts/usePong";
import { useParams } from "babact-router-dom";
import GameOverlay from "../components/Game/GameOverlay";

export default function OnlineView() {

	const { app, overlay } = usePong();
	const { id } = useParams();

	Babact.useEffect(() => {
		app.connect(id, window.location.pathname.includes("/spectate"));
	}, [id]);

	if (!overlay)
		return;
	return <div>
		<GameOverlay/>
	</div>
}
