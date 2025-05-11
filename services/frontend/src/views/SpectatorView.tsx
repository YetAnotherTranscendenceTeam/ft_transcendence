import Babact from "babact";
import { usePong } from "../contexts/usePong";
import { useParams } from "babact-router-dom";
import GameOverlay from "../components/Game/GameOverlay";
import { useOverlay } from "../contexts/useOverlay";
import useEscape from "../hooks/useEscape";
import { APIRefreshToken } from "../hooks/useAPI";

export default function SpectatorView() {

	const { app, overlay } = usePong();
	const { id } = useParams();
	const { toggleOverlay } = useOverlay();

	useEscape(true, () => toggleOverlay());

	const connect = async () => {
		await APIRefreshToken();
		app.connect(id, true);
	}

	Babact.useEffect(() => {
		connect();
	}, [id]);

	const handleClick = () => {
		toggleOverlay();
	}


	if (!overlay)
		return;
	return <div onClick={handleClick}>
		<GameOverlay/>
	</div>
}
