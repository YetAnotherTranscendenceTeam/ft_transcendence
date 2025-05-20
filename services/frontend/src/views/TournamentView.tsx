import Babact from "babact";
import Tree from "../components/Tournament/Tree";
import { useNavigate, useParams } from "babact-router-dom";
import { useAuth } from "../contexts/useAuth";
import useToast from "../hooks/useToast";
import useTournament, { MatchState } from "../hooks/useTournament";
import TournamentEndModal from "../components/Tournament/TournamentEndModal";
import { usePong } from "../contexts/usePong";
import { GameScene } from "../components/Babylon/types";
import { useRTTournament } from "../contexts/useRTTournament";
import ErrorView from "./ErrorView";

export default function TournamentView() {

	const { id } = useParams();
	const { me } = useAuth();
	if (!me) {
		return <ErrorView errorMessage="You must be logged in" errorCode={401} />
	}

	const { matches } = useTournament(id);
	const { ended, close } = useRTTournament();
	const [isOpen, setIsOpen] = Babact.useState(false);

	const { app } = usePong();

	Babact.useEffect(() => {
		app.setGameScene(GameScene.MENU);
	}, [])

	Babact.useEffect(() => {
		if (ended == id) {
			setIsOpen(true);
		}
		if (!ended) {
			setIsOpen(false);
		}
	}, [ended]);

	if (matches.length === 0) {
		return <ErrorView errorMessage="Clash not found" errorCode={404} />
	}

	const tournamentWinner = (matches.length > 0 && matches[0].state === MatchState.DONE && matches[0]) || null;
	return <div
		className='tournament-view scrollbar'
	>
		{matches && matches.length > 0 && <Tree matches={matches} />}
		<TournamentEndModal
			isOpen={isOpen}
			onClose={() => close()}
			finalMatch={tournamentWinner}
		/>
	</div>
}