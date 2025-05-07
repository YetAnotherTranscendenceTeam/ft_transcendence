import Babact from "babact";
import { ITournamentMatch, MatchState, Tournament, TournamentMatch } from "../hooks/useTournament";
import { ITeam } from "yatt-lobbies";
import useSSE from "../hooks/useSSE";
import { useAuth } from "./useAuth";
import config from "../config";

const RTTournamentContext = Babact.createContext<{
	matches: TournamentMatch[],
	currentMatch: TournamentMatch,
	tournament_id: number,
	connect: (tournamentId: number) => void,
}>();

export const RTTournamentProvider = ({ children } : {children?: any}) => {

	const [matches, setMatches] = Babact.useState<TournamentMatch[]>([]);
	const [currentMatch, setCurrentMatch] = Babact.useState<TournamentMatch>(null);
	const [tournamentId, setTournamentId] = Babact.useState<number>(null);
	const teamsRef = Babact.useRef<ITeam[]>([]);
	const { me } = useAuth();

	const onSync = ({tournament} : {tournament: Tournament}) => {
		console.log('Tournament sync', tournament);
		setTournamentId(tournament.id);
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
		console.log('Tournament finished');
		setTournamentId(null);
		setMatches([]);
		// onFinishCall	back(true);
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
	}, [matches?.length, ...matches?.map((match) => match.state)]);

	return (
		<RTTournamentContext.Provider
			value={{
				matches,
				currentMatch,
				tournament_id: tournamentId,
				connect,
			}}
		>
			{children}
		</RTTournamentContext.Provider>
	);
};

export const useRTTournament = () => {
	return Babact.useContext(RTTournamentContext);
};