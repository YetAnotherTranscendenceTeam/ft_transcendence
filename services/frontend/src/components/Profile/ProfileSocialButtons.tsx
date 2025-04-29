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

	return <div
		className='flex flex-row items-center'
	>
		{isBlocked ? 
		<Button
			className="danger"
			onClick={() => isBlocked.unblock()}
		>
			<i className="fa-solid fa-ban"></i> Unblock
		</Button>
		:
		<Button
			className="info"
			onClick={() => user.block()}
		>
			<i className="fa-solid fa-ban"></i> Block
		</Button>}
	</div>

}