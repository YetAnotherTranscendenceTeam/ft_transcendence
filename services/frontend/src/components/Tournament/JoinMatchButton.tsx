import Babact from "babact";
import Button from "../../ui/Button";
import { useNavigate } from "babact-router-dom";
import { Match } from "../../hooks/useTournament";

export default function JoinMatchButton({
		match,
		opponent,
		timeout,
		onTimeout
	}: {
		match: Match,
		opponent: string,
		timeout: Date,
		onTimeout: () => void
	}) {
	
	const navigate = useNavigate();
	const [timeRemaining, setTimeRemaining] = Babact.useState(10);

	Babact.useEffect(() => {
		const interval = setInterval(() => {
			if (!timeout) return;
			const now = new Date();
			const timeLeft = timeout.getTime() - now.getTime();
			if (timeLeft <= 0) {
				clearInterval(interval);
				setTimeRemaining(null);
				onTimeout();
			} else {
				setTimeRemaining(Math.floor(timeLeft / 1000));
			}
		}, 250);

		return () => clearInterval(interval);
	}, [match, timeout]);

	return <Button
		className="match-join-button success"
		onClick={() => navigate(`/matches/${match.match_id}`)}
		key={match.match_id}
		loading={timeRemaining <= 0}
	>
		<i className="fa-solid fa-play"></i> Join match against {opponent} {timeRemaining > 0 && `(${timeRemaining}s)`}
	</Button>

}