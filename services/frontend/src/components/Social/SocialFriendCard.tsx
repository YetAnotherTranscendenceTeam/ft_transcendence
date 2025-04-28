import Babact from "babact";
import { Friend, StatusType } from "../../hooks/useSocials";
import Button from "../../ui/Button";
import { Lobby } from "yatt-lobbies";
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

	const inLobby = friend.status.type === StatusType.INLOBBY && friend.status.data && new Lobby(friend.status.data);
	
	const { lobby } = useLobby();

	const { me } = useAuth();

	const navigate = useNavigate();

	const [inviteSend, setInviteSend] = Babact.useState<boolean>(false);
	const [loading, setLoading] = Babact.useState<boolean>(false);

	const inviteLobby = (friend.status.type === StatusType.ONLINE || friend.status.type === StatusType.INACTIVE)
		&& !inviteSend
		&& !lobby?.players.find(p => p.account_id === friend.account_id)
		&& lobby?.getCapacity() > lobby?.players.length
		&& lobby;

	const isRequestable = inLobby
		&& inLobby.players.length < inLobby.getCapacity()
		&& !inLobby.players.find(p => p.account_id === me.account_id)
		&& !inviteSend;

	Babact.useEffect(() => {
		setInviteSend(false);
	}, [lobby]);

	const handleInvite = (e: MouseEvent) => {
		e.stopPropagation();
		friend.invite(inviteLobby.mode, inviteLobby.join_secret);
		setInviteSend(true);
		createToast(`You invited ${friend.profile.username} to your lobby`, ToastType.SUCCESS);
	}

	const handleRequest = (e: MouseEvent) => {
		e.stopPropagation();
		friend.request();
		setInviteSend(true);
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
	>
		{inLobby && isRequestable &&
			<Button
			onClick={(e) => handleRequest(e)}
			className="follow-lobby-request"
			>
				<i className="fa-regular fa-hand"></i> Request to join
			</Button>
		}

		{ inLobby &&
			<div className={`follow-lobby-status flex gap-4 justify-between ${isRequestable ? 'requestable' : ''}`}>
				<div className='flex flex-col gap-1'>
					<h1>{inLobby.mode.getDisplayName()}</h1>
					<h2>{inLobby.mode.type}</h2>
				</div>
				<p>
					{inLobby.players.length}/{inLobby.getCapacity()}
				</p>
			</div>
		}

		{inviteLobby &&
			<div className='flex flex-row items-center gap-2'>
				<Button className='info' onClick={(e) => handleInvite(e)}>
					<i className="fa-regular fa-paper-plane"></i> Invite to lobby
				</Button>
			</div>
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
					onClick={(e) => handleRemove(e)}
					className='danger'
					loading={loading}
					>
					<i className="fa-solid fa-user-minus"></i> Remove
				</Button>
				<Button
					className='info'
					onClick={() => {
						navigate(`/profiles/${friend.account_id}`);
					}}
					
					>
					<i className="fa-solid fa-user"></i> Profile
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