import BabactState from "../core/BabactState";
import { SpecialElementTag } from "../core/Element";
import { HookTag, StateHook } from "../core/Hook";

type SetState<Type> = (
    action: 
        Type | ((oldValue: Type) => Type)
) => void;

export default function useState<Type>(initial?: Type): [Type | undefined, action: SetState<Type>] {
    const oldHook =
        BabactState.wipFiber &&
		BabactState.wipFiber.alternate &&
		BabactState.wipFiber.alternate.hooks &&
		BabactState.wipFiber.alternate.hooks[BabactState.hookIndex] as StateHook<Type>;

    let hook: StateHook<Type> = {
        state: oldHook ? oldHook.state : initial,
        queue: [] as any[],
        tag: HookTag.STATE
    };
    if (oldHook)
        hook = oldHook;

    const actions = hook.queue;
    actions.forEach(action => {
        hook.state = action instanceof Function ? action(hook.state) : action;
    });
    hook.queue = [];

    const setState: SetState<Type> = (action) => {
        hook.queue.push(action);
        if (!BabactState.currentRoot)
            return;
        BabactState.wipRoot = {
            dom: BabactState.currentRoot.dom,
            props: BabactState.currentRoot.props,
            alternate: BabactState.currentRoot,
            parent: null,
            child: null,
            sibling: null,
            tag: SpecialElementTag.ROOT
        };
        BabactState.nextUnitOfWork = BabactState.wipRoot;
    };
    BabactState.wipFiber?.hooks?.push(hook);
    BabactState.hookIndex++;
    return [hook.state, setState];
}
