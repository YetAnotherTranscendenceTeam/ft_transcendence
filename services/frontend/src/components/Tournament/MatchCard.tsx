import Babact from "babact";
import { HPosition, VPosition } from "./Stage";
import Avatar from "../../ui/Avatar";
import { useAuth } from "../../contexts/useAuth";
import { TournamentMatch, MatchState } from "../../hooks/useTournament";

export default function MatchCard({
		match,
		positionH,
		positionV,
		...props
	}: {
		match: TournamentMatch,
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

	const { me } = useAuth();

	const isFocused = window.location.search.includes(`match_id=${match.match_id}`);

	return (
		<div
			className={`match-card-container flex items-center justify-center ${positionH} ${positionV}`}
			{...props}
		>
			<div
				className={`match-card flex flex-col items-center justify-between ${match.state} ${isFocused ? 'focused' : ''}`}
				>
				{match.teams.map((team, i) =>
					team ? <div
						key={i}
						className={`match-card-team flex items-center justify-between gap-4 w-full ${getWinnerIndex() === i  ? 'winner' : ''} ${match.state === MatchState.PLAYING && match.playerTeamIndex(me.account_id) === i ? 'playing' : ''}`}
					>
						<div className='flex items-center gap-2'>
							{team.players.map((player, i) =>
								<Avatar key={i} src={player.profile.avatar} name={player.profile.username} size='xs'/>
							)}
							<h3>{team.getDisplayName()}</h3>
						</div>
						<p>{match.scores[i]}</p>
					</div>
					:
					<div key={'noteam' + i} className='match-card-team flex justify-between gap-4 w-full'>
						<h3>...</h3>
					</div>

				)}
			</div>
		</div>
	)
}