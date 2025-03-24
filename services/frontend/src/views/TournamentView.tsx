import Babact from "babact";
import Overlay from "../templates/Overlay";
import { ITeam } from "yatt-lobbies";
import Stage from "../components/Tournament/Stage";
import Tree from "../components/Tournament/Tree";

export interface Match {
	teams_id: number[]
	scrores: number[]
	teams?: ITeam[]
}

export default function TournamentView() {

	const teams: ITeam[] = [
		{
			name: 'bwisniew & acancel',
			players: [
				{
					account_id: 0,
					profile: {
						account_id: 0,
						username: 'bwisniew',
						avatar: 'https://cdn.intra.42.fr/users/c4d09e1b88c5f1eaf042f81914ccdbb8/bwisniew.JPG',
						created_at: '2021-09-01T00:00:00Z',
						updated_at: '2021-09-01T00:00:00Z',
					}
				},
				{
					account_id: 0,
					profile: {
						account_id: 0,
						username: 'acancel',
						avatar: 'https://cdn.intra.42.fr/users/7847d2a31e82c9c83d724fa73e847318/acancel.jpg',
						created_at: '2021-09-01T00:00:00Z',
						updated_at: '2021-09-01T00:00:00Z',
					}
				},
			]
		},
		{
			name: 'ibertran & anfichet',
			players: [
				{
					account_id: 0,
					profile: {
						account_id: 0,
						username: 'ibertran',
						avatar: 'https://cdn.intra.42.fr/users/b3bd01f8d5a13391c731d3501af9ae7e/ibertran.jpg',
						created_at: '2021-09-01T00:00:00Z',
						updated_at: '2021-09-01T00:00:00Z',
					}
				},
				{
					account_id: 0,
					profile: {
						account_id: 0,
						username: 'anfichet',
						avatar: 'https://cdn.intra.42.fr/users/477cad5905c6b2cb7ce7eeb1ed1afe6a/anfichet.JPG',
						created_at: '2021-09-01T00:00:00Z',
						updated_at: '2021-09-01T00:00:00Z',
					}
				},
			]
		},
	];

	const tournament: Match[] = [
		{
			teams_id: [0, 1],
			scrores: [0, 0]
		},
		{
			teams_id: [0, 1],
			scrores: [0, 0]
		},{
			teams_id: [0, 1],
			scrores: [0, 0]
		},{
			teams_id: [0, 1],
			scrores: [0, 1]
		},{
			teams_id: [0, 1],
			scrores: [0, 1]
		},{
			teams_id: [0, 1],
			scrores: [0, 1]
		},{
			teams_id: [0, 1],
			scrores: [0, 1]
		},{
			teams_id: [0, 1],
			scrores: [0, 1]
		},{
			teams_id: [0, 1],
			scrores: [0, 1]
		},{
			teams_id: [0, 1],
			scrores: [0, 1]
		},{
			teams_id: [0, 1],
			scrores: [0, 1]
		},{
			teams_id: [0, 1],
			scrores: [0, 1]
		},{
			teams_id: [0, 1],
			scrores: [0, 1]
		},{
			teams_id: [0, 1],
			scrores: [0, 1]
		},{
			teams_id: [0, 1],
			scrores: [0, 1]
		}

	];

	const matches = tournament.map((match, i) => ({
		...match,
		teams: match.teams_id.map(team_id => teams[team_id])
	}))

	return <Overlay>
		<div
			className='tournament-view scrollbar'
		>
			<Tree
				matches={matches}
			/>
		</div>
	</Overlay>
}