export type ElementProps = {
	children?: Array<IElement>;
	[key: string]: any;
}

export interface IElement {
	// either a html tag name or a component function
	tag: String | FunctionComponent | SpecialElementTag,
	props : ElementProps,
}

export enum SpecialElementTag {
	TEXT_ELEMENT = "TEXT_ELEMENT"
}

export type FunctionComponent = (props: ElementProps) => IElement | IElement[];
