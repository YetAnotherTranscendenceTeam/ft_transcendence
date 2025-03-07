import Babact from "babact";
import Menu from "../components/Menu/Menu";
import ProfileCard from "../components/Profile/ProfileCard";
import { useAuth } from "../contexts/useAuth";
import { useParams } from "babact-router-dom";
import LobbyTeamsList from "../components/Lobby/LobbyTeamsList";
import { useLobby } from "../contexts/useLobby";
import AuthCard from "../components/Auth/AuthCard";

export default function LobbyView() {

	const { me } = useAuth()

	const { code } = useParams();

	const { join, create } = useLobby();

	Babact.useEffect(() => {
		if (code)
			join(code);
	}, [])

	const { lobby } = useLobby();

	return <div className='lobby-view flex gap-4'>
		<Menu/>
		{lobby && <LobbyTeamsList lobby={lobby} />}
		{
			me ? <ProfileCard me={me}/> : <AuthCard/> 
		}
	</div>

}