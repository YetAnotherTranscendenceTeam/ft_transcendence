
import { IFiber, EffectTag, FiberProps } from './Fiber'
import BabactState from './BabactState'
import { IElement } from './Element';
export function reconcileChildren(wipFiber: IFiber, elements: IElement[]) {
    let oldFiber: IFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling: IFiber = null;

    const existingFibers = new Map();
    let oldFiberIndex = 0;
    while (oldFiber != null) {
        const key = oldFiber.props.key || oldFiberIndex;
        existingFibers.set(key, oldFiber);
        oldFiber = oldFiber.sibling;
        oldFiberIndex++;
    }

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const key = element?.props.key || i;
        let newFiber: IFiber = null;
        const oldFiber = existingFibers.get(key);

        const sameType =
            oldFiber &&
            element &&
            element.tag === oldFiber.tag;

        if (sameType) {
            newFiber = {
                tag: oldFiber.tag,
                props: element.props as FiberProps,
                dom: oldFiber.dom,
                parent: wipFiber,
                child: null,
                sibling: null,
                alternate: oldFiber,
                effectTag: EffectTag.Update,
                context: oldFiber.context,
            };
			existingFibers.delete(key);
        }
        if (element && !sameType) {
            newFiber = {
                tag: element.tag,
                props: element.props as FiberProps,
                dom: null,
                child: null,
                sibling: null,
                parent: wipFiber,
                alternate: null,
                effectTag: EffectTag.Placement,
            };
        }
        if (oldFiber && !sameType) {
            oldFiber.effectTag = EffectTag.Deletion;
            BabactState.deletions.push(oldFiber);
        }

        if (i === 0) {
            wipFiber.child = newFiber;
        } else if (element) {
            prevSibling.sibling = newFiber;
        }
        prevSibling = newFiber;
    }

    existingFibers.forEach((fiber) => {
        if (fiber.effectTag !== EffectTag.Deletion) {
            fiber.effectTag = EffectTag.Deletion;
            BabactState.deletions.push(fiber);
        }
    });
}
