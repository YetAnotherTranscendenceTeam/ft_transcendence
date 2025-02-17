import Babact from "babact";
import RouterContext from "./RouterContext.js";

export default function useParams() {
	const { params } = Babact.useContext(RouterContext);
	return {params};
}
