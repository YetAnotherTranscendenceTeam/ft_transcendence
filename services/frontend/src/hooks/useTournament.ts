import Babact from "babact";
import { IGameMode, ITeam } from "yatt-lobbies";
import { useAuth } from "../contexts/useAuth";
import useSSE from "./useSSE";
import config from "../config";

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

export class Match implements IMatch {
	team_ids: number[];
	scores: number[];
	teams: ITeam[];
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
		this.teams = match.team_ids.map((index: number) => teams[index]);
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
		const enemyTeam = this.getOpponentTeam(account_id);
		if (!enemyTeam)
			return 'Unknown';
		return enemyTeam.name ?? enemyTeam.players[0].profile.username + "'s team";
	}
}

export default function useTournament(tournamentId: number) {

	const teamsRef = Babact.useRef<ITeam[]>([]);
	const [matches, setMatches] = Babact.useState<Match[]>([]);
	const [currentMatch, setCurrentMatch] = Babact.useState<Match>(null);
	const { me } = useAuth();

	const onSync = ({tournament} : {tournament: Tournament}) => {
		console.log('sync');
		teamsRef.current = tournament.teams;
		const matches = tournament.matches.map((match) => (
			new Match(match, tournament.teams)
		));
		matches.forEach((match) => {
			if (match.state === MatchState.PLAYING && match.isPlayerIn(me?.account_id)) {
				console.log('match found', match.match_id);
				setCurrentMatch(match);
			}
		})
		setMatches(matches);
	}

	const onMatchUpdate = ({match}: {match: IMatch}) => {
		console.log('match update');
		setMatches((prevMatches) => {
			prevMatches[match.index] = new Match(match, teamsRef.current);
			if (match.state === MatchState.PLAYING && prevMatches[match.index].isPlayerIn(me?.account_id)) {
				console.log('match found', match.match_id);
				setCurrentMatch(prevMatches[match.index]);
			}
			return [...prevMatches];
		})
	}

	const onFinish = () => {
		// setTournamentEnded(true)
		console.log('Tournament finished');
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
			console.log('connecting to sse');
			sse.connect(`${config.API_URL}/matchmaking/tournaments/${tournamentId}/notify?token=${localStorage.getItem('access_token')}`)
			return () => {
				sse.close()
			};
		}
	}, [me?.account_id]);

	return {
		matches,
		currentMatch,
		sse
	}
}