import Babact from "babact";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { Form } from "../../contexts/useForm";
import useUsers, { User } from "../../hooks/useUsers";
import { Friend, StatusType } from "../../hooks/useSocials";
import SocialUserCard from "./SocialUserCard";
import { useAuth } from "../../contexts/useAuth";
import SocialFollowCard from "./SocialFriendCard";
import SegmentedControl from "../../ui/SegmentedControl";
import Accordion from "../../ui/Accordion";
import Label from "../../ui/Label";
import SocialRequestCard from "./SocialRequestCard";
import useFetch from "../../hooks/useFetch";
import SocialFriendCard from "./SocialFriendCard";
import SocialBlockedCard from "./SocialBlockCard";

export default function SocialManager({ className = '', children, ...props }: { className?: string, children?: any }) {

	const [selected, setSelected] = Babact.useState<string>('follow');

	const {users, search} = useUsers();

	const { me, socials } = useAuth();

	const handleSearch = (e) => {
		search(e.target.value, 20, socials.friends.map(f => f.account_id).concat(me.account_id));
	};

	Babact.useEffect(() => {
		if (me)
			search('', 20, [me.account_id]);
	}, [me]);

	const sortFollows = (follows: Friend[]) => {
		return follows.sort((a, b) => {
			const order = [StatusType.INLOBBY, StatusType.INGAME, StatusType.ONLINE, StatusType.INACTIVE, StatusType.OFFLINE];
			return order.indexOf(a.status.type) - order.indexOf(b.status.type);
		});
	};

	if (!socials)
		return null;
	return <div className={`social-manager ${className}`} {...props}>
		<div className='social-manager-tabbar flex flex-row'>
			<Button className={`ghost ${selected === 'follow' ? 'selected' : ''}`} onClick={() => setSelected('follow')}>
				<i className="fa-solid fa-user-group"></i> Friends
				{/* <p>
					{follows.filter(f => f.status.type !== StatusType.OFFLINE).length ?? '0'}/{follows.length}
				</p> */}
			</Button>
			<Button className={`ghost ${selected === 'search' ? 'selected' : ''}`} onClick={() => setSelected('search')}>
				<i className="fa-solid fa-magnifying-glass"></i> Search
			</Button>
		</div>
		<div className='social-manager-content flex flex-row gap-4'>
			<div className={`social-manager-tab scrollbar flex flex-col gap-2 ${selected === 'follow' ? 'open' : ''}`}>
				<Accordion
					openDefault={socials?.pending.received.length > 0}
					openButton={<>
						<i className="fa-solid fa-clock"></i> Pending 
							{socials?.pending.received.length > 0 && <Label>{socials.pending.received.length}</Label>}
						</>}
				>
					{socials && socials.pending.received.length + socials.pending.sent.length === 0 && <div className='social-manager-empty flex flex-col gap-2'>
						No pending friend request
					</div>}
					{socials && socials.pending.received.length + socials.pending.sent.length > 0 &&  <div
						className='social-manager-user-list flex flex-col gap-1'
						key='pending'
					>
						{
							socials?.pending.received.length > 0 &&
							<div
								key='pending-received'
								className='flex flex-col gap-1'
							>
								<h2>Received request</h2>
								{
									socials?.pending.received.map((request, i) =>
										<SocialRequestCard
											requestType="recieved"
											key={request.account_id}
											request={request}
										/>
									)
								}
							</div>
						}
						{
							socials?.pending.sent.length > 0 &&
							<div
								key='pending-sent'
								className='flex flex-col gap-1'
							>
								<h2>Sent request</h2>
								{
									socials?.pending.sent.map((request, i) =>
										<SocialRequestCard
											requestType="sent"
											key={request.account_id}
											request={request}
										/>
									)
								}
							</div>
						}
					</div>}
				</Accordion>

				<Accordion
					openDefault={true}
					openButton={<><i className="fa-solid fa-user-group"></i> Friends</>}
				>
					{ socials?.friends.length === 0 && <div className='social-manager-empty flex flex-col gap-2'>
						No friend yet
					</div>
					}
					{
						socials?.friends.length > 0 &&
						<div
							className='social-manager-user-list flex flex-col gap-1'
						>
							{
								socials?.friends.map((request, i) =>
									<SocialFriendCard
										key={request.account_id}
										friend={request}
									/>
								)
							}
						</div>
					}
				</Accordion>
				<Accordion
					openButton={<><i className="fa-solid fa-ban"></i> Blocked</>}
				>
					{socials?.blocked.length === 0 && <div className='social-manager-empty flex flex-col gap-2'>
						No blocked user
					</div>}
					{
						socials?.blocked.length > 0 &&
						<div
							className='social-manager-user-list flex flex-col gap-1'
						>
							{
								socials?.blocked.map((user, i) =>
									<SocialBlockedCard
										key={user.account_id}
										user={user}
									/>
								)
							}
						</div>
					}
				</Accordion>
			</div>
			<div className={`social-manager-tab social-manager-add flex flex-col gap-2 ${selected === 'search' ? 'open' : ''}`}>
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