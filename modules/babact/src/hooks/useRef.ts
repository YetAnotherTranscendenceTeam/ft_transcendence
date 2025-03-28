import BabactState from "../core/BabactState";
import { HookTag, ReferenceHook } from "../core/Hook";

export default function useRef<Type>(initialValue: Type): ReferenceHook<Type> {
    const oldHook =
        BabactState.wipFiber &&
        BabactState.wipFiber.alternate &&
        BabactState.wipFiber.alternate.hooks &&
        BabactState.wipFiber.alternate.hooks[BabactState.hookIndex] as ReferenceHook<Type>;

    const hook: ReferenceHook<Type> = oldHook ? oldHook : {
        current: initialValue,
        tag: HookTag.REF
    };

    BabactState.wipFiber?.hooks?.push(hook);
    BabactState.hookIndex++;

    return hook;
}