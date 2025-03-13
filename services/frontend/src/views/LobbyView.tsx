import Babact from "babact";
import Menu from "../components/Menu/Menu";
import ProfileCard from "../components/Profile/ProfileCard";
import { useAuth } from "../contexts/useAuth";
import { useNavigate, useParams } from "babact-router-dom";
import LobbyTeamsList from "../components/Lobby/LobbyTeamsList";
import { useLobby } from "../contexts/useLobby";
import AuthCard from "../components/Auth/AuthCard";
import './views.css'
import LobbySettingsCard from "../components/Lobby/LobbySettingsCard";

export default function LobbyView() {

	const { me } = useAuth()

	const { code } = useParams();

	const { join, create } = useLobby();
	const { lobby } = useLobby();

	const navigate = useNavigate();

	Babact.useEffect(() => {
		if (code && lobby === null) {
			join(code);
		}
	}, [])

	Babact.useEffect(() => {
		if (lobby && lobby.joinSecret !== code) {
			navigate(`/lobby/${lobby.joinSecret}`);
		}
	}, [lobby])


	return <div className='view flex'>
		<Menu/>
		{lobby && <div className='flex lobby-view flex-col h-full w-full justify-between'>
			<LobbyTeamsList lobby={lobby} />
			<LobbySettingsCard lobby={lobby} />
		</div>}
		{
			me ? <ProfileCard me={me}/> : <AuthCard/> 
		}
	</div>

}