import Babact from "babact";
import { TournamentMatch } from "../../hooks/useTournament";
import Avatar from "../../ui/Avatar";
import Button from "../../ui/Button";
import { useUi } from "../../contexts/useUi";
import Card from "../../ui/Card";
import Modal from "../../ui/Modal";

export default function TournamentEndModal({
		isOpen,
		finalMatch,
		onClose
	} : {
		isOpen: boolean,
		finalMatch: TournamentMatch,
		onClose: () => void
	}) {
	
	const winningTeam = finalMatch?.getWinnerTeam();
	const { confetti } = useUi();

	Babact.useEffect(() => {
		if (!isOpen) return;
		confetti.addConfetti({
			confettiNumber: 500,
			confettiRadius: 4,
		});
	}, [isOpen]);

	if (winningTeam)
	return <Modal
		isOpen={isOpen}
		onClose={() => onClose()}
		className='tournament-end-modal flex flex-col items-center justify-center gap-4'
	>
		<h2><i className="fa-solid fa-trophy"></i> {winningTeam.getDisplayName()} has won the clash</h2>
		<div className='flex flex-col gap-2'>
			{winningTeam.players.map((player) => (
				<div key={player.account_id} className='flex items-center gap-2'>
					<Avatar src={player.profile.avatar} name={player.profile.username}  />
					<p>{player.profile.username}</p>
				</div>
			))}
		</div>
		<Button
			className="primary"
			onClick={() => onClose()}
		>
			<i className="fa-solid fa-xmark"></i>
			Close
		</Button>
	</Modal>
}