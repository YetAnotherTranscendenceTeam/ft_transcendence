import BabactState from './BabactState';
import { commitRoot } from './commit';
import { createDom } from './dom';
import { FunctionComponent, IElement } from './Element';
import { IFiber } from './Fiber';
import { reconcileChildren } from './reconcile';

window.requestIdleCallback(workLoop, { timeout: 1000 });

function workLoop(deadline: IdleDeadline) {
	let shouldYield = false;
	while (BabactState.nextUnitOfWork && !shouldYield) {
		BabactState.nextUnitOfWork = performUnitOfWork(BabactState.nextUnitOfWork);
		shouldYield = deadline.timeRemaining() < 1;
	}

	if (!BabactState.nextUnitOfWork && BabactState.wipRoot) {
		commitRoot()
	}
	window.requestIdleCallback(workLoop, { timeout: 2000 });
}

function updateHostComponent(fiber: IFiber) {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber);
	}
	reconcileChildren(fiber, fiber.props.children);
}

function updateFunctionComponent(fiber: IFiber) {
	BabactState.wipFiber = fiber;
	BabactState.hookIndex = 0;
	BabactState.wipFiber.hooks = [];
	BabactState.wipFiber.context = new Map();
	const tag = fiber.tag as FunctionComponent;
	const children = [tag(fiber.props)];
	const flatchildren: IElement[] = children.flat(Infinity) as IElement[];
	reconcileChildren(fiber, flatchildren);
}

function performUnitOfWork(fiber: IFiber): IFiber {
	const isFunctionComponent: Boolean = fiber.tag instanceof Function;
	if (isFunctionComponent) {
		updateFunctionComponent(fiber);
	} else {
		updateHostComponent(fiber);
	}

	if (fiber.child) {
		return fiber.child;
	}
	let nextFiber: IFiber = fiber;
	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling;
		}
		nextFiber = nextFiber.parent;
	}
	return null;
}