import Babact from "babact";
import Overlay from "../templates/Overlay";
import { ITeam } from "yatt-lobbies";

interface Match {
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
			scrores: []
		},
		{
			teams_id: [5],
			scrores: []
		},
		{
			teams_id: [3, 4],
			scrores: []
		},
		{
			teams_id: [0, 1],
			scrores: []
		},
	];

	let rounds: Match[][] = [];

	const createRound = (teams: ITeam[]) => {
		const nbRounds = Math.log2(teams.length);
		for(let i = 0; i < nbRounds; i++) {
			const start = Math.pow(2, i) - 1;
			const end = start + Math.pow(2, i);
			rounds.push(tournament.slice(start, end));
		}
	
	}
	createRound(teams)
	console.log(rounds);

	return <Overlay>
		<div className="flex flex-col items-center justify-center h-full">
			<h1 className="text-4xl font-bold">Tournament</h1>
		</div>
	</Overlay>
}