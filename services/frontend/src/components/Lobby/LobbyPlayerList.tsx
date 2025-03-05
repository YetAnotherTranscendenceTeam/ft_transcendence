import Babact from "babact";
import Card from "../../ui/Card";
import Avatar from "../../ui/Avatar";

export default function LobbyPlayerList({lobby}) {
	
	const createTeam = () => {
		const teams = new Array(lobby.mode.team_count).fill(null).map(() => []);
		lobby.players.forEach((player, i) => {
			teams[i % lobby.mode.team_count].push(player);
		})
		return teams;
	}
	

	return <div className='lobby-player-list'>
		{createTeam().map((team, i) => (
			<Card key={i} className='lobby-player-list-team left' style={`--team-color: var(--team-${i % 2 + 1}-color)`}>
				<h1>Team {i + 1}</h1>
				{team.map((player) => (
					<Card key={player.account_id} className={'flex flex-row gap-2 items-center'}>
						<Avatar src={player.profile?.avatar} name={player.profile?.username}/>
						{player.profile?.username}
					</Card>
				))}
				{new Array(lobby.mode.team_size - team.length).fill(null).map((_, i) => (
					<Card key={-i} className='empty flex flex-row gap-2 items-center'>
						Empty
					</Card>
				))}
			</Card>
		))}
	</div>
}