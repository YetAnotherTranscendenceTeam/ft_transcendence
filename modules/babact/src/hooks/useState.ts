import BabactState from "../core/BabactState";

type SetState<Type> = (
    action: 
        Type | ((oldValue: Type) => Type)
) => void;

export default function useState<Type>(initial?: Type): [Type, action: SetState<Type>] {
    const oldHook =
		BabactState.wipFiber.alternate &&
		BabactState.wipFiber.alternate.hooks &&
		BabactState.wipFiber.alternate.hooks[BabactState.hookIndex];

    let hook = {
        state: oldHook ? oldHook.state : initial,
        queue: [] as any[],
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
        BabactState.wipRoot = {
            dom: BabactState.currentRoot.dom,
            props: BabactState.currentRoot.props,
            alternate: BabactState.currentRoot,
            parent: null,
            child: null,
            sibling: null,
			tag: null,
        };
        BabactState.nextUnitOfWork = BabactState.wipRoot;
    };

    BabactState.wipFiber.hooks.push(hook);
    BabactState.hookIndex++;
    return [hook.state, setState];
}
