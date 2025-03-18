import { SpecialElementTag, IElement } from './Element';

// Children:
// Either, an array of element, text or an Element
// if text is passed. An element with SpecialElementTag.TEXT_ELEMENT tag replace it
export function createElement(
        tag: string,
        props: Object,
        ...children: Array<string | IElement | IElement[] | number | boolean>
    ): IElement {

    let nchildren: Array<string | IElement | number | boolean> = children.flatMap((child) => Array.isArray(child) ? child : [child])
    return {
        tag,
        props: {
            ...props,
            children: nchildren.filter(child => (
                // filter out undefined, null, empty string, false, 0 but not string '0'
                child !== undefined && child !== null && child !== '' && child !== false
            )).map((child) : IElement => {
                return typeof child === 'object' ? child as IElement : createTextElement(child.toString());
            })
        }
    }
}


function createTextElement(text: string): IElement {
    return {
        tag: SpecialElementTag.TEXT_ELEMENT,
        props: {
            nodeValue: text,
            children: []
        }
    }
}
