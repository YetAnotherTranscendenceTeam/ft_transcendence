import BabactState from "../core/BabactState";
import { IFiber } from "../core/Fiber";
import { EffectHook, HookTag, IHook } from "../core/Hook";

export default function useEffect(callback: () => void | (() => void), deps: any[]) {
    const oldHook =
        BabactState.wipFiber &&
		BabactState.wipFiber.alternate &&
		BabactState.wipFiber.alternate.hooks &&
		BabactState.wipFiber.alternate.hooks[BabactState.hookIndex] as EffectHook;

    const hook: EffectHook = {
        deps,
        effect: null,
        cleanup: null,
        tag: HookTag.EFFECT
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

    BabactState.wipFiber?.hooks?.push(hook);
    BabactState.hookIndex++;
}


export function removeEffect(fiber: IFiber | null) {
    if (!fiber)
        return;
    if (fiber.hooks) {
        fiber.hooks
        .filter((hook: IHook) => hook.tag === HookTag.EFFECT)
        .forEach(hook => {
            const effect = hook as EffectHook;
            if (effect.cleanup) {
                effect.cleanup();
                effect.cleanup = null;
            }
        });
    }
    removeEffect(fiber.child);
    removeEffect(fiber.sibling);
}
