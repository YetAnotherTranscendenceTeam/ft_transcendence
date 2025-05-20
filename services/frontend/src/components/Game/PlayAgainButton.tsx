import Babact from "babact";
import { usePong } from "../../contexts/usePong";
import { PongState } from "pong";
import Button from "../../ui/Button";
import { useRTTournament } from "../../contexts/useRTTournament";
import { useLobby } from "../../contexts/useLobby";
import { useAuth } from "../../contexts/useAuth";
import { useNavigate } from "babact-router-dom";

export default function PlayAgainButton() {

	const { overlay, restartGame } = usePong();
	const { lobby, create } = useLobby();
	const { me } = useAuth();
	const RTTournament = useRTTournament();
	const navigate = useNavigate();

	const disabled = !overlay.local && !RTTournament.tournament_id && lobby && lobby.leader_account_id !== me?.account_id;

	const handlePlayAgain = () => {
		if (overlay.local && restartGame) {
			restartGame();
		}
		else if (RTTournament.tournament_id) {
			navigate(`/tournaments/${RTTournament.tournament_id}`);
		}
		else if (window.location.pathname.startsWith('/spectate/')) {
			navigate('/');
		}
		else if (lobby && lobby.state.joinable) {
			lobby.queueStart();
		}
		else if (!overlay.local) {
			create(overlay.gamemode.name);
		}
	}

	const getButtonText = () => {
		if (RTTournament.tournament_id) {
			return 'Go back to clash';
		}
		if (window.location.pathname.startsWith('/spectate/')) {
			return 'Leave spectator mode';
		}
		if (disabled) {
			return 'Waiting for lobby leader...';
		}
		return 'Play again';
	}

	if (!overlay || overlay?.gameStatus.name !== PongState.ENDED.name )
		return null;
	return <div className='flex gap-4'>
	<Button
		disabled={disabled}
		className="primary"
		onClick={() => handlePlayAgain()}
		>
		<i className="fa-solid fa-arrow-rotate-left"></i>
		{getButtonText()}
	</Button>
	{
		disabled && <Button
			className="danger"
			onClick={() => {
				lobby.leave();
				navigate('/');
			}}
		>
			<i className="fa-solid fa-person-walking-arrow-right"></i>
			Leave lobby
		</Button>
	}
	</div>
}