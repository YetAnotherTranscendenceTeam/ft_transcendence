import Babact from "babact";
import Overlay from "../templates/Overlay";
import { useParams } from "babact-router-dom";
import useUser from "../hooks/useUser";
import { usePong } from "../contexts/usePong";
import { GameScene } from "../components/Babylon/types";
import ProfileHeader from "../components/Profile/ProfileHeader";
import SegmentedControl from "../ui/SegmentedControl";
import ProfileFilter from "../components/Profile/ProfileFilter";
import ProfileGameList from "../components/Profile/ProfileGameList";
import ProfilePieChart from "../components/Profile/ProfilePieChart";

export default function ProfileView() {

	const { id: userId } = useParams();

	const { user } = useUser(userId);

	const { app } = usePong();

	Babact.useEffect(() => {
		app.setGameScene(GameScene.MENU);
	}, [])

  	return <Overlay>
		<div className='profile-view'>
			{user && <ProfileHeader user={user} />}
			<ProfileFilter />
			<ProfileGameList/>
			<ProfilePieChart/>
			{/* <ProfilePieChart/> */}
		</div>
	</Overlay>

}