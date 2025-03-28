import Babact from "babact";

const RouterContext = Babact.createContext<{
		currentPath: string;
		setParams: (params: any) => void;
		setCurrentPath: (path: string) => void;
		params: any;
	}>();

export default RouterContext;