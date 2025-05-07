import Babact from "babact";
import { usePong } from "../contexts/usePong";
import { useParams } from "babact-router-dom";
import GameOverlay from "../components/Game/GameOverlay";

export default function OnlineView() {

	const { app } = usePong();
	const { id } = useParams();

	const { overlay } = usePong();

	Babact.useEffect(() => {
		app.connect(id);
	}, [id]);

	if (!overlay)
		return;
	return <div>
		<GameOverlay/>
	</div>
}