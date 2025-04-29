import Babact from "babact";
import Overlay from "../templates/Overlay";
import { useParams } from "babact-router-dom";
import useUser from "../hooks/useUser";
import { usePong } from "../contexts/usePong";
import { GameScene } from "../components/Babylon/types";
import ProfileHeader from "../components/Profile/ProfileHeader";

export default function ProfileView() {

	const { id: userId } = useParams();

	const { user } = useUser(userId);

	const { app } = usePong();

	Babact.useEffect(() => {
		app.setGameScene(GameScene.MENU);
	}, [])

  	return <Overlay>
		<div className='profile-view flex flex-col items-center h-full w-full'>
			{user && <ProfileHeader user={user} />}
		</div>
	</Overlay>

}