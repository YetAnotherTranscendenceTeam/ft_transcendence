import Babact from "babact";
import Overlay from "../templates/Overlay";
import Tree from "../components/Tournament/Tree";
import { useParams } from "babact-router-dom";
import { useAuth } from "../contexts/useAuth";
import useToast, { ToastType } from "../hooks/useToast";
import JoinMatchButton from "../components/Tournament/JoinMatchButton";
import useTournament, { MatchState } from "../hooks/useTournament";
import TournamentEndModal from "../components/Tournament/TournamentEndModal";

export default function TournamentView() {


	const { id } = useParams();
	const { matches, currentMatch } = useTournament(id, () => setIsOpen(true));
	const [isOpen, setIsOpen] = Babact.useState(false);

	const timeoutRef = Babact.useRef<Date>(null);
	const { me } = useAuth();
	const { createToast } = useToast();

	Babact.useEffect(() => {
		console.log('currentMatch', currentMatch);
		if (currentMatch) {
			createToast(`Match against ${currentMatch.getOpponentTeamName(me.account_id)} is starting!`, ToastType.SUCCESS, 5000);
			timeoutRef.current = new Date(new Date().getTime() + 10000);
		}
	}, [currentMatch?.match_id]);

	const tournamentWinner = (matches.length > 0 && matches[0].state === MatchState.DONE && matches[0]) || null;

	return <Overlay
		modal={isOpen && <TournamentEndModal
			onClose={() => setIsOpen(false)}
			finalMatch={tournamentWinner}
		/>}
	>
		<div
			className='tournament-view scrollbar'
		>
			{currentMatch && <JoinMatchButton
				match={currentMatch}
				opponent={currentMatch.getOpponentTeamName(me.account_id)}
				timeout={timeoutRef.current}
				onTimeout={() => {
					timeoutRef.current = null;
					// navigate(`/matches/${currentMatch.match_id}`);
					createToast(`Joinning match against ${currentMatch.getOpponentTeamName(me.account_id)}!`, ToastType.SUCCESS, 5000);
				}}
			/>}
			{matches && matches.length > 0 && <Tree matches={matches} />}
		</div>
	</Overlay>
}