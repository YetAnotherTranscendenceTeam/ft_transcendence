import BabactState from "../core/BabactState";

export default function useState(initial?: any) {
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
    actions.length = 0;

    const setState = (action: any) => {
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
        BabactState.deletions = [];
    };

    BabactState.wipFiber.hooks.push(hook);
    BabactState.hookIndex++;
    return [hook.state, setState];
}
