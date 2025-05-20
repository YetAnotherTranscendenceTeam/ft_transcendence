import Babact from "babact";
import useFetch from "./useFetch";
import config from "../config";
import { IUser } from "./useUsers";


export interface IMatchPlayer {
	account_id: number,
	team_index: number,
	player_index: number,
	win_probability: number,
	begin_rating: number,
	end_rating: number,
	created_at: string,
	updated_at: string,
	profile: IUser
}

export class MatchPlayer implements IMatchPlayer {
	account_id: number;
	team_index: number;
	player_index: number;
	win_probability: number;
	begin_rating: number;
	end_rating: number;
	created_at: string;
	updated_at: string;
	profile: IUser;
	mmr: number;

	constructor(player: IMatchPlayer) {
		this.account_id = player.account_id;
		this.team_index = player.team_index;
		this.player_index = player.player_index;
		this.win_probability = player.win_probability;
		this.begin_rating = player.begin_rating;
		this.end_rating = player.end_rating;
		this.created_at = player.created_at;
		this.updated_at = player.updated_at;
		this.profile = player.profile;
		this.mmr = this.getMMRDelta();
	}

	public getMMRDelta(): number {
		if (!this.end_rating || !this.begin_rating)
			return null;
		return this.end_rating - this.begin_rating;
	}
}

export interface IMatchTeam {
	team_index: number;
	name: string;
	score: number;
	winning: number;
}

export class Team implements IMatchTeam {

	team_index: number;
	name: string;
	score: number;
	winning: number;
	players: MatchPlayer[];

	constructor(team: IMatchTeam, players: MatchPlayer[]) {
		this.team_index = team.team_index;
		this.name = team.name;
		this.score = team.score;
		this.winning = team.winning;
		this.players = players.filter((player) => player.team_index === team.team_index);
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

export interface IMatch {
	match_id: number;
	tournament_id: number;
	gamemode: string;
	state: string;
	created_at: string;
	updated_at: string;
	teams: IMatchTeam[];
	players: IMatchPlayer[];
}




export class Match implements IMatch {
	match_id: number;
	tournament_id: number;
	gamemode: string;
	state: string;
	created_at: string;
	updated_at: string;
	teams: Team[];
	players: MatchPlayer[];
	scores: number[];
	account_id: number;

	constructor(match: IMatch, accout_id: number) {
		this.match_id = match.match_id;
		this.tournament_id = match.tournament_id;
		this.gamemode = match.gamemode;
		this.state = match.state;
		this.created_at = match.created_at;
		this.updated_at = match.updated_at;
		this.players = match.players.map((player) => new MatchPlayer(player));
		this.teams = match.teams.map((team) => new Team(team, this.players));
		this.scores = this.teams.map((team) => team.score);
		this.account_id = accout_id;
	}

	public hasPlayerWin(): boolean {
		const player = this.players.find((p) => p.account_id == this.account_id);
		if (player) {
			return this.teams[player.team_index].winning == 1;
		}
		return false;
	}

	public getGameModeName(): string {
		const gamemode = this.gamemode.split('_')[0];
		if (gamemode === 'tournament')
			return 'Clash';
		if (gamemode)
			return gamemode;
		return 'Unknown';
	}

	public getTime(): string {
		const date = new Date(this.created_at);
		if (date) {
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		}
		return '';
	}

	public getDate(): string {
		const date = new Date(this.created_at);
		if (date) {
			return date.toLocaleDateString();
		}
		return '';
	}

	public getDuration(): string {
		const startDate = new Date(this.created_at);
		const endDate = new Date(this.updated_at);
		if (startDate && endDate) {
			const diff = endDate.getTime() - startDate.getTime();
			const seconds = Math.floor(diff / 1000);
			const minutes = Math.floor(seconds / 60);
			return `${minutes}m ${seconds % 60}s`;
		}
		return '';
	}
}

export default function useMatches(account_id: number, pageSize: number = 10, filter?: string) {

	const [matches, setMatches] = Babact.useState<Match[]>([]);
	const [page, setPage] = Babact.useState(1);
	const [totalCount, setTotalCount] = Babact.useState(0);

	const { ft_fetch, isLoading }  = useFetch();

	const fetchMatches = async () => {
		const params = new URLSearchParams();
		params.append('offset', `${(page - 1) * pageSize}`);
		params.append('limit', `${pageSize}`);
		params.append('order[match_id]', 'DESC');
		params.append('filter[state]', '2');
		if (filter) {
			params.append('filter[gamemode]', filter+'_2v2');
			params.append('filter[gamemode]', filter+'_1v1');
		}
		const response = await ft_fetch(`${config.API_URL}/matchmaking/users/${account_id}/matches?${params.toString()}`, {}, {
			setTotal: setTotalCount,
		});
		if (response) {
			setMatches(response.map((match: IMatch) => new Match(match, account_id)));
		}
	}

	Babact.useEffect(() => {
		if (page >  1)
			setPage(1);
	}, [filter]);

	Babact.useEffect(() => {
		fetchMatches();
	}, [page, account_id, filter]);
	return {
		matches,
		page,
		setPage,
		totalPages: Math.ceil(totalCount / pageSize) || 1,
		isLoading
	}
}