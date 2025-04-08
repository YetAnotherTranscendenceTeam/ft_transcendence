export enum HookTag {
	EFFECT = 'effect',
	STATE = 'state',
	CONTEXT = 'context',
	REF = 'ref',
}

export interface IHook {
	tag: HookTag;
}

export interface ReferenceHook<Type> extends IHook {
    current: Type;
}

export interface StateHook<Type> extends IHook {
    state?: Type;
    queue: any[];
}

export interface EffectHook extends IHook {
    effect: (() => (() => void) | void) | null;
    cleanup: (() => void) | null;
    deps: any[];
}