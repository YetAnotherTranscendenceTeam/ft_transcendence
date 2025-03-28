export type ElementProps = {
	children?: Array<IElement>;
	[key: string]: any;
}

export interface IElement {
	// either a html tag name or a component function
	tag: string | FunctionComponent | SpecialElementTag,
	props : ElementProps,
}

export enum SpecialElementTag {
	TEXT_ELEMENT = "TEXT_ELEMENT",
	ROOT = "ROOT"
}

export type FunctionComponent = (props: ElementProps) => IElement | IElement[];
