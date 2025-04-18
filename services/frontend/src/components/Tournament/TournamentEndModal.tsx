import Babact from "babact";
import { Match } from "../../hooks/useTournament";
import Avatar from "../../ui/Avatar";
import JSConfetti from "js-confetti";
import Button from "../../ui/Button";

export default function TournamentEndModal({
		finalMatch,
		onClose
	} : {
		finalMatch: Match,
		onClose: () => void
	}) {
	
	const winningTeam = finalMatch?.getWinnerTeam();
	const teamName = winningTeam.name ?? winningTeam?.players[0]?.profile?.username + "'s team";

	Babact.useEffect(() => {
		const confetti = new JSConfetti();
		confetti.addConfetti({
			confettiNumber: 500,
			confettiRadius: 4,
		});
	}, []);

	if (winningTeam)
	return <div className='tournament-end-modal flex flex-col items-center justify-center gap-4'>
		<h2><i className="fa-solid fa-trophy"></i> {teamName} has won the tournament</h2>
		<div className='flex flex-col gap-2'>
			{winningTeam.players.map((player) => (
				<div key={player.account_id} className='flex items-center gap-2'>
					<Avatar src={player.profile.avatar} name={player.profile.username}  />
					<p>{player.profile.username}</p>
				</div>
			))}
		</div>
		<Button
			onClick={() => onClose()}
		>
			Close
		</Button>
	</div>
}