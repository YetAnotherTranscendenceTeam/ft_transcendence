export enum HookTag {
	EFFECT = 'effect',
	STATE = 'state',
	CONTEXT = 'context',
	REF = 'ref',
}

export interface IHook {
	tag: HookTag;
}
