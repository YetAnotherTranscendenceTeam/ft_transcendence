import Babact from "babact";
import { Match, MatchState } from "../../views/TournamentView";
import { HPosition, VPosition } from "./Stage";
import Avatar from "../../ui/Avatar";

export default function MatchCard({
		match,
		positionH,
		positionV,
		...props
	}: {
		match: Match,
		positionH: HPosition,
		positionV: VPosition,
		[key: string]: any
	}) {

	const getWinnerIndex = (): number => {
		if (match.state !== MatchState.DONE)
			return null;
		if (match.scores[0] > match.scores[1])
			return 0;
		if (match.scores[0] < match.scores[1])
			return 1;
		return null;
	}

	return (
		<div
			className={`match-card-container flex items-center justify-center ${positionH} ${positionV}`}
			{...props}
		>
			<div
				className={`match-card flex flex-col items-center justify-between ${match.state}`}
				>
				{match.teams.map((team, i) =>
					<div
						key={i}
						className={`match-card-team flex items-center justify-between gap-4 w-full ${getWinnerIndex() === i  ? 'winner' : ''}`}
					>
						<div className='flex items-center gap-2'>
							{team.players.map((player, i) =>
								<Avatar key={i} src={player.profile.avatar} name={player.profile.username} size='xs'/>
							)}
							<h3>{team.name ?? team.players[0].profile.username}</h3>
							{/* {getWinnerIndex() === i && <i className="fa-solid fa-trophy"></i>} */}
						</div>
						<p>{match.scores[i]}</p>
					</div>
				)}
				{Array(2 - match.teams.length).fill(0).map((_, i) =>
					<div key={'noteam' + i} className='match-card-team flex justify-between gap-4 w-full'>
						<h3>...</h3>
						{/* <p>0</p> */}
					</div>
				)}
			</div>
		</div>
	)
}