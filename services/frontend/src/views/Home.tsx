import Babact from "babact"
import { usePong } from "../contexts/usePong"
import { GameScene } from "../components/Babylon/types";
import useLeaderboard from "../hooks/useLeaderboard";
import LeaderBoard from "../components/LeaderBoard/LeaderBoard";
import Card from "../ui/Card";
import Button from "../ui/Button";
 
export default function Home() {

	const { app } = usePong();

	Babact.useEffect(() => {
		app.setGameScene(GameScene.MENU);
	}, [])

	const { leaderboards, isLoading, refresh } = useLeaderboard();

	return <div className='home-view flex flex-col items-center justify-center h-full gap-4 w-fit'>
		<Card className='leaderboards-title flex-row items-center justify-between gap-4 flex-1 w-full bottom'>
			<p>Leaderboards</p>
			<Button
				loading={isLoading}
				className="icon"
				onClick={() => {
					refresh();
				}}
			>
				<i className="fa-solid fa-arrow-rotate-right"></i>
			</Button>
		</Card>
		{leaderboards && leaderboards?.map((leaderboard, index) => (
			<LeaderBoard key={index} leaderboard={leaderboard} className="flex-10"/>
		))}
	</div>
}