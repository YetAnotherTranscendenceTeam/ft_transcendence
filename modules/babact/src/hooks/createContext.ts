import BabactState from "../core/BabactState";

type ContextProvider<Type> = ({ value, children }: { value: Type; children?: any }) => any;

export interface Context<Type> {
	defaultValue: Type | undefined;
	contextIndex: number;
    Provider: ContextProvider<Type>;
}

let contextCount = 0;

export default function createContext<Type>(defaultValue?: Type): Context<Type> {
    let contextIndex = contextCount++;
    return {
        Provider: function ({ value, children }) {
            BabactState.wipFiber?.context?.set(contextIndex, value);
            contextCount++;
            return children;
        },
        contextIndex,
        defaultValue,
    };
}