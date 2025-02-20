import { useUi } from "../contexts/useUi";

export default function useToast() {

	const { setToaster } = useUi();

	const removeToast = (id: number) => {
		console.log('removeToast', id);
		setToaster(toaster => toaster.filter((toast: any) => toast.id !== id));
	}

	const createToast = (message: string, type: 'info' | 'success' | 'error', timeout = 1000) => {
		const id = Date.now();
		console.log('createToast', id, message, type);
		setToaster(toaster => [...toaster, { id, message, type }]);
		setTimeout(() => {
			//console.log(toaster.filter((toast: any) => toast.id !== id));
			removeToast(id);
		}, timeout);
	}

	return createToast;

}