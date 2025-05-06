import Babact from "babact"
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { useAuth } from "../../contexts/useAuth";
import { useNavigate } from "babact-router-dom";

export default function TournamentCard() {

	const { me } = useAuth();
	const navigate = useNavigate();

	if (me && me.last_tournament && me.last_tournament.active === 1 && !window.location.pathname.startsWith('/tournaments'))
	return <Card
		className="tournament-card left w-full gap-2"
	>
		<h1>
			You are currently in a clash
		</h1>

		<Button
			className="success"
			onClick={() => {
				navigate(`/tournaments/${me.last_tournament.tournament_id}`);
			}}
		>
			Go to clash <i className="fa-solid fa-people-group"></i>
		</Button>
	</Card>;
}