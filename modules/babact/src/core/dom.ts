
import { SpecialElementTag } from './Element';
import { IFiber, NodeElement } from './Fiber';

export function createDom(fiber: IFiber) : NodeElement {
	const dom: NodeElement =
		fiber.tag === SpecialElementTag.TEXT_ELEMENT ?
		document.createTextNode(fiber.props.nodeValue) :
		document.createElement(fiber.tag as string);
	Object.keys(fiber.props)
		.filter(key => key !== 'children')
		.forEach(name => {
            if (name.startsWith('on')) {
                const eventType = name.toLowerCase().substring(2);
                dom.addEventListener(eventType, fiber.props[name]);
            }
            else {
				if (name.startsWith('data-') && fiber.tag !== SpecialElementTag.TEXT_ELEMENT)
					(dom as HTMLElement).setAttribute(name, fiber.props[name]);
				else
					dom[name] = fiber.props[name];
            }
		}
	);
	return dom;
}