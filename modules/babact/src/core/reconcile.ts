
import { Fiber, EffectTag, FiberProps, IFiber } from './Fiber'
import BabactState from './BabactState'
import { IElement } from './Element';

export function reconcileChildren(wipFiber: IFiber, elements: IElement[]) {
    let oldFiber: Fiber = wipFiber.alternate?.child ?? null;
    let prevSibling: Fiber = null;

    const existingFibers: Map<string, IFiber> = new Map();
    let oldFiberIndex = 0;
    while (oldFiber) {
        const key = oldFiber.props.key ?? `auto_${oldFiberIndex}`;
        if (existingFibers.has(key)) {
            throw new Error('Duplicate key: ' + key);
        }
        existingFibers.set(key, oldFiber);
        oldFiber = oldFiber.sibling;
        oldFiberIndex++;
    }

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const key: string = element?.props.key ?? `auto_${i}`;
        let newFiber: Fiber = null;
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
        }
        else if (prevSibling) {
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
