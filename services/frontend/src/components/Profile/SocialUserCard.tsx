import Babact from "babact";
import { FollowStatus } from "../../hooks/useSocials";
import Avatar from "../../ui/Avatar";
import Button from "../../ui/Button";
import { User } from "../../hooks/useUsers";
import { useNavigate } from "babact-router-dom";

export default function SocialUserCard({
		user,
		...props
	}: { 
		user: User,
		[key: string]: any
	}) {

	const [isLoading, setIsLoading] = Babact.useState<boolean>(false);

	const navigate = useNavigate();

	const handleFollow = async (e) => {
		e.stopPropagation();
		setIsLoading(true);
		const res = await user.follow();
		if (!res)
			setIsLoading(false);
	}

	return <div
		className='social-manager-follow-card flex flex-row items-center justify-between gap-2 w-full'
		onClick={() => navigate(`/profile/${user.account_id}`)}
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
			<Button
				className='success'
				onClick={(e) => handleFollow(e)}
				loading={isLoading}
			>
				<i class="fa-solid fa-user-plus"></i> Follow
			</Button>
		</div>
	</div>

}