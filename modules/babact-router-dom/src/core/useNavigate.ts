import Babact from "babact";
import RouterContext from "./RouterContext.js";

export default function useNavigate() {

	const { setCurrentPath } = Babact.useContext(RouterContext);

	return (to: string) => {
		window.history.pushState(null, "", to);
		setCurrentPath(to);
	};
}
