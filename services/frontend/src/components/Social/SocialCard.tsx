import Babact from "babact";
import { StatusType } from "../../hooks/useSocials";
import Avatar from "../../ui/Avatar";
import { User } from "../../hooks/useUsers";
import { useNavigate } from "babact-router-dom";
import SocialTypeText from "./SocialTypeText";

export default function SocialCard({
		user,
		children,
		type,
		className = '',
		...props
	}: { 
		user: User,
		children?: any,
		type?: StatusType,
		className?: string,
		[key: string]: any
	}) {

	const navigate = useNavigate();

	return <div
		className={`social-manager-user-card flex flex-row items-center justify-between gap-1 w-full`}
	>
		<div className={`social-manager-user-card-header flex flex-row items-center gap-2`}
			onClick={() => navigate(`/profiles/${user.account_id}`)}
		>
			<Avatar
				src={user.avatar}
				name={user.username}
				status={type ?? null}
			/>
			<div className='social-manager-user-card-user flex flex-col gap-1'>
				<h1>{user.username}</h1>
				{type && <SocialTypeText type={type} />}
			</div>
		</div> 
		<div className={`social-manager-user-card-content flex flex-row items-center justify-end gap-2 ${className}`}>
			{children}
		</div>
	</div>

}