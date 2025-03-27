import Babact from "babact";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { Form } from "../../contexts/useForm";
import useUsers from "../../hooks/useUsers";
import { Follow, StatusType } from "../../hooks/useSocials";
import SocialUserCard from "./SocialUserCard";
import { useAuth } from "../../contexts/useAuth";
import SocialFollowCard from "./SocialFollowCard";

export default function SocialManager({ className = '', children, ...props }: { className?: string, children?: any }) {

	const [selected, setSelected] = Babact.useState<string>('follow');

	const {users, search} = useUsers();

	const { me, follows } = useAuth();

	const handleSearch = (e) => {
		search(e.target.value, 20, follows.map(f => f.account_id).concat(me.account_id));
	};

	Babact.useEffect(() => {
		if (me && follows.length)
			search('', 20, follows.map(f => f.account_id).concat(me.account_id));
	}, [me, follows]);

	const sortFollows = (follows: Follow[]) => {
		return follows.sort((a, b) => {
			const order = [StatusType.INLOBBY, StatusType.INGAME, StatusType.ONLINE, StatusType.INACTIVE, StatusType.OFFLINE];
			return order.indexOf(a.status.type) - order.indexOf(b.status.type);
		});
	};


	return <div className={`social-manager ${className}`} {...props}>
		<div className='social-manager-tabbar flex flex-row'>
			<Button className={`ghost ${selected === 'follow' ? 'selected' : ''}`} onClick={() => setSelected('follow')}>
				<i className="fa-solid fa-user-group"></i> Follow
				<p>
					{follows.filter(f => f.status.type !== StatusType.OFFLINE).length ?? '0'}/{follows.length}
				</p>
			</Button>
			<Button className={`ghost ${selected === 'add' ? 'selected' : ''}`} onClick={() => setSelected('add')}>
				<i className="fa-solid fa-user-plus"></i> Add
			</Button>
		</div>
		<div className='social-manager-content flex flex-row gap-4'>
		<div className={`social-manager-tab scrollbar flex flex-col gap-2 ${selected === 'follow' ? 'open' : ''}`}>
				{
					follows.length ?
					sortFollows(follows).map((follow, i) =>
						<SocialFollowCard
							key={follow.account_id}
							follow={follow}
						/>
					):
					<div className='flex flex-col w-full items-center justify-center h-full gap-4'>
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
						users.length !== 0 &&
						users.map((user, i) => (
							<SocialUserCard
								key={user.account_id}
								user={user}
							/>
						))

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