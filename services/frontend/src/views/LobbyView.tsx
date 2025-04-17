import Babact from "babact";
import { useParams } from "babact-router-dom";
import LobbyTeamsList from "../components/Lobby/LobbyTeamsList";
import { useLobby } from "../contexts/useLobby";
import './views.css'
import Overlay from "../templates/Overlay";

export default function LobbyView() {

	const { code } = useParams();

	const { join, lobby } = useLobby();

	Babact.useEffect(() => {
		if (code && lobby === null && !localStorage.getItem('lobby')) {
			join(code);
		}
	}, [])

	Babact.useEffect(() => {
		if (lobby && lobby.join_secret !== code) {
			lobby.leave();
		}
	}, [lobby])


	return <Overlay>
		{lobby && <LobbyTeamsList lobby={lobby} />}
	</Overlay>

}