import Babact from "babact";
import { Match } from "../../views/TournamentView";

export default function MatchCard({
	match,
	positionH,
	positionV,
	...props
}: {
	match: Match,
	positionH: 'left' | 'right' | 'center',
	positionV: 'top' | 'middle' | 'bottom',
	[key: string]: any
}) {


	return (
		<div
			className={`match-card-container flex items-center justify-center ${positionH} ${positionV}`}
			{...props}
		>
			<div
				className='match-card flex flex-col items-center justify-between'
				>
				{match.teams_id.map((team_id, i) =>
					<div key={i} className='team'>
						Team {team_id} - {match.scrores[i]}
					</div>
				)}
			</div>
		</div>
	)
}