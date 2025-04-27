import Babact from "babact";
import Button from "../../ui/Button";
import { BlockedUser } from "../../hooks/useSocials";
import Avatar from "../../ui/Avatar";

export default function SocialBlockedCard({
		user,
		...props
	}: {
		user: BlockedUser,
		[key: string]: any
	}) {

	const [isLoading, setIsLoading] = Babact.useState<boolean>(false);

	const handleUnBlocked = async (e) => {
		e.stopPropagation();
		setIsLoading(true);
		const res = await user.unblock();
		if (!res)
			setIsLoading(false);
	}

	return <div
			className={`request-card flex flex-row items-center justify-between gap-2`}
			{...props}
		>
			<div className='flex flex-row items-center gap-2'>
				<Avatar
					src={user.avatar}
					name={user.username}
				/>
				<h1>{user.username}</h1>
			</div>
	
	
			<div
				className='flex flex-row items-center gap-2'
			>
				<Button
					loading={isLoading}
					className='success'
					onClick={(e) => handleUnBlocked(e)}
				>
					<i className="fa-solid fa-user-xmark"></i> Unblock
				</Button>
			</div>
		</div>
}