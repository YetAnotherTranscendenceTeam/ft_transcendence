import Babact from "babact";
import Route from "./Route.js";
import RouterContext from "./RouterContext.js";

function getPathFolders(path: string) {
	let pathFolders = path.split("/").slice(1);
	if (pathFolders[pathFolders.length - 1] === "")
		pathFolders.pop();
	return pathFolders;
}

function findMatchingRoute(routes: any, currentPath: string) {
	let route = null;
	let params = {};

	for (let routei of routes) {
		let path = routei.props.path;
		let lastChar = path[path.length - 1];

		params = {};
		let pathFolders = getPathFolders(path);
		let browserPathFolders = getPathFolders(currentPath);
		if (browserPathFolders.length === 0 && pathFolders.length !== 0)
			browserPathFolders.push("");
		let i = 0;
		for (i = 0; i < browserPathFolders.length; i++) {
			if (!pathFolders[i])
				break;
			if (pathFolders[i] === '*') {
				if (lastChar === '*' && i === pathFolders.length - 1) {
					i = browserPathFolders.length;
					break;
				}
				continue;
			}
			if (pathFolders[i].startsWith(":")) {
				params[pathFolders[i].substring(1)] = browserPathFolders[i];
				continue;
			}
			if (pathFolders[i] !== browserPathFolders[i])
				break;
		}
		if (i === browserPathFolders.length) {
			route = routei;
			return { route, params };
		}
	}
	return { route: null, params: {} };
}

export default function Routes({ children } : { children?: any }) {
	const routes = children.filter(child => child.tag === Route);

	const [ route, setRoute ] = Babact.useState(null);
	const { currentPath, setParams } = Babact.useContext(RouterContext);

	Babact.useEffect(() => {
		let { route, params } = findMatchingRoute(routes, currentPath);
		if (route) {
			setParams(params);
		}
		setRoute(route);
	}, [currentPath]);
	return route;
}
