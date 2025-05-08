import Babact from "babact";
import { IGameMode, ITeam } from "yatt-lobbies";
import { useAuth } from "../contexts/useAuth";
import config from "../config";
import useFetch from "./useFetch";
import { useRTTournament } from "../contexts/useRTTournament";

export enum MatchState {
	WAITING = 'waiting',
	PLAYING = 'playing',
	DONE = 'done'
}

export interface ITournamentMatch {
	team_ids: number[]
	scores: number[]
	match_id?: number
	state: MatchState
	stage: number
	index: number
}

export interface Tournament {
	matches: TournamentMatch[]
	teams: ITeam[]
	gamemode: IGameMode
	id: number
}

export class Team implements ITeam {
	players: any[];
	name: string;

	constructor(team: ITeam) {
		this.players = team.players;
		this.name = team.name;
	}

	public getDisplayName() {
		if (this.name)
			return this.name;
		if (this.players.length > 1)
			return this.players[0].profile.username + "'s team";
		if (this.players.length === 1)
			return this.players[0].profile.username;
		return 'Unknown';
	}

}

export class TournamentMatch implements ITournamentMatch {
	team_ids: number[];
	scores: number[];
	teams: Team[];
	match_id: number;
	state: MatchState;
	stage: number;
	index: number;

	constructor(match: ITournamentMatch, teams: ITeam[]) {
		this.team_ids = match.team_ids;
		this.scores = match.scores;
		this.match_id = match.match_id;
		this.state = match.state;
		this.stage = match.stage;
		this.index = match.index;
		this.teams = match.team_ids.map((index: number) => teams[index] && new Team(teams[index]));
	}

	playerTeamIndex(account_id: number) {
		const team_index: number = this.teams.findIndex((team) => team.players.some((p) => p.account_id === account_id));
		return team_index;
	}

	isPlayerIn(account_id: number) {
		if (!account_id) return false;
		return this.teams.some((team) => team.players.some((p) => p.account_id === account_id));
	}

	getWinnerTeam() {
		return this.scores[0] > this.scores[1] ? this.teams[0] : this.teams[1];
	}

	getOpponentTeam(account_id: number) {
		return this.teams?.find((team) => !team.players.some((member) => member.account_id === account_id));
	}

	getOpponentTeamName(account_id: number) {
		const team = this.getOpponentTeam(account_id);
		if (!team) return 'Unknown';
		return team.getDisplayName()
	}
}

export default function useTournament(tournamentId: number) {

	const [matches, setMatches] = Babact.useState<TournamentMatch[]>([]);
	const { me } = useAuth();
	const { ft_fetch } = useFetch();
	const RTTournament = useRTTournament();

	const fetchTournament = async () => {
		const response = await ft_fetch(`${config.API_URL}/matchmaking/tournaments/${tournamentId}`, {});
		if (response) {
			const matches = response.matches.map((match) => (
				new TournamentMatch(match, response.teams)
			));
			setMatches(matches);
		}
	}

	Babact.useEffect(() => {
		if (me && RTTournament.tournament_id != tournamentId || RTTournament.matches.length == 0) {
			console.log('Tournament useEffect', tournamentId, RTTournament);
			fetchTournament();
		}
	}, [me?.account_id, tournamentId, RTTournament.matches]);

	return {
		matches: RTTournament.tournament_id == tournamentId ? RTTournament.matches : matches,
	}
}