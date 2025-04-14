import Babact from "babact";
import Overlay from "../templates/Overlay";
import { useParams } from "babact-router-dom";
import useUser from "../hooks/useUser";
import Card from "../ui/Card";
import Spinner from "../ui/Spinner";
import Avatar from "../ui/Avatar";
import UserCard from "../components/Profile/UserCard";

export default function ProfileView() {

	const { id: userId } = useParams();

	const { user, loading } = useUser(userId);

	if (loading || !user) {
		return <div>
			<Spinner />
		</div>
	}

  	return <Overlay>
		<UserCard user={user} />
	</Overlay>

}