import BabactState from "../core/BabactState";

export default function useContext(Context: { defaultValue: any, contextIndex: number }) {
	//return BabactState.wipFiber.context !== undefined ? BabactState.wipFiber.context : Context.defaultValue;
	let fiber = BabactState.wipFiber;
	
	while (fiber && (!fiber.context || !fiber.context.has(Context.contextIndex))) {
		fiber = fiber.parent;
	}
	if (fiber) {
		return fiber.context.get(Context.contextIndex);
	}
	return Context.defaultValue;
}