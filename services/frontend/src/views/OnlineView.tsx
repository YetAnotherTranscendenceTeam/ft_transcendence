import Babact from "babact";
import { usePong } from "../contexts/usePong";
import { useParams } from "babact-router-dom";
import GameOverlay from "../components/Game/GameOverlay";
import { APIRefreshToken } from "../hooks/useAPI";

export default function OnlineView() {

	const { app, overlay } = usePong();
	const { id } = useParams();

	const connect = async () => {
		await APIRefreshToken();
		app.connect(id, false);
	}

	Babact.useEffect(() => {
		connect();
	}, [id]);

	if (!overlay)
		return;
	return <div>
		<GameOverlay/>
	</div>
}
