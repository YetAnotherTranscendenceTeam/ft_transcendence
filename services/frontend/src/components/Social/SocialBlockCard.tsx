import Babact from "babact";
import Button from "../../ui/Button";
import { BlockedUser } from "../../hooks/useSocials";
import SocialCard from "./SocialCard";

export default function SocialBlockedCard({
		user,
		...props
	}: {
		user: BlockedUser,
		[key: string]: any
	}) {

	const [isLoading, setIsLoading] = Babact.useState<boolean>(false);

	const handleUnBlocked = async (e: MouseEvent) => {
		e.stopPropagation();
		setIsLoading(true);
		const res = await user.unblock();
		if (!res)
			setIsLoading(false);
	}

	return <SocialCard
		user={user}
	>
		<Button
			loading={isLoading}
			className='success'
			onClick={(e) => handleUnBlocked(e)}
		>
			<i className="fa-solid fa-user-xmark"></i> Unblock
		</Button>
	</SocialCard>
		
}