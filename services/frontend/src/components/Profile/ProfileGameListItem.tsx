import Babact from "babact";
import Avatar from "../../ui/Avatar";
import { Match } from "../../hooks/useMatches";

export default function ProfileGameListItem({
		match,
		onSelect,
		...props
	}: {
		match: Match,
		onSelect: () => void,
		[key: string]: any
	}) {

	if (!match.teams || match.teams.length < 2) {
		return null;
	}

	return <div
		className={`profile-game-list-item flex flex-row items-center justify-between w-full ${match.hasPlayerWin() ? 'win' : 'lose'}`}
		onClick={onSelect}
		{...props}
	>
		<div className='flex flex-row items-center gap-2 flex-3'>
			{
				match.teams[0].players.map((player) => 
					<Avatar
						key={player.account_id}
						size="lg"
						name={player.profile.username}
						src={player.profile.avatar}
					/>
				)
			}
			<h2>
				{match.teams[0].getDisplayName()}
			</h2>
		</div>
		<div className='flex flex-col items-center justify-center gap-1 flex-1'>
			<h1>
				{match.scores[0]} - {match.scores[1]}
			</h1>
			<h3>
				{match.getGameModeName()}
			</h3>
		</div>
		<div className='flex flex-row items-center justify-end gap-2 flex-3'>
			<h2>
				{match.teams[1].getDisplayName()}
			</h2>
			{
				match.teams[1].players.map((player) => 
					<Avatar
						key={player.account_id}
						size="lg"
						name={player.profile.username}
						src={player.profile.avatar}
					/>
				)
			}
		</div>
	</div>
}