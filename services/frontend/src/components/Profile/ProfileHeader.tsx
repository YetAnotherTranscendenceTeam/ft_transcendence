import Babact from "babact";
import { User } from "../../hooks/useUsers";
import Avatar from "../../ui/Avatar";
import ProfileSocialButtons from "./ProfileSocialButtons";
import { useAuth } from "../../contexts/useAuth";

export default function ProfileHeader({
		user,
	}: {
		user: User
	}) {


	const { me } = useAuth();

	return <div className='profile-header flex flex-row items-center justify-between w-full'>
		<div className='flex flex-row items-center gap-4'>
			<Avatar
				name={user.username}
				src={user.avatar}
				size="xxl"
			/>
			<h1>{user.username}</h1>
		</div>
		{me.account_id !== user.account_id && <ProfileSocialButtons user={user} />}
	</div>
}