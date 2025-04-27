import Babact from "babact";
import { User } from "../../hooks/useUsers";
import Avatar from "../../ui/Avatar";
import Button from "../../ui/Button";

export default function SocialRequestCard({
		user, ...props
	}: {
		user: User,
		[key: string]: any
	}) {

	
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
				className='success icon'
				// onClick={() => user.accept()}
			>
				<i className="fa-solid fa-user-check"></i>
			</Button>
			<Button
				className='danger icon'
				// onClick={() => user.decline()}
			>
				<i className="fa-solid fa-user-xmark"></i>
			</Button>
			<Button
				className="info icon"
			>
				<i className="fa-solid fa-ban"></i>
			</Button>
		</div>
	</div>
}