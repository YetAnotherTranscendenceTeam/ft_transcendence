import Babact from "babact";
import { User } from "../../hooks/useUsers";
import Avatar from "../../ui/Avatar";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import { Follow } from "../../hooks/useSocials";
import { useAuth } from "../../contexts/useAuth";

export default function UserCard({
		user
	}: {
		user: User
	}) {

	const [follow, setFollow] = Babact.useState<Follow>(undefined);

	const { follows, me } = useAuth();

	Babact.useEffect(() => {
		const follow = follows?.find(f => f.account_id === user.account_id);
		if (follow) {
			setFollow(follow);
		}
		else if (user.account_id !== me?.account_id) {
			setFollow(null);
		}
		else {
			setFollow(undefined);
		}
	}, [follows, user.account_id]);

	return <Card className='user-card'>
		<div className="flex flex-row gap-2 items-center">
			<Avatar src={user.avatar} size="lg" name={user.username}/>
			<h1>
				{user.username}
			</h1>

			{
				follow !== undefined && (follow ?
				<Button
					className="secondary"
					onClick={() => follow.unfollow()}
				>
					<i key='unfollow' class="fa-solid fa-user-minus"></i> Unfollow
				</Button>:
				<Button
					className="primary"
					onClick={() => user.follow()}
				>
					<i key='follow' class="fa-solid fa-user-plus"></i> Follow
				</Button>)
			}
		</div>
	</Card>
}