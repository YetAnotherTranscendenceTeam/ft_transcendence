import BabactState from "../core/BabactState";

export default function useRef(initialValue: any) {
    const oldHook =
        BabactState.wipFiber.alternate &&
        BabactState.wipFiber.alternate.hooks &&
        BabactState.wipFiber.alternate.hooks[BabactState.hookIndex];

    const hook = oldHook ? oldHook : { current: initialValue };

    BabactState.wipFiber.hooks.push(hook);
    BabactState.hookIndex++;

    return hook;
}