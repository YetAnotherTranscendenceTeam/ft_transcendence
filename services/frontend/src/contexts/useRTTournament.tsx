import Babact from "babact";
import { ITournamentMatch, MatchState, Tournament, TournamentMatch } from "../hooks/useTournament";
import { ITeam } from "yatt-lobbies";
import useSSE from "../hooks/useSSE";
import { useAuth } from "./useAuth";
import config from "../config";
import useToast, { ToastType } from "../hooks/useToast";
import { useNavigate } from "babact-router-dom";

const RTTournamentContext = Babact.createContext<{
	matches: TournamentMatch[],
	currentMatch: TournamentMatch,
	tournament_id: number,
	connect: (tournamentId: number) => void,
	ended: number,
	close: () => void,
}>();

export const RTTournamentProvider = ({ children } : {children?: any}) => {

	const [matches, setMatches] = Babact.useState<TournamentMatch[]>([]);
	const [currentMatch, setCurrentMatch] = Babact.useState<TournamentMatch>(null);
	const tournamentId = Babact.useRef<number>(null);
	const [tournamentEndId, setTournamentEndId] = Babact.useState<number>(null);
	const { createToast } = useToast();
	const teamsRef = Babact.useRef<ITeam[]>([]);
	const { me } = useAuth();
	const navigate = useNavigate();

	const onSync = ({tournament} : {tournament: Tournament}) => {
		console.log('Tournament sync', tournament);
		setTournamentEndId(null);
		tournamentId.current = tournament.id;
		teamsRef.current = tournament.teams;
		const matches = tournament.matches.map((match) => (
			new TournamentMatch(match, tournament.teams)
		));
		setMatches(matches);
	}

	const onMatchUpdate = ({match}: {match: ITournamentMatch}) => {
		setMatches((prevMatches) => {
			const newMatch = new TournamentMatch(match, teamsRef.current);
			prevMatches[match.index] = newMatch;
			return [...prevMatches];
		})
	}

	const onFinish = () => {
		setTimeout(() => {
			console.log('Tournament finished');
			navigate(`/tournaments/${tournamentId.current}`);
			setTournamentEndId(tournamentId.current);
			tournamentId.current = null;
			setMatches([]);
		}, 7000);
	}

	const sse = useSSE({
		onEvent: {
			sync: onSync,
			match_update: onMatchUpdate,
			finish: onFinish
		},
	});

	const connect = (tournamentId: number) => {
		if (sse.connected)
			return;
		sse.connect(`${config.API_URL}/matchmaking/tournaments/${tournamentId}/notify`, true);
	}

	Babact.useEffect(() => {
		if (me && me.last_tournament?.active) {
			connect(me.last_tournament.tournament_id);
		}
		if (!me && sse.connected) {
			sse.close();
		}
	}, [me?.account_id]);

	Babact.useEffect(() => {
		const newCurrentMatch = matches.find((match) => match.state === MatchState.PLAYING && match.isPlayerIn(me?.account_id)) ?? null;
		setCurrentMatch(newCurrentMatch);
		if (newCurrentMatch) {
			createToast(`Match started against ${newCurrentMatch.getOpponentTeamName(me?.account_id)}`, ToastType.INFO);
		}
	}, [matches?.length, ...matches?.map((match) => match.state)]);

	return (
		<RTTournamentContext.Provider
			value={{
				matches,
				currentMatch,
				tournament_id: tournamentId.current,
				connect,
				ended: tournamentEndId,
				close: () => setTournamentEndId(null),
			}}
		>
			{children}
		</RTTournamentContext.Provider>
	);
};

export const useRTTournament = () => {
	return Babact.useContext(RTTournamentContext);
};