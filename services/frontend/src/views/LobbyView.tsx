import Babact from "babact";
import { useParams } from "babact-router-dom";
import LobbyTeamsList from "../components/Lobby/LobbyTeamsList";
import { useLobby } from "../contexts/useLobby";
import './views.css'
import Overlay from "../templates/Overlay";
import { usePong } from "../contexts/usePong";
import { GameScene } from "../components/Babylon/types";
import { useAuth } from "../contexts/useAuth";

export default function LobbyView() {

	const { code } = useParams();

	const { join, lobby } = useLobby();

	const { app } = usePong();

	const { me } = useAuth();

	Babact.useEffect(() => {
		app.setGameScene(GameScene.MENU);
	}, [])

	Babact.useEffect(() => {
		if (code && lobby === null && me) {
			join(code);
		}
	}, [me, lobby])

	Babact.useEffect(() => {
		if (lobby && lobby.join_secret !== code) {
			lobby.leave();
		}
	}, [lobby])


	return <Overlay>
		{lobby && <LobbyTeamsList lobby={lobby} />}
	</Overlay>

}