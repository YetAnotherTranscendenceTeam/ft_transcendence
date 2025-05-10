import Babact from "babact";
import { BlockedUser, Friend, Request } from "../../hooks/useSocials";
import Button from "../../ui/Button";
import { User } from "../../hooks/useUsers";
import { useAuth } from "../../contexts/useAuth";
import SocialCard from "./SocialCard";

export default function SocialSearchCard({
		user,
		...props
	}: { 
		user: User,
		[key: string]: any
	}) {

	const [isLoading, setIsLoading] = Babact.useState<boolean>(false);
	const { socials } = useAuth();

	const handleSendRequest = async (e: MouseEvent) => {
		e.stopPropagation();
		setIsLoading(true);
		await user.request();
		setIsLoading(false);
	}

	const handleCancelRequest = async (e: MouseEvent, request: Request) => {
		e.stopPropagation();
		setIsLoading(true);
		await request.cancel();
		setIsLoading(false);
	}

	const handleUnblock = async (e: MouseEvent, blocked: BlockedUser) => {
		e.stopPropagation();
		setIsLoading(true);
		await blocked.unblock();
		setIsLoading(false);
	}

	const handleAcceptRequest = async (e: MouseEvent, request: Request) => {
		e.stopPropagation();
		setIsLoading(true);
		await request.accept();
		setIsLoading(false);
	}

	const handleRemoveFriend = async (e: MouseEvent, friend: Friend) => {
		e.stopPropagation();
		setIsLoading(true);
		await friend.remove();
		setIsLoading(false);
	}

	const getActionButton = () => {
		const isFriend = socials?.friends?.find(f => f.account_id === user.account_id);
		if (isFriend) {
			return <Button
				className="danger w-full"
				onClick={(e) => handleRemoveFriend(e, isFriend)}
				loading={isLoading}
			>
				<i className="fa-solid fa-user-minus"></i> Remove Friend
			</Button>
		}
		const isBlocked = socials?.blocked?.find(b => b.account_id === user.account_id);
		if (isBlocked) {
			return <Button
				className="danger w-full"
				onClick={(e) => handleUnblock(e, isBlocked)}
				loading={isLoading}
			>
				<i className="fa-solid fa-user-xmark"></i> Unblock
			</Button>
		}
		const isRequestSend = socials?.pending.sent?.find(r => r.account_id === user.account_id);
		if (isRequestSend) {
			return <Button
				className="danger w-full"
				onClick={(e) => handleCancelRequest(e, isRequestSend)}
				loading={isLoading}
			>
				<i className="fa-solid fa-user-xmark"></i> Cancel Request
			</Button>
		}
		const isRequestRecieved = socials?.pending.received?.find(r => r.account_id === user.account_id);
		if (isRequestRecieved) {
			return <Button
				className="success w-full"
				onClick={(e) => handleAcceptRequest(e, isRequestRecieved)}
				loading={isLoading}
			>
				<i className="fa-solid fa-user-check"></i> Accept Request
			</Button>
		}
		return <Button
			className="success w-full"
			onClick={(e) => handleSendRequest(e)}
			loading={isLoading}
		>
			<i className="fa-solid fa-user-plus"></i> Send Request
		</Button>
	}


	return <SocialCard
		user={user}
	>
		{getActionButton()}
	</SocialCard>

}