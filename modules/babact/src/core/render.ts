import BabactState from "./BabactState";
import { IFiber, NodeElement } from "./Fiber";

export function render(element: IFiber, container: NodeElement) {
	BabactState.wipRoot = {
		dom: container,
		props: {
			children: [element],
		},
		alternate: BabactState.currentRoot,
		parent: null,
		child: null,
		sibling: null,
		tag: null,
	};
	BabactState.deletions = [];
	BabactState.nextUnitOfWork = BabactState.wipRoot;
}

