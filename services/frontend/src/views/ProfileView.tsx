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
import { useAuth } from "../contexts/useAuth";
import ErrorView from "./ErrorView";

export default function ProfileView() {

	const { id: userId } = useParams();

	const { me } = useAuth();
	if (!me) {
		return <ErrorView errorMessage="You must be logged in" errorCode={401} />
	}

	const { user, gamemodes, elos } = useUser(userId);
	const { app } = usePong();

	Babact.useEffect(() => {
		app.setGameScene(GameScene.MENU);
	}, [])

	const [filter, setFilter] = Babact.useState<string>("");
	const { matches, isLoading, page, setPage, totalPages } = useMatches(userId, 10, filter);
	const [selectedMatch, setSelectedMatch] = Babact.useState<number>(null);
	
	if (!user) {
		return <ErrorView errorMessage="User not found" errorCode={404} />
	}

  	return <div>
		<div className='profile-view'>
			{user && <ProfileHeader user={user} />}
			<ProfileFilter
				onChange={(string) => {
					setFilter(string);
				}}
			/>
			<ProfileGameList
				page={page}
				totalPages={totalPages}
				setPage={setPage}
				loading={isLoading}
				matches={matches}
				onSelectMatch={(match) => {
					setSelectedMatch(match.match_id);
				}}
			/>
			{gamemodes && <ProfilePieChart
				key={'gamemode-chart' + user?.account_id}
				gamemodes={gamemodes}
			/>}
			{elos && <ProfileLineChart
				key={'elo-chart' + user?.account_id}
				elos={elos}
			/>}
			<ProfileGameDrawer
				match_id={selectedMatch}
				onClose={() => {
					setSelectedMatch(null);
				}}
			/>
		</div>
	</div>

}