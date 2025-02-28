import BabactState from "../core/BabactState";

export default function useEffect(callback: () => void | (() => void), deps: any[]) {
    const oldHook =
		BabactState.wipFiber.alternate &&
		BabactState.wipFiber.alternate.hooks &&
		BabactState.wipFiber.alternate.hooks[BabactState.hookIndex];

    const hook = {
        deps,
        effect: null,
        cleanup: null,
        tag: 'effect'
    };

    const hasChanged = oldHook && (!oldHook.deps || oldHook.deps.some((dep, i) => dep !== deps[i]));

    if (!oldHook) {
        hook.effect = callback;
    }
    else if (hasChanged) {
        hook.effect = callback;
        hook.cleanup = oldHook.cleanup
    }
    else {
        hook.effect = null;
        hook.cleanup = oldHook.cleanup;
    }

    BabactState.wipFiber.hooks.push(hook);
    BabactState.hookIndex++;
}


export function removeEffect(fiber: any) {
    if (!fiber)
        return;
    if (fiber.hooks) {
        fiber.hooks.forEach(hook => {
            if (hook.cleanup) {
                hook.cleanup();
                hook.cleanup = null;
            }
        });
    }
    removeEffect(fiber.child);
    removeEffect(fiber.sibling);
}
