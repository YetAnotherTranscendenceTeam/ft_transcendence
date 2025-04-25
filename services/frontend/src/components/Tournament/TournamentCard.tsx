import Babact from "babact"
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { useAuth } from "../../contexts/useAuth";
import { useNavigate } from "babact-router-dom";

export default function TournamentCard() {

	const { me } = useAuth();
	const naviagte = useNavigate();


	if (!me || (me && me.last_tournament && me.last_tournament.active === 0) || window.location.pathname.startsWith('/tournaments'))
		return;
	return <Card
		className="tournament-card left w-full gap-2"
	>
		<h1>
			You'r currently in a tournament
		</h1>

		<Button
			className="success"
			onClick={() => {
				naviagte(`/tournaments/${me.last_tournament.tournament_id}`);
			}}
		>
			Go to tournament <i className="fa-solid fa-people-group"></i>
		</Button>
	</Card>;
}