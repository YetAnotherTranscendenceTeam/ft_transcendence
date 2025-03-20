import Babact from "babact";
import { Follow, StatusType } from "../../hooks/useSocials";
import Avatar from "../../ui/Avatar";
import Button from "../../ui/Button";
import FollowTypeText from "./FollowTypeText";
import { Lobby } from "yatt-lobbies";
import { useLobby } from "../../contexts/useLobby";

export default function SocialFollowCard({
		follow,
		...props
	}: { 
		follow: Follow,
		[key: string]: any
	}) {

	const inLobby = follow.status.type === StatusType.INLOBBY && follow.status.data && new Lobby(follow.status.data);
	
	const { lobby } = useLobby();
	const inviteLobby = (follow.status.type === StatusType.ONLINE || follow.status.type === StatusType.INACTIVE) && lobby;


	return <div className='social-manager-follow-card flex flex-row items-center justify-between gap-2 w-full'>
		<div className='flex flex-row items-center gap-2'>
			<Avatar
				src={follow.profile.avatar}
				name={follow.profile.username}
				status={ follow.status.type }
			/>
			<div className='flex flex-col gap-1'>
				<h1>{follow.profile.username}</h1>
				<FollowTypeText type={follow.status.type} />
			</div>
		</div>
		{ inLobby &&
			<div className='follow-lobby-status flex gap-4 justify-between'>
				<div className='flex flex-col gap-1'>
					<h1>{inLobby.mode.getDisplayName()}</h1>
					<h2>{inLobby.mode.type}</h2>
				</div>
				<p>
					{inLobby.players.length}/{inLobby.getCapacity()}
				</p>
			</div>
		}

		{inviteLobby && <div className='flex flex-row items-center gap-2'>
			<Button className='info' onClick={() => follow.invite(inviteLobby.mode, inviteLobby.join_secret)}>
				<i className="fa-regular fa-paper-plane"></i> Invite
			</Button>
		</div>}

		{/* <div className='flex flex-row items-center gap-2'>
			<Button className='danger' onClick={() => follow.unfollow()}>
				<i class="fa-solid fa-user-minus"></i> Unfollow
			</Button>
		</div> */}
	</div>

}