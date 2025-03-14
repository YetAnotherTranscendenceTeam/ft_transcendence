import Babact from "babact";
import { useAuth } from "../contexts/useAuth";
import { useNavigate, useParams } from "babact-router-dom";
import LobbyTeamsList from "../components/Lobby/LobbyTeamsList";
import { useLobby } from "../contexts/useLobby";
import './views.css'
import Overlay from "../templates/Overlay";

export default function LobbyView() {

	const { code } = useParams();

	const { join, leave } = useLobby();
	const { lobby } = useLobby();

	const navigate = useNavigate();

	Babact.useEffect(() => {
		if (code && lobby === null && !localStorage.getItem('lobby')) {
			join(code);
			console.log('join', code)
		}
	}, [])

	Babact.useEffect(() => {
		if (lobby && lobby.join_secret !== code) {
			// navigate(`/lobby/${lobby.join_secret}`);
			leave();
		}
	}, [lobby])


	return <Overlay>
		{lobby && <LobbyTeamsList lobby={lobby} />}
	</Overlay>

}