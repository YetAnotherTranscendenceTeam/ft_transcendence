import Babact from "babact";
import Overlay from "../templates/Overlay";
import Tree from "../components/Tournament/Tree";
import { useNavigate, useParams } from "babact-router-dom";
import { useAuth } from "../contexts/useAuth";
import useToast, { ToastType } from "../hooks/useToast";
import JoinMatchButton from "../components/Tournament/JoinMatchButton";
import useTournament from "../hooks/useTournament";

export default function TournamentView() {


	const { id } = useParams();
	const { sse, matches, currentMatch } = useTournament(id);

	const timeoutRef = Babact.useRef<Date>(null);
	const { me } = useAuth();
	const { createToast } = useToast();
	const navigate = useNavigate();

	
	Babact.useEffect(() => {
		if (currentMatch) {
			createToast(`Match against ${currentMatch.getOpponentTeamName(me.account_id)} is starting!`, ToastType.SUCCESS, 5000);
			timeoutRef.current = new Date(new Date().getTime() + 10000);
		}
	}, [currentMatch]);

	return <Overlay>
		<div
			className='tournament-view scrollbar'
		>
			{currentMatch && <JoinMatchButton
				match={currentMatch}
				opponant={currentMatch.getOpponentTeamName(me.account_id)}
				timeout={timeoutRef.current}
				onTimeout={() => {
					timeoutRef.current = null;
					// navigate(`/matches/${currentMatch.match_id}`);
					createToast(`Joinning match against ${currentMatch.getOpponentTeamName(me.account_id)}!`, ToastType.SUCCESS, 5000);
				}}
			/>}
			{/* <Modal isOpen={tournamentEnded} onClose={() => setTournamentEnded(false)}>
				<div className='modal-content'>
					<h2>Tournament finished</h2>
					<p>Congratulations to the winners!</p>
					<div className='flex flex-col'>
						{getWinnerTeam(matches[matches.length - 1])?.players.map((player) => (
							<div key={player.account_id} className='flex items-center'>
								<Avatar size={'md'} name={player.profile.username} src={player.profile.avatar} />
								<p>{player.profile.username}</p>
							</div>
						))}
					</div>
					<button className='button' onClick={() => setTournamentEnded(false)}>Close</button>
				</div>
			</Modal> */}
			{sse.connected && matches.length > 0 && <Tree matches={matches} />}
		</div>
	</Overlay>
}