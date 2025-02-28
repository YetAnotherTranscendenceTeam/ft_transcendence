import BabactState from "../core/BabactState";

let contextCount = 0;

export default function createContext(defaultValue?: any) {
    let contextIndex = contextCount++;
    return {
        Provider: function ({ value, children }: { value: any; children?: any }) {
            BabactState.wipFiber.context.set(contextIndex,value);
            contextCount++;
            return children;
        },
        contextIndex,
        defaultValue,
    };
}