import { removeEffect } from "../hooks/useEffect";
import BabactState from "./BabactState";
import { ElementProps } from "./Element";
import { EffectTag, IFiber } from "./Fiber";


export function commitRoot() {
	BabactState.deletions.forEach(commitWork);
	commitWork(BabactState.wipRoot.child);
	BabactState.currentRoot = BabactState.wipRoot;
	BabactState.wipRoot = null;

	BabactState.effects.forEach((hook) => {
		if (hook.effect) {
			if (hook.cleanup) {
				hook.cleanup();
			}
			hook.cleanup = hook.effect();
		}
	});

	BabactState.effects = [];
}

export function commitWork(fiber: IFiber | null) {
	if (!fiber) {
		return;
	}
	let domParentFiber: IFiber = fiber.parent;
	while (!domParentFiber.dom) {
		domParentFiber = domParentFiber.parent;
	}
	const domParent: HTMLElement | Text = domParentFiber.dom;
	if (fiber.effectTag === EffectTag.Placement && fiber.dom != null) {
		domParent.appendChild(fiber.dom);
	} else if (fiber.effectTag === EffectTag.Update && fiber.dom != null) {
		updateDom(fiber.dom as HTMLElement, fiber.alternate.props, fiber.props);
	} else if (fiber.effectTag === EffectTag.Deletion) {
		commitDeletion(fiber, domParent);
		return;
	}

	if (fiber.hooks)
		BabactState.effects.push(...fiber.hooks.filter(hook => hook.tag === 'effect'));

	commitWork(fiber.child);
	commitWork(fiber.sibling);
}

function updateDom(dom: HTMLElement, prevProps: ElementProps, nextProps: ElementProps) {
	// Remove old or changed event listeners
	Object.keys(prevProps)
		.filter(prop => prop.startsWith('on'))
		.filter(prop => !(prop in nextProps) || prevProps[prop] !== nextProps[prop])
		.forEach(name => {
			const eventType = name.toLowerCase().substring(2);
			dom.removeEventListener(eventType, prevProps[name]);
		});

	// Remove old properties
	Object.keys(prevProps)
		.filter(prop => prop !== 'children')
		.filter(prop => !(prop in nextProps))
		.forEach(name => {
			(dom as any)[name] = '';
		});

	// Set new or changed properties
	Object.keys(nextProps)
		.filter(prop => prop !== 'children')
		.filter(prop => prevProps[prop] !== nextProps[prop])
		.forEach(name => {
			(dom as any)[name] = nextProps[name];
		});

	// Add new event listeners
	Object.keys(nextProps)
		.filter(prop => prop.startsWith('on'))
		.filter(prop => !(prop in prevProps) || prevProps[prop] !== nextProps[prop])
		.forEach(name => {
			const eventType = name.toLowerCase().substring(2);
			dom.addEventListener(eventType, nextProps[name]);
		});
}

function commitDeletion(fiber: IFiber, domParent: HTMLElement | Text) {
	removeEffect(fiber);
	if (fiber.dom) {
		domParent.removeChild(fiber.dom);
	} else {
		commitDeletion(fiber.child, domParent);
	}
}

