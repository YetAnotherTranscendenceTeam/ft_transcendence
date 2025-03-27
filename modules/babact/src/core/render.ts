import BabactState from "./BabactState";
import { IElement, SpecialElementTag } from "./Element";
import { IFiber } from "./Fiber";

export function render(element: IElement, container: HTMLElement) {
	BabactState.wipRoot = {
		dom: container,
		props: {
			children: [element as IFiber],
		},
		alternate: BabactState.currentRoot,
		parent: null,
		child: null,
		sibling: null,
		tag: SpecialElementTag.ROOT,
	};
	BabactState.deletions = [];
	BabactState.nextUnitOfWork = BabactState.wipRoot;
}

