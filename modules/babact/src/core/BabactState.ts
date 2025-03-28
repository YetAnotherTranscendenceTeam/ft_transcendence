import { Fiber, IFiber } from "./Fiber";

export interface IBabactState {
	nextUnitOfWork: Fiber;
	wipRoot: Fiber;
	currentRoot: Fiber;
	deletions: IFiber[];
	wipFiber: Fiber;
	hookIndex: number;
	effects: any[];
}

const BabactState = {
	nextUnitOfWork: null,
	wipRoot: null,
	currentRoot: null,
	deletions: [],
	wipFiber: null,
	hookIndex: 0,
	effects: [],
} as IBabactState;

export default BabactState;