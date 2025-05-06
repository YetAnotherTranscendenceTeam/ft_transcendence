import Babact from "babact";
import { Friend, StatusType } from "../../hooks/useSocials";
import Button from "../../ui/Button";
import { GameMode, ILobbyState, LobbyStateType } from "yatt-lobbies";
import { useLobby } from "../../contexts/useLobby";
import useToast, { ToastType } from "../../hooks/useToast";
import { useAuth } from "../../contexts/useAuth";
import { useNavigate } from "babact-router-dom";
import Dropdown from "../../ui/Dropdown";
import SocialCard from "./SocialCard";

export default function SocialFriendCard({
		friend,
		...props
	}: { 
		friend: Friend,
		[key: string]: any
	}) {

	const { createToast } = useToast();

	const isInLobby = (friend.status.type === StatusType.INLOBBY) && friend.status.data && new GameMode(friend.status.data.gamemode);
	const isInGame = (friend.status.type === StatusType.INGAME) && friend.status.data && new GameMode(friend.status.data.gamemode);
	
	const { lobby } = useLobby();

	const { me } = useAuth();

	const navigate = useNavigate();

	const [loading, setLoading] = Babact.useState<boolean>(false);

	const isInvitable = (friend.status.type === StatusType.ONLINE || friend.status.type === StatusType.INACTIVE)
		&& !lobby?.players.find(p => p.account_id === friend.account_id)
		&& lobby?.getCapacity() > lobby?.players.length;

	const isRequestable = isInLobby
		&& friend.status.data.player_ids.length < isInLobby.getLobbyCapacity()
		&& !friend.status.data.player_ids.find(account_id => account_id === me.account_id)
		&& (friend.status.data.state as ILobbyState).joinable === true

	const handleInvite = (e: MouseEvent) => {
		e.stopPropagation();
		friend.invite(lobby.mode, lobby.join_secret);
		createToast(`You invited ${friend.profile.username} to your lobby`, ToastType.SUCCESS);
	}

	const handleRequest = (e: MouseEvent) => {
		e.stopPropagation();
		friend.request();
		createToast(`You requested to join ${friend.profile.username}'s lobby`, ToastType.SUCCESS);
	}

	const handleRemove = async (e: MouseEvent) => {
		e.stopPropagation();
		setLoading(true);
		const res = await friend.remove();
		if (!res)
			setLoading(false);
	}

	const handleBlock = async (e: MouseEvent) => {
		e.stopPropagation();
		setLoading(true);
		const res = await friend.profile.block();
		if (!res)
			setLoading(false);
	}

	return <SocialCard
		user={friend.profile}
		type={friend.status.type}
		className='social-friend-card justify-end'
	>

		{ isInLobby &&
			<div className={`social-friend-card-status flex justify-between w-full ${isRequestable ? 'requestable' : ''}  ${friend.status.type}`}>
				<div className='flex flex-col gap-1'>
					<h1>{isInLobby.getDisplayName()}</h1>
					<h2>{isInLobby.getDisplayTypeName()}</h2>
				</div>
				<p>
					{friend.status.data.player_ids.length}/{isInLobby.getLobbyCapacity()}
				</p>
				{isRequestable &&
					<Button
					onClick={(e) => handleRequest(e)}
					className="social-friend-card-button"
					>
						<i className="fa-regular fa-hand"></i> Request
					</Button>
				}
			</div>
		}

		{ isInGame &&
			<div className={`social-friend-card-status flex justify-between w-full ${isRequestable ? 'requestable' : ''} ${friend.status.type}`}>
				<div className='flex flex-col gap-1'>
					<h1>{isInGame.getDisplayName()}</h1>
					<h2>{isInGame.getDisplayTypeName()}</h2>
				</div>
			</div>
		}

		{isInvitable &&
			<Button className='info w-full' onClick={(e) => handleInvite(e)}>
				<i className="fa-regular fa-paper-plane"></i> Invite
			</Button>
		}
		<Dropdown
			openButton={<i className="fa-solid fa-ellipsis-vertical"></i>}
			openButtonClassName='icon'
			className='social-follow-card-dropdown'
			>
			<div
				className='social-follow-card-dropdown-content flex flex-col gap-2 w-max'
				>
				<Button
					className='info'
					onClick={() => {
						navigate(`/profiles/${friend.account_id}`);
					}}
					
					>
					<i className="fa-solid fa-user"></i> Profile
				</Button>
				<Button
					onClick={(e) => handleRemove(e)}
					className='danger'
					loading={loading}
					>
					<i className="fa-solid fa-user-minus"></i> Remove
				</Button>
				<Button
					className="danger"
					loading={loading}
					onClick={(e) => handleBlock(e)}
					>
					<i className="fa-solid fa-ban"></i> Block
				</Button>
			</div>
		</Dropdown>
	</SocialCard>
}