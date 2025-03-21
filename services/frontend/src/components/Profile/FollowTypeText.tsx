import Babact from "babact";
import { StatusType } from "../../hooks/useSocials";

export default function FollowTypeText({type} : { type: StatusType}) {

	if (type === StatusType.INLOBBY)
		return <h2>in a lobby</h2>;

	return <h2>{type}</h2>;
}