import Babact from "babact";
import { Follow, StatusType } from "../../hooks/useSocials";
import Avatar from "../../ui/Avatar";
import Button from "../../ui/Button";
import FollowTypeText from "./FollowTypeText";
import { Lobby } from "yatt-lobbies";
import { useLobby } from "../../contexts/useLobby";
import useToast, { ToastType } from "../../hooks/useToast";
import { useAuth } from "../../contexts/useAuth";
import { useNavigate } from "babact-router-dom";
import Dropdown from "../../ui/Dropdown";

export default function SocialFollowCard({
		follow,
		...props
	}: { 
		follow: Follow,
		[key: string]: any
	}) {

	const { createToast } = useToast();

	const inLobby = follow.status.type === StatusType.INLOBBY && follow.status.data && new Lobby(follow.status.data);
	
	const { lobby } = useLobby();

	const { me } = useAuth();

	const navigate = useNavigate();

	const [inviteSend, setInviteSend] = Babact.useState<boolean>(false);
	const [loading, setLoading] = Babact.useState<boolean>(false);

	const inviteLobby = (follow.status.type === StatusType.ONLINE || follow.status.type === StatusType.INACTIVE)
		&& !inviteSend
		&& !lobby?.players.find(p => p.account_id === follow.account_id)
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
		follow.invite(inviteLobby.mode, inviteLobby.join_secret);
		setInviteSend(true);
		createToast(`You invited ${follow.profile.username} to your lobby`, ToastType.SUCCESS);
	}

	const handleRequest = (e: MouseEvent) => {
		e.stopPropagation();
		follow.request();
		setInviteSend(true);
		createToast(`You requested to join ${follow.profile.username}'s lobby`, ToastType.SUCCESS);
	}

	const handleUnFollow = async (e: MouseEvent) => {
		e.stopPropagation();
		setLoading(true);
		const res = await follow.unfollow();
		if (!res)
			setLoading(false);
	}


	return <div
		className='social-manager-follow-card flex flex-row items-center justify-between gap-2 w-full'
		onClick={() => navigate(`/profiles/${follow.account_id}`)}
	>
		<div className='flex flex-row items-center gap-2'>
			<Avatar
				src={follow.profile.avatar}
				name={follow.profile.username}
				status={ follow.status.type }
			>
				<Button className='follow-remove icon'
					onClick={(e) => handleUnFollow(e)}
					loading={loading}
				>
					<i className="fa-solid fa-user-minus"></i>
				</Button>
			</Avatar>
			<div className='flex flex-col gap-1'>
				<h1>{follow.profile.username}</h1>
				<FollowTypeText type={follow.status.type} />
			</div>
		</div>
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
					className='danger'
				>
					<i className="fa-solid fa-user-minus"></i> Remove
				</Button>
				<Button
					className='info'
					onClick={() => {
						navigate(`/profiles/${follow.account_id}`);
					}}
				>
					<i className="fa-solid fa-user"></i> Profile
				</Button>
				<Button
					className="danger"
				>
					<i className="fa-solid fa-ban"></i> Block
				</Button>
			</div>
		</Dropdown>
	</div>

}