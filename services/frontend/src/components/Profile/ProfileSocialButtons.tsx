import Babact from "babact";
import { User } from "../../hooks/useUsers";
import Button from "../../ui/Button";
import { useAuth } from "../../contexts/useAuth";

export default function ProfileSocialButtons({
		user,
	}: {
		user: User
	}) {

	const { socials } = useAuth();

	
	if (!socials)
		return;
	const isBlocked = socials.blocked.find((blockedUser) => blockedUser.account_id === user.account_id);
	const isFriend = socials.friends.find((friend) => friend.account_id === user.account_id);
	const isSent = socials.pending.sent.find((friend) => friend.account_id === user.account_id);

	return <div
		className='flex flex-row items-center gap-4'
	>
		{
			!isFriend && !isSent && !isBlocked &&
			<Button
				key="add-friend"
				className="success"
				onClick={() => {
					user.request();
				}}
			>
				<i className="fa-solid fa-user-plus"></i> Add friend
			</Button>
		}
		{isSent &&
			<Button
				key="cancel-request"
				className="success"
				onClick={() => {
					isSent.cancel();
				}}
			>
				<i className="fa-solid fa-user-clock"></i> Waiting for response
			</Button>
		}
		{isFriend &&
			<Button
				key="remove-friend"
				className='danger'
				onClick={() => {
					isFriend.remove();
				}}
			>
				<i className="fa-solid fa-user-minus"></i> Remove friend
			</Button>
		}
		{isBlocked ? 
			<Button
				key="unblock"
				className="danger"
				onClick={() => isBlocked.unblock()}
			>
				<i className="fa-solid fa-ban"></i> Unblock
			</Button>
			:
			<Button
				key="block"
				className="info"
				onClick={() => user.block()}
			>
				<i className="fa-solid fa-ban"></i> Block
			</Button>
		}
	</div>

}