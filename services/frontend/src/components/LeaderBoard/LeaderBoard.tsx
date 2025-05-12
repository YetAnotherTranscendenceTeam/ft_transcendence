import Babact from "babact";
import { Leaderboard } from "../../hooks/useLeaderboard";
import Card from "../../ui/Card";
import './leaderboard.css';

export default function LeaderBoard({
		leaderboard,
		className = "",
	}: {
		leaderboard: Leaderboard;
		className?: string;
		[key: string]: any;
	}) {

	if (!leaderboard) return null;

	return <Card className={`leaderboard right ${className}`}>
		<h1>{leaderboard.mode.split('_')[1]}</h1>
		<div className='container'>
			<div className='row leaderboard-header'>
				<span>Rank</span>
				<span>Username</span>
				<span>Rating</span>
			</div>
			<div className='leaderboard-body scrollbar'>
			{leaderboard.rankings.length === 0 && <p>
				No data available
			</p>}
			{leaderboard.rankings.map((user, index) => (
				<div className='row' key={user.account_id}>
					<span>#{index + 1}</span>
					<span>{user.username}</span>
					<span>{user.rating}</span>
				</div>
			))}
			</div>
		</div>
	</Card>

}