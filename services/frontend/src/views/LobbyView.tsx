import Babact from "babact";
import { useParams } from "babact-router-dom";
import LobbyTeamsList from "../components/Lobby/LobbyTeamsList";
import { useLobby } from "../contexts/useLobby";
import './views.css'
import { usePong } from "../contexts/usePong";
import { GameScene } from "../components/Babylon/types";
import { useAuth } from "../contexts/useAuth";

export default function LobbyView() {

	const { code } = useParams();

	const { join, lobby } = useLobby();

	const { app } = usePong();

	const { me } = useAuth();

	Babact.useEffect(() => {
		app.setGameScene(GameScene.LOBBY);
	}, [])

	Babact.useEffect(() => {
		if (code && lobby === null && me && window.location.pathname === `/lobby/${code}`) {
			join(code);
		}
	}, [me, lobby])

	Babact.useEffect(() => {
		if (lobby && lobby.join_secret !== code) {
			lobby.leave();
		}
	}, [lobby])


	return <div>
		{lobby && <LobbyTeamsList lobby={lobby} />}
	</div>

}