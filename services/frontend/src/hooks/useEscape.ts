import Babact from "babact";

const escapeCallbacks = [];

export default function useEscape(active, callback) {

    const onKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.stopImmediatePropagation();
            for (let i = escapeCallbacks.length - 1; i >= 0; i--) {
                escapeCallbacks[i]();
                break;
            }
        }
    }

    Babact.useEffect(() => {
        if (active) {
            escapeCallbacks.push(callback);
            document.addEventListener('keydown', onKeyDown);
        }
        return () => {
            const index = escapeCallbacks.indexOf(callback);
            if (index > -1) {
                escapeCallbacks.splice(index, 1);
            }
            document.removeEventListener('keydown', onKeyDown);
        }
    }, [active]);
}