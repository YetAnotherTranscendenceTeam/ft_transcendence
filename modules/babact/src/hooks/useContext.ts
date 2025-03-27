import BabactState from "../core/BabactState";
import { Context } from "./createContext";


export default function useContext<Type>(Context: Context<Type>): Type | undefined {

	let fiber = BabactState.wipFiber;
	
	while (fiber && (!fiber.context || !fiber.context.has(Context.contextIndex))) {
		fiber = fiber.parent;
	}
	if (fiber && fiber.context) {
		return fiber.context.get(Context.contextIndex);
	}
	return Context.defaultValue;
}