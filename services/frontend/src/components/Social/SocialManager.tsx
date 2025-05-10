import Babact from "babact";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { Form } from "../../contexts/useForm";
import useUsers, { User } from "../../hooks/useUsers";
import { Friend, StatusType } from "../../hooks/useSocials";
import { useAuth } from "../../contexts/useAuth";
import './social.css'
import SocialSearchCard from "./SocialSearchCard";
import Accordion from "../../ui/Accordion";
import Label from "../../ui/Label";
import SocialRequestCard from "./SocialRequestCard";
import SocialBlockedCard from "./SocialBlockCard";
import SocialFriendCard from "./SocialFriendCard";
import Spinner from "../../ui/Spinner";

export default function SocialManager({ className = '', children, ...props }: { className?: string, children?: any, [key: string]: any }) {

	const [selected, setSelected] = Babact.useState<string>('follow');
	const timeoutRef = Babact.useRef<number>(null);
	const [isLoading, setLoading] = Babact.useState<boolean>(false);

	const {users, search} = useUsers();

	const { me, socials } = useAuth();

	const handleSearch = (e) => {
		if (timeoutRef.current)
			clearTimeout(timeoutRef.current);
		setLoading(true);
		timeoutRef.current = window.setTimeout(() => {
			setLoading(false);
			search(e.target.value, 20, [me.account_id]);
		}, 1000)
	};

	Babact.useEffect(() => {
		if (me)
			search('', 20, [me.account_id]);
	}, [me?.account_id]);

	const sortFriends = (friends: Friend[]) => {
		return friends.sort((a, b) => {
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
						<i className="fa-solid fa-clock"></i>
						Pending 
						{socials?.pending.received.length > 0 && <Label>{socials.pending.received.length}</Label>}
					</>}
				>
					{socials && socials.pending.received.length + socials.pending.sent.length === 0 &&
						<div className='social-manager-empty flex flex-col gap-2'>
							No pending friend request
						</div>
					}
					{socials && socials.pending.received.length + socials.pending.sent.length > 0 &&
						<div
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
					openButton={<>
						<i className="fa-solid fa-user-group"></i>
						Friends
						<p className='social-manager-friend-count'>
							{socials.friends.filter(f => f.status.type !== StatusType.OFFLINE).length ?? '0'}/{socials.friends.length}
						</p>
					</>}
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
								sortFriends(socials?.friends).map((request, i) =>
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
				<Form formFields={['username']} className="social-manager-search-form">
					<Input
						field='username'
						placeholder='Username'
						onInput={handleSearch}
						autocomplete="off"
					/>
					{isLoading && <Spinner />}
				</Form>
				<div className='social-manager-add-list flex scrollbar flex-col gap-1 h-full'>
					{
						users.length !== 0 &&
						users.map((user, i) => (
							<SocialSearchCard
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