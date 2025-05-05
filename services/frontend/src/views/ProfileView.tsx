import Babact from "babact";
import { useParams } from "babact-router-dom";
import useUser from "../hooks/useUser";
import { usePong } from "../contexts/usePong";
import { GameScene } from "../components/Babylon/types";
import ProfileFilter from "../components/Profile/ProfileFilter";
import ProfileGameList from "../components/Profile/ProfileGameList";
import ProfilePieChart from "../components/Profile/ProfilePieChart";
import ProfileLineChart from "../components/Profile/ProfileLineChart";
import useMatches from "../hooks/useMatches";
import ProfileHeader from "../components/Profile/ProfileHeader";

export default function ProfileView() {

	const { id: userId } = useParams();

	const { user } = useUser(userId);

	const { app } = usePong();

	Babact.useEffect(() => {
		app.setGameScene(GameScene.MENU);
	}, [])

	const { matches } = useMatches(userId);
	
  	return <div>
		<div className='profile-view'>
			{user && <ProfileHeader user={user} />}
			<ProfileFilter />
			<ProfileGameList/>
			<ProfilePieChart/>
			<ProfileLineChart/>
		</div>
	</div>

}