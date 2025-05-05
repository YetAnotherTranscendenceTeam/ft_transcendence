import Babact from "babact";
import useFetch from "./useFetch";
import config from "../config";
import { IPlayer, ITeam } from "yatt-lobbies";

export enum MatchState {
	WAITING = 'waiting',
	PLAYING = 'playing',
	DONE = 'done'
}

export interface IMatchPlayer extends IPlayer {
    team_index?: number,
    player_index?: number,
    win_probability?: number,
    begin_rating?: number,
    end_rating?: number,
}

export class Team implements ITeam {
	players: IPlayer[];
	name: string;

	constructor(team: ITeam) {
		this.players = team.players;
		this.name = team.name;
	}

	getDisplayName() {
		if (this.name)
			return this.name;
		if (this.players.length > 1)
			return this.players[0].profile.username + "'s team";
		if (this.players.length === 1)
			return this.players[0].profile.username;
		return 'Unknown';
	}
}

export interface IMatch {
	team_ids: number[]
	scores: number[]
	match_id?: number
	state: MatchState
	stage: number
	index: number
	teams: ITeam[]
	tournament_id?: number
}

export class Match {
	scores: number[];
	teams: Team[];
	match_id: number;
	state: MatchState;
	stage: number;
	index: number;

	constructor(match: IMatch) {
		this.scores = match.scores;
		this.match_id = match.match_id;
		this.state = match.state;
		this.stage = match.stage;
		this.index = match.index;
		this.teams = match.teams.map((team) => new Team(team));
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

export default function useMatches(account_id: number, pageSize: number = 30) {

	const [matches, setMatches] = Babact.useState<Match[]>([]);
	const [page, setPage] = Babact.useState(0);

	const { ft_fetch, isLoading }  = useFetch();

	const fetchMatches = async () => {
		const response = await ft_fetch(`${config.API_URL}/matchmaking/users/${account_id}/matches?offset=${page * pageSize}&limit=${pageSize}`, {}, {
			show_error: true,
			success_message: 'Matches loaded',
		});
		if (response) {
			console.log('Matches', response);
		}
	}

	Babact.useEffect(() => {
		fetchMatches();
	}, [page]);

	return {
		matches,
		page,
		setPage,
		isLoading
	}
}