import Babact from "babact";
import { IGameMode, ITeam } from "yatt-lobbies";
import { useAuth } from "../contexts/useAuth";
import useSSE from "./useSSE";
import config from "../config";
import useFetch from "./useFetch";

export enum MatchState {
	WAITING = 'waiting',
	PLAYING = 'playing',
	DONE = 'done'
}

export interface IMatch {
	team_ids: number[]
	scores: number[]
	match_id?: number
	state: MatchState
	stage: number
	index: number
}

export interface Tournament {
	matches: Match[]
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

	getDisplayName() {
		if (this.name)
			return this.name;
		if (this.players.length > 0)
			return this.players[0].profile.username + "'s team";
		return 'Unknown';
	}

}

export class Match implements IMatch {
	team_ids: number[];
	scores: number[];
	teams: Team[];
	match_id: number;
	state: MatchState;
	stage: number;
	index: number;

	constructor(match: IMatch, teams: ITeam[]) {
		this.team_ids = match.team_ids;
		this.scores = match.scores;
		this.match_id = match.match_id;
		this.state = match.state;
		this.stage = match.stage;
		this.index = match.index;
		this.teams = match.team_ids.map((index: number) => new Team(teams[index]));
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
		return this.teams.find((team) => !team.players.some((member) => member.account_id === account_id));
	}

	getOpponentTeamName(account_id: number) {
		return this.getOpponentTeam(account_id).getDisplayName()
	}
}

export default function useTournament(tournamentId: number, onFinishCallback: (isOpen: boolean) => void) {

	const teamsRef = Babact.useRef<ITeam[]>([]);
	const [matches, setMatches] = Babact.useState<Match[]>([]);
	const [currentMatch, setCurrentMatch] = Babact.useState<Match>(null);
	const { me } = useAuth();
	const { ft_fetch } = useFetch();

	const fetchTournament = async () => {
		const response = await ft_fetch(`${config.API_URL}/matchmaking/tournaments/${tournamentId}`, {}, {
			show_error: true
		});
		if (response)
			onSync({tournament: response});
		if (response?.active === 1)
			sse.connect(`${config.API_URL}/matchmaking/tournaments/${tournamentId}/notify?token=${localStorage.getItem('access_token')}`)
	}

	const onSync = ({tournament} : {tournament: Tournament}) => {
		teamsRef.current = tournament.teams;
		const matches = tournament.matches.map((match) => (
			new Match(match, tournament.teams)
		));
		setMatches(matches);
	}

	const onMatchUpdate = ({match}: {match: IMatch}) => {
		setMatches((prevMatches) => {
			const newMatch = new Match(match, teamsRef.current);
			prevMatches[match.index] = newMatch;
			return [...prevMatches];
		})
	}

	const onFinish = () => {
		onFinishCallback(true);
	}

	const sse = useSSE({
		onEvent: {
			sync: onSync,
			match_update: onMatchUpdate,
			finish: onFinish
		},
	});

	Babact.useEffect(() => {
		if (me) {
			onFinishCallback(false);
			fetchTournament();
		}
	}, [me?.account_id, tournamentId]);

	Babact.useEffect(() => {
		const newCurrentMatch = matches.find((match) => match.state === MatchState.PLAYING && match.isPlayerIn(me?.account_id)) ?? null;
		setCurrentMatch(newCurrentMatch);
	}, [matches?.length, ...matches?.map((match) => match.state)]);

	return {
		matches,
		currentMatch,
		sse
	}
}