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
import Modal from "../ui/Modal";
import Avatar from "../ui/Avatar";
import useToast, { ToastType } from "../hooks/useToast";
import Button from "../ui/Button";

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

	isPlayerIn(account_id: number) {
		if (!account_id) return false;
		return this.teams.some((team) => team.players.some((p) => p.account_id === account_id));
	}

	getWinnerTeam() {
		return this.scores[0] > this.scores[1] ? this.teams[0] : this.teams[1];
	}
}


export default function TournamentView() {


	const teamsRef = Babact.useRef<ITeam[]>([]);
	const [matches, setMatches] = Babact.useState<Match[]>([]);
	const [tournamentEnded, setTournamentEnded] = Babact.useState<boolean>(false);
	const timeoutRef = Babact.useRef<number>(null);
	const { id: tournamentId } = useParams();
	const { me } = useAuth();
	const [currentMatch, setCurrentMatch] = Babact.useState<Match>(null);
	const { createToast } = useToast();
	const navigate = useNavigate();

	console.log('me', me)

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
		setTournamentEnded(true)
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
	
	const enemyTeam = currentMatch?.teams.find((team) => !team.players.some((member) => member.account_id === me?.account_id));
	Babact.useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (currentMatch) {
			createToast(`Match against ${enemyTeam.name} is starting!`, ToastType.SUCCESS, 5000);
			// timeout = setTimeout(() => {
			// 	navigate(`/matches/${currentMatch.match_id}`);
			// 	timeoutRef.current = new Date().getTime() + 10000;
			// }, 10000);
			// return () => {
			// 	clearTimeout(timeout);
			// }
		}
	}, [currentMatch]);

	console.log('matches', matches);
	console.log('currentMatch', currentMatch);
	console.log('enemyTeam', enemyTeam);

	return <Overlay>
		<div
			className='tournament-view scrollbar'
		>
			{currentMatch && <Button
				className="tournament-join-button success"
				onClick={() => navigate(`/matches/${currentMatch.match_id}`)}
			>
				<i className="fa-solid fa-play"></i> Join match against {enemyTeam.name ?? enemyTeam.players[0].profile.username}
			</Button>}
			{/* <Modal isOpen={tournamentEnded} onClose={() => setTournamentEnded(false)}>
				<div className='modal-content'>
					<h2>Tournament finished</h2>
					<p>Congratulations to the winners!</p>
					<div className='flex flex-col'>
						{getWinnerTeam(matches[matches.length - 1])?.players.map((player) => (
							<div key={player.account_id} className='flex items-center'>
								<Avatar size={'md'} name={player.profile.username} src={player.profile.avatar} />
								<p>{player.profile.username}</p>
							</div>
						))}
					</div>
					<button className='button' onClick={() => setTournamentEnded(false)}>Close</button>
				</div>
			</Modal> */}
			{sse.connected && matches.length > 0 && <Tree matches={matches} />}
		</div>
	</Overlay>
}