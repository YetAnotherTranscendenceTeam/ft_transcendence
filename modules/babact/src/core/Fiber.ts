import { IElement } from './Element';
import { IHook } from './Hook';

export type NodeElement = HTMLElement | Text;

export enum EffectTag {
	Deletion = "DELETION",
	Placement = "PLACEMENT",
	Update = "UPDATE"
}


export type FiberProps = {
	children?: Array<IFiber>,
	[key: string]: any,
};

export interface IFiber extends IElement {
	dom: NodeElement | null,
	parent: Fiber,
	child: Fiber,
	sibling: Fiber,
	alternate: Fiber,
	effectTag?: EffectTag,
	props: FiberProps,
	hooks?: IHook[],
	context?: Map<number, any>,
}

export type Fiber = IFiber | null;