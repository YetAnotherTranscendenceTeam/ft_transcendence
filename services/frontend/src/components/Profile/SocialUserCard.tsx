import Babact from "babact";
import { BlockedUser, FollowStatus, Friend, Request } from "../../hooks/useSocials";
import Avatar from "../../ui/Avatar";
import Button from "../../ui/Button";
import { User } from "../../hooks/useUsers";
import { useNavigate } from "babact-router-dom";
import { useAuth } from "../../contexts/useAuth";

export default function SocialUserCard({
		user,
		...props
	}: { 
		user: User,
		[key: string]: any
	}) {

	const [isLoading, setIsLoading] = Babact.useState<boolean>(false);
	const { socials } = useAuth();

	const navigate = useNavigate();

	const handleSendRequest = async (e) => {
		e.stopPropagation();
		setIsLoading(true);
		await user.request();
		setIsLoading(false);
	}

	const handleCancelRequest = async (e, request: Request) => {
		e.stopPropagation();
		setIsLoading(true);
		await request.cancel();
		setIsLoading(false);
	}

	const handleUnblock = async (e, blocked: BlockedUser) => {
		e.stopPropagation();
		setIsLoading(true);
		await blocked.unblock();
		setIsLoading(false);
	}

	const handleAcceptRequest = async (e, request: Request) => {
		e.stopPropagation();
		setIsLoading(true);
		await request.accept();
		setIsLoading(false);
	}

	const handleRemoveFriend = async (e, friend: Friend) => {
		e.stopPropagation();
		setIsLoading(true);
		await friend.remove();
		setIsLoading(false);
	}

	const getActionButton = () => {
		const isFriend = socials?.friends?.find(f => f.account_id === user.account_id);
		if (isFriend) {
			return <Button
				className="danger"
				onClick={(e) => handleRemoveFriend(e, isFriend)}
				loading={isLoading}
			>
				<i className="fa-solid fa-user-minus"></i> Remove Friend
			</Button>
		}
		const isBlocked = socials?.blocked?.find(b => b.account_id === user.account_id);
		if (isBlocked) {
			return <Button
				className="danger"
				onClick={(e) => handleUnblock(e, isBlocked)}
				loading={isLoading}
			>
				<i className="fa-solid fa-user-xmark"></i> Unblock
			</Button>
		}
		const isRequestSend = socials?.pending.sent?.find(r => r.account_id === user.account_id);
		if (isRequestSend) {
			return <Button
				className="danger"
				onClick={(e) => handleCancelRequest(e, isRequestSend)}
				loading={isLoading}
			>
				<i className="fa-solid fa-user-xmark"></i> Cancel Request
			</Button>
		}
		const isRequestRecieved = socials?.pending.received?.find(r => r.account_id === user.account_id);
		if (isRequestRecieved) {
			return <Button
				className="success"
				onClick={(e) => handleAcceptRequest(e, isRequestRecieved)}
				loading={isLoading}
			>
				<i className="fa-solid fa-user-check"></i> Accept Request
			</Button>
		}
		return <Button
			className="success"
			onClick={(e) => handleSendRequest(e)}
			loading={isLoading}
		>
			<i className="fa-solid fa-user-plus"></i> Send Request
		</Button>
	}


	return <div
		className='social-manager-follow-card flex flex-row items-center justify-between gap-2 w-full'
		onClick={() => navigate(`/profiles/${user.account_id}`)}
	>
		<div className='flex flex-row items-center gap-2'>
			<Avatar
				src={user.avatar}
				name={user.username}
			/>
			<div className='flex flex-col gap-1'>
				<h1>{user.username}</h1>
			</div>
		</div> 
		<div className='flex flex-row items-center gap-2'>
			{getActionButton()}
		</div>
	</div>

}