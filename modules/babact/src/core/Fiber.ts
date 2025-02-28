import { IElement } from './Element';

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
	dom: NodeElement,
	parent: IFiber | null,
	child: IFiber | null,
	sibling: IFiber | null,
	alternate: IFiber | null,
	effectTag?: EffectTag,
	props: FiberProps,
	hooks?: Array<any>,
	context?: Map<number, any>,
}