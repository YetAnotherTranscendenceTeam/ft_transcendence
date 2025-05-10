import Babact from "babact";
import Card from "../../ui/Card";
import useEscape from "../../hooks/useEscape";
import useMatch from "../../hooks/useMatch";
import Spinner from "../../ui/Spinner";
import Button from "../../ui/Button";
import { useNavigate } from "babact-router-dom";
import Avatar from "../../ui/Avatar";

export default function ProfileGameDrawer({
		match_id,
		onClose,
	}: {
		match_id: number;
		onClose: () => void;
		[key: string]: any;
	}) {

	useEscape(match_id !== null, onClose);
	const { match, isLoading } = useMatch(match_id);
	const navigate = useNavigate();

	return <Card className={`profile-game-drawer left flex flex-col items-center justify-center h-full gap-4 ${match_id ? 'open' : ''}`}>
		{!match || isLoading ? <Spinner/> : <div className="flex flex-col w-full h-full gap-4 scrollbar">
			<div className="profile-game-drawer-header flex flex-col w-full gap-2">
				<h1>
					Match details
				</h1>
				<div className="flex flex-row items-center justify-between w-full">
					<p>{match.getDate()} - {match.getTime()}</p>
					<p>{match.getDuration()}</p>
				</div>
			</div>
			{
				match.tournament_id && !window.location.pathname.startsWith(`/tournaments/${match.tournament_id}`) && <Button
					className="success"
					onClick={() => {
						navigate(`/tournaments/${match.tournament_id}?match_id=${match.match_id}`);
					}}
				>
					View tournament bracket
				</Button>
			}
			{
				match.teams && match.teams.length > 0 && match.teams.map((team, index) => (
				<div className="profile-game-drawer-team flex flex-col w-full gap-4" key={team.team_index}>
					<div className='flex w-full items-center justify-between'>
						<h1>{team.players.length > 1 && team.name ? team.name : `Team ${index+1}`}</h1>
						<h3>
							Score: {team.score}
						</h3>
					</div>
					{team.players.map((player) => (
						<div
							className="profile-game-drawer-player flex flex-col items-center justify-start gap-2 w-full" key={player.account_id}
							onClick={() => {
								navigate(`/profiles/${player.account_id}`);
							}}
						>
							<div className="flex flex-row items-center justify-start gap-2 w-full">
								<Avatar
									name={player.profile.username}
									src={player.profile.avatar}
									size="md"
								/>
								<h2>
									{player.profile.username}
								</h2>
								{player.mmr !== null && <h3 className={`profile-game-drawer-player-mmr ${player.mmr > 0 ? 'positive' : 'negative'}`}>
									{player.mmr > 0 ? '+' : ''}
									{Math.floor(player.mmr)}
								</h3>}
							</div>
						</div>
					))}
				</div>))
			}
		</div>}
		<div className="profile-game-drawer-footer flex flex-row items-center justify-end w-full">
			<Button onClick={() => onClose()}>
				<i className="fa-solid fa-xmark"></i>
				Close
			</Button>
		</div>
	</Card>

}