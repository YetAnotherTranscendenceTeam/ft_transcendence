import Babact from "babact"
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { useAuth } from "../../contexts/useAuth";
import { useNavigate } from "babact-router-dom";
import { useRTTournament } from "../../contexts/useRTTournament";
import JoinMatchButton from "./JoinMatchButton";

export default function TournamentCard() {

	const { me } = useAuth();
	const navigate = useNavigate();
	const tournament = useRTTournament();

	if (me && tournament.tournament_id)
	return <Card
		className="tournament-card left w-full gap-2"
	>
		<h1>You are currently in a clash</h1>

		<Button
			className="tournament"
			onClick={() => {
				navigate(`/tournaments/${me.last_tournament.tournament_id}`);
			}}
		>
			Go to clash <i className="fa-solid fa-people-group"></i>
		</Button>
		{tournament.currentMatch && <JoinMatchButton
			match={tournament.currentMatch}
		/>}
	</Card>;
}