import Babact from "babact";
import Button from "../../ui/Button";
import Avatar from "../../ui/Avatar";
import Input from "../../ui/Input";
import { Form } from "../../contexts/useForm";
import useUsers, { IUser } from "../../hooks/useUsers";
import { useAuth } from "../../contexts/useAuth";
import { FollowStatus } from "../../hooks/useFollows";

export default function SocialManager({ className = '', children, ...props }: { className?: string, children?: any }) {

	const [selected, setSelected] = Babact.useState('follow');

	const { follows } = useAuth();

	const {users, fetchUsersMatched, isLoading, followUser} = useUsers();

	const handleSearch = (e: any) => {
		fetchUsersMatched(e.target.value);
	}

	return <div className={`social-manager ${className}`} {...props}>
		<div className='social-manager-tabbar flex flex-row'>
			<Button className={`ghost ${selected === 'follow' ? 'selected' : ''}`} onClick={() => setSelected('follow')}>
				<i className="fa-solid fa-user-group"></i> Follow
				<p>
					{follows.filter(f => f.status === FollowStatus.ONLINE).length ?? '0'}/{follows.length}
				</p>
			</Button>
			<Button className={`ghost ${selected === 'add' ? 'selected' : ''}`} onClick={() => setSelected('add')}>
				<i className="fa-solid fa-user-plus"></i> Add
			</Button>
		</div>
		<div className='social-manager-content flex flex-row gap-4'>
		<div className={`social-manager-tab scrollbar flex flex-col gap-2 ${selected === 'follow' ? 'open' : ''}`}>
				{
					follows.length ? follows.map((follow) => <div className='social-manager-follow-card flex flex-row items-center justify-between gap-2 w-full'>
						<div className='flex flex-row items-center gap-2'>
							<Avatar
								src={follow.profile.avatar}
								name={follow.profile.username}
								status={follow.status}
							/>
							<div className='flex flex-col gap-1'>
								<h1>{follow.profile.username}</h1>
								<h2>{follow.status}</h2>
							</div>
						</div> 
						<div className='flex flex-row items-center gap-2'>
							<Button className='danger' onClick={() => follow.unfollow(follow.profile.account_id)}>
								<i class="fa-solid fa-user-minus"></i> Unfollow
							</Button>
						</div>
					</div>)
					: <div className='flex flex-col w-full items-center justify-center h-full gap-4'>
						No follows yet
						<Button className="primary" onClick={() => setSelected('add')}>
							Add one now <i className="fa-solid fa-plus"></i>
						</Button>
					</div>
				}
			</div>
			<div className={`social-manager-tab social-manager-add flex flex-col gap-2 ${selected === 'add' ? 'open' : ''}`}>
				<Form formFields={['username']}>
					<Input
						field='username'
						placeholder='Username'
						onInput={handleSearch}
					/>
				</Form>
				<div className='social-manager-add-list flex scrollbar flex-col gap-1 h-full'>
					{
						users.length !== 0 && users.map((follow) => <div className='social-manager-follow-card flex flex-row items-center justify-between gap-2 w-full'>
							<div className='flex flex-row items-center gap-2'>
								<Avatar src={follow.avatar} name={follow.username}/>
								<h1>{follow.username}</h1>
							</div> 
							<div className='flex flex-row items-center gap-2'>
								<Button
									className='success'
									onClick={() => followUser(follow)}
								>
									<i class="fa-solid fa-user-plus"></i> Follow
								</Button>
							</div>
						</div>)

					}
					{
						users.length === 0 && <div className='flex flex-col w-full items-center justify-center h-full gap-4'>
							No user found
						</div>
					}
				</div>
			</div>
		</div>
	</div>
}