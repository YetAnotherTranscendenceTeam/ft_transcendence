import Babact from "babact";
import Card from "../../ui/Card";
import './lobby.css'
import Button from "../../ui/Button";
import { useLobby } from "../../contexts/useLobby";
import Avatar from "../../ui/Avatar";
import { useNavigate } from "babact-router-dom";
import { useAuth } from "../../contexts/useAuth";
import LobbyStatus from "./LobbyStatus";


export default function LobbyCard() {

	const { lobby } = useLobby();

	const navigate = useNavigate();

	const { me } = useAuth();

	const onLeave = () => {
		lobby.leave();
	}

	if (lobby)
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
					return <Avatar
							key={i}
							src={player.profile.avatar}
							name={player.profile.username}
							className={player.account_id === lobby.leader_account_id ? 'leader' : ''}
						>
							{ me && lobby.leader_account_id === me.account_id && player.account_id !== me.account_id &&
								<Button
									className="kick-button icon ghost"
									onClick={() => lobby.kickPlayer(player.account_id)}
								>
									<i className="fa-solid fa-ban"></i>
								</Button>}
						</Avatar>
			
			})}
		</div>
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
					<Button
						className="success"
						onClick={() => lobby.queueStart()}	
					>
						<i className="fa-solid fa-play"></i>
						Start
					</Button>
				))
			}
			<Button className="danger" onClick={onLeave}>
				<i className="fa-solid fa-sign-out"></i>
				Leave
			</Button>
		</div>
	</Card>
}