import Babact from "babact";
import Button from "../../ui/Button";
import { useNavigate } from "babact-router-dom";
import { TournamentMatch } from "../../hooks/useTournament";
import { useAuth } from "../../contexts/useAuth";

export default function JoinMatchButton({
		match,
	}: {
		match: TournamentMatch,
	}) {

	
	const navigate = useNavigate();
	const [timeRemaining, setTimeRemaining] = Babact.useState(10);
	const [timeout, setTimeout] = Babact.useState(null);
	const { me } = useAuth();

	Babact.useEffect(() => {
		setTimeout(new Date(new Date().getTime() + 10000));
	}, [match])

	Babact.useEffect(() => {
		const interval = setInterval(() => {
			if (!timeout) return;
			const now = new Date();
			const timeLeft = timeout.getTime() - now.getTime();
			if (timeLeft <= 0) {
				clearInterval(interval);
				setTimeRemaining(null);
				navigate(`/matches/${match.match_id}`);
			} else {
				setTimeRemaining(Math.floor(timeLeft / 1000));
			}
		}, 500);
		return () => clearInterval(interval);
	}, [match, timeout]);


	Babact.useEffect(() => {
		if (timeRemaining <= 0 && !window.location.pathname.startsWith(`/matches/${match.match_id}`)) {
			setTimeout(new Date(new Date().getTime() + 5000));
		}
	}, [window.location.pathname]);

	if (!window.location.pathname.startsWith(`/matches/${match.match_id}`))
	return <Button
		className="match-join-button game"
		onClick={() => {
			navigate(`/matches/${match.match_id}`);
			setTimeout(null);
		}}
		key={match.match_id}
		loading={timeRemaining <= 0}
	>
		<i className="fa-solid fa-play"></i> Join match against {match.getOpponentTeamName(me.account_id)} {timeRemaining > 0 && `(${timeRemaining}s)`}
	</Button>

}