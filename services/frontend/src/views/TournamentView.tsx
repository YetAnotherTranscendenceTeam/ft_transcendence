import Babact from "babact";
import Overlay from "../templates/Overlay";
import { ITeam } from "yatt-lobbies";
import Stage from "../components/Tournament/Stage";

export interface Match {
	teams_id: number[]
	scrores: number[]
}

export default function TournamentView() {

	const teams: ITeam[] = [
		{
			name: 'Team 0',
			players: []
		},
		{
			name: 'Team 1',
			players: []
		},
		{
			name: 'Team 2',
			players: []
		},
		{
			name: 'Team 3',
			players: []
		},
		{
			name: 'Team 4',
			players: []
		}
	];

	const tournament: Match[] = [
		{
			teams_id: [],
			scrores: [0, 0]
		},
		{
			teams_id: [5],
			scrores: [0, 0]
		},
		{
			teams_id: [3, 4],
			scrores: [0, 0]
		},
		{
			teams_id: [0, 1],
			scrores: [0, 0]
		},
		{
			teams_id: [0, 1],
			scrores: [0, 0]
		},
		{
			teams_id: [0, 1],
			scrores: [0, 0]
		},
	];

	let stages: Match[][] = [];

	const createRound = (teams: ITeam[]) => {
		const nbRounds = Math.log2(teams.length);
		for(let i = 0; i < nbRounds; i++) {
			const start = Math.pow(2, i) - 1;
			const end = start + Math.pow(2, i);
			stages.push(tournament.slice(start, end));
		}
	}
	createRound(teams)
	

	const getPosition = (i): 'left' | 'right' | 'center' => {
		if (i === 0) return 'left';
		if (i === stages.length - 1) return 'right';
		return 'center';
	}

	return <Overlay>
		<div className="flex h-full stages-container">
			{
				stages.map((stage, index) => (
					<Stage
						stage={stage}
						id={index}
						key={index}
						positionH={getPosition(index)}
					>

					</Stage>
				))
			}
		</div>
	</Overlay>
}