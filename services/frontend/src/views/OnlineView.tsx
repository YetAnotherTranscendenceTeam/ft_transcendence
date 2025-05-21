import Babact from "babact";
import { usePong } from "../contexts/usePong";
import { useParams } from "babact-router-dom";
import GameOverlay from "../components/Game/GameOverlay";
import { APIRefreshToken } from "../hooks/useAPI";
import { useAuth } from "../contexts/useAuth";
import { useOverlay } from "../contexts/useOverlay";

export default function OnlineView() {

	const { app, overlay } = usePong();
	const { id } = useParams();
	const { ping } = useAuth();
	const { setIsForcedOpen } = useOverlay();

	const connect = async () => {
		await APIRefreshToken();
		app.connect(id, false);
	}

	Babact.useEffect(() => {
		connect();
	}, [id]);

	Babact.useEffect(() => {
		setIsForcedOpen(false);
		const interval = setInterval(() => {
			ping();
		}, 5000);
		return () => {
			clearInterval(interval);
		};
	}, []);

	if (!overlay)
		return;
	return <div>
		<GameOverlay/>
	</div>
}
