import Babact from "babact";
import RouterContext from "./RouterContext.js";

export default function Router({ children } : { children?: any }) {
	let [params, setParams] = Babact.useState({});
	let [currentPath, setCurrentPath] = Babact.useState(window.location.pathname);

	Babact.useEffect(() => {
		const handleRoute = () => {
			setCurrentPath(window.location.pathname);
		};

		handleRoute();
		window.addEventListener("popstate", handleRoute);

		return () => window.removeEventListener("popstate", handleRoute);
	}, []);

	return (
		<RouterContext.Provider value={{params, setParams, currentPath, setCurrentPath}}>
			{children}
		</RouterContext.Provider>
	);
}