import { SpecialElementTag, IElement } from './Element';

// Children:
// Either, an array of element, text or an Element
// if text is passed. An element with SpecialElementTag.TEXT_ELEMENT tag replace it
export function createElement(
        tag: String,
        props: Object,
        ...children: Array<String | IElement | IElement[]>
    ): IElement {

    let nchildren: Array<String | IElement> = children.flatMap((child) => Array.isArray(child) ? child : [child])
    return {
        tag,
        props: {
            ...props,
            children: nchildren.filter(child => (child != '' && child)).map((child) : IElement => {
                return typeof child === 'object' ? child as IElement : createTextElement(child);
            })
        }
    }
}


function createTextElement(text: String): IElement {
    return {
        tag: SpecialElementTag.TEXT_ELEMENT,
        props: {
            nodeValue: text,
            children: []
        }
    }
}
