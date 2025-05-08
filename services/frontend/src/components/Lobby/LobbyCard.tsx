import Babact from "babact";
import Card from "../../ui/Card";
import './lobby.css'
import Button from "../../ui/Button";
import { useLobby } from "../../contexts/useLobby";
import Avatar from "../../ui/Avatar";
import { useNavigate } from "babact-router-dom";
import { useAuth } from "../../contexts/useAuth";
import LobbyStatus from "./LobbyStatus";
import CopyButton from "../../ui/CopyButton";
import LobbySettings from "./LobbySettings";
import { GameModeType, QueueStatus } from "yatt-lobbies";
import PopHover from "../../ui/PopHover";
import Dropdown from "../../ui/Dropdown";

export default function LobbyCard() {

	const { lobby, setOnLeave } = useLobby();

	const navigate = useNavigate();

	const { me } = useAuth();

	const onLeave = () => {
		setOnLeave(() => (() => {}));
	}

	if (!me)
		return;
	
	if (!lobby)
		return;

	const copyText = `**Join me in _YetAnotherPong_!** 🎮  \nClick the link to enter the game lobby: [Join the game](${window.location.origin}/lobby/${lobby.join_secret}?username=${me.username}&avatar=${me.avatar}&gamemode=${lobby.mode.type}%20${lobby.mode.getDisplayName()})`
	
	const queueStatus = lobby.canQueue();

	const  queueErrors: string[] = [];
	queueErrors[QueueStatus.BAD_LOBBY] = "Lobby does not meet queue requirements";
	queueErrors[QueueStatus.FEW_TEAMS] = "Clashes require at least three teams";
	queueErrors[QueueStatus.NO_OPPONENT] = "Custom games require an opposing team";
	queueErrors[QueueStatus.UNCOMPLETE_TEAM] = "Lobby contains an imcomplete team";

	return <Card className='lobby-card left gap-4'>
		<div className='lobby-card-header flex items-center justify-between w-full gap-4'>
			<div className='flex gap-4'>
				<div className='flex flex-col gap-1'>
					<h1>{lobby.mode.getDisplayName()}</h1>
					<h2>{lobby.mode.type}</h2>
				</div>
				{ !window.location.pathname.startsWith('/lobby') &&
					<Button
						className="icon primary"
						onClick={() => navigate(`/lobby/${lobby.join_secret}`)}
					>
						<i className="fa-solid fa-square-arrow-up-right"></i>
					</Button>
				}
			</div>
			<div className='flex flex-col gap-2 items-end'>
				<LobbyStatus state={lobby.state} />
				<h2>
					{lobby.players.length}/{lobby.getCapacity()} Players
				</h2>
			</div>
		</div>
		<div className='lobby-card-body flex gap-1'>
			{lobby.players.map((player: any, i) => {
				if (player.profile)
					return <Dropdown
						openButton={
							<Avatar
								key={i}
								src={player.profile.avatar}
								name={player.profile.username}
								className={player.account_id === lobby.leader_account_id ? 'leader' : ''}
								>
							</Avatar>
						}
						openButtonClassName='clear'
						pos="top"
					>
						<div className='lobby-avatar-dropdown flex flex-col gap-2'>
							<h1>{player.profile.username}</h1>
							<Button
								className="info"
								onClick={() => {
									navigate(`/profiles/${player.account_id}`);
								}}
							>
								<i className="fa-solid fa-user"></i>
								Profile
							</Button>
							{ me && lobby.leader_account_id === me.account_id && player.account_id !== me.account_id &&
								<Button
									className="danger"
									onClick={() => {
										lobby.kickPlayer(player.account_id);
									}}
								>
									<i className="fa-solid fa-user-minus"></i>
									Kick
								</Button>
							}
						</div>
					</Dropdown>
			
			})}
		</div>
		{
			(lobby.mode.type === GameModeType.TOURNAMENT || lobby.mode.type === GameModeType.CUSTOM) && me && lobby.leader_account_id === me.account_id &&
			<LobbySettings lobby={lobby} />
		}
		<div className='lobby-card-footer flex gap-2'>
			{ me && lobby.leader_account_id === me.account_id &&
				((lobby.state.type === 'queued' &&
					<Button
						className="danger"
						onClick={() => lobby.queueStop()}	
					>
						<i className="fa-solid fa-stop"></i>
						Stop
					</Button> 
				) ||
				(lobby.state.type === 'waiting' &&
					<PopHover
						content={queueStatus !== QueueStatus.CAN_QUEUE ? <p className='w-max'>{queueErrors[queueStatus] || queueErrors[QueueStatus.BAD_LOBBY]}</p> : null}>
					<Button
						className="success" 
						onClick={() => lobby.queueStart()}	
						disabled={queueStatus !== QueueStatus.CAN_QUEUE}
					>
						<i className="fa-solid fa-play"></i>
						Start
					</Button>
					</PopHover>
				))
			}
			{lobby.getCapacity() > 1 && <CopyButton
				className="info"
				clipboardText={copyText}
			>
				<i className="fa-solid fa-link"></i>
				Link
			</CopyButton>}
			<Button className="danger" onClick={onLeave}>
				<i className="fa-solid fa-person-walking-arrow-right"></i>
				Leave
			</Button>
		</div>
	</Card>
}