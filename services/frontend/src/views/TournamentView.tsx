import Babact from "babact";
import Overlay from "../templates/Overlay";
import { ITeam } from "yatt-lobbies";
import Tree from "../components/Tournament/Tree";
import useFetch from "../hooks/useFetch";
import useSSE from "../hooks/useSSE";
import { IGameMode } from "yatt-lobbies";
import config from "../config";
import { useNavigate, useParams } from "babact-router-dom";
import { useAuth } from "../contexts/useAuth";

export enum MatchState {
	WAITING = 'waiting',
	PLAYING = 'playing',
	DONE = 'done'
}

export interface Match {
	team_ids: number[]
	scores: number[]
	teams?: ITeam[]
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

export default function TournamentView() {


	const teamsRef = Babact.useRef<ITeam[]>([]);
	const [matches, setMatches] = Babact.useState<Match[]>([]);
	const { id: tournamentId } = useParams();
	const { me } = useAuth();
	const navigate = useNavigate();
	
	function isMyCurrentMatch(match: Match) {
		return match.teams.some((team) => team.players.some((member) => member.account_id === me?.account_id));
	}

	const onSync = ({tournament} : {tournament: Tournament}) => {
		teamsRef.current = tournament.teams;
		const matches = tournament.matches.map((match) => ({
			...match,
			teams: match.team_ids.map((index: number) => teamsRef.current[index]),
		}));
		matches.forEach((match) => {
			if (match.state === MatchState.PLAYING && isMyCurrentMatch(match)) {
				navigate('/matches/' + match.match_id);
			}
		})
		setMatches(matches);
	}

	const onMatchUpdate = ({match} : {match: Match}) => {
		setMatches((prevMatches) => {
			console.log(match);
			match.teams = match.team_ids.map((index: number) => teamsRef.current[index]);
			prevMatches[match.index] = match;
			if (match.state === MatchState.PLAYING && isMyCurrentMatch(match)) {
				navigate('/matches/' + match.match_id);
			}
			return [...prevMatches];
		})
	}

	const onFinish = () => {
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
		sse.connect(`${config.API_URL}/matchmaking/tournaments/${tournamentId}/notify?token=${localStorage.getItem('access_token')}`)
		return sse.close;
	}, []);

	return <Overlay>
		<div
			className='tournament-view scrollbar'
		>
			<Tree matches={matches} />
		</div>
	</Overlay>
}