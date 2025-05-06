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
import ProfileGameDrawer from "../components/Profile/ProfileGameDrawer";

export default function ProfileView() {

	const { id: userId } = useParams();

	const { user } = useUser(userId);

	const { app } = usePong();

	Babact.useEffect(() => {
		app.setGameScene(GameScene.MENU);
	}, [])

	const [filter, setFilter] = Babact.useState<string>("");
	const { matches, isLoading, page } = useMatches(userId, 10, filter);
	const [selectedMatch, setSelectedMatch] = Babact.useState<number>(null);
	
  	return <div>
		<div className='profile-view'>
			{user && <ProfileHeader user={user} />}
			<ProfileFilter
				onChange={(string) => {
					console.log(string);
					setFilter(string);
				}}
			/>
			<ProfileGameList
				page={page}
				loading={isLoading}
				matches={matches}
				onSelectMatch={(match) => {
					setSelectedMatch(match.match_id);
				}}
			/>
			<ProfilePieChart/>
			<ProfileLineChart/>
			<ProfileGameDrawer
				match_id={selectedMatch}
				onClose={() => {
					setSelectedMatch(null);
				}}
			/>
		</div>
	</div>

}