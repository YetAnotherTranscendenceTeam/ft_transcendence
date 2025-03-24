import Babact from "babact";
import { Match } from "../../views/TournamentView";
import { HPosition, VPosition } from "./Stage";
import Avatar from "../../ui/Avatar";
import Card from "../../ui/Card";

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


	return (
		<div
			className={`match-card-container flex items-center justify-center ${positionH} ${positionV}`}
			{...props}
		>
			<Card
				className='match-card flex flex-col items-center justify-between'
				>
				{match.teams.map((team, i) =>
					<div key={i} className='match-card-team flex flex-col gap-2 w-full'>
						<h3>{team.name}</h3>
						{/* <div className='flex gap-2'>
							{team.players.map((player, i) =>
								<Avatar src={player.profile.avatar} name={player.profile.avatar} />
							)}
						</div> */}
					</div>
				)}
			</Card>
		</div>
	)
}