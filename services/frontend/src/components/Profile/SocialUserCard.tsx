import Babact from "babact";
import { Follow, FollowStatus } from "../../hooks/useSocials";
import Avatar from "../../ui/Avatar";
import Button from "../../ui/Button";
import { User } from "../../hooks/useUsers";

export default function SocialUserCard({
		user,
		status,
		unfollow,
		...props
	}: { 
		user: User,
		status?: FollowStatus,
		unfollow?: () => void,
		[key: string]: any
	}) {

	const [isLoading, setIsLoading] = Babact.useState(false);

	const handleFollow = async () => {
		setIsLoading(true);
		await user.follow();
		setIsLoading(false);
	}

	return <div className='social-manager-follow-card flex flex-row items-center justify-between gap-2 w-full'>
		<div className='flex flex-row items-center gap-2'>
			<Avatar
				src={user.avatar}
				name={user.username}
				status={status ?? null}
			/>
			<div className='flex flex-col gap-1'>
				<h1>{user.username}</h1>
				{status && <h2>{status}</h2>}
			</div>
		</div> 
		<div className='flex flex-row items-center gap-2'>
			{unfollow ?
				<Button className='danger' onClick={() => unfollow()}>
					<i class="fa-solid fa-user-minus"></i> Unfollow
				</Button>:
				<Button
					className='success'
					onClick={() => handleFollow()}
					loading={isLoading}
				>
					<i class="fa-solid fa-user-plus"></i> Follow
				</Button>
			}
		</div>
	</div>

}