import { useUi } from "../contexts/useUi";

export default function useToast() {

	const { setToaster } = useUi();


	const removeToast = (id: number) => {
		setToaster(toaster => toaster.filter((toast: any) => toast.id !== id));
	}

	const createToast = (message: string | ((id: number) => string), type: 'info' | 'success' | 'danger' | 'warning', timeout = 3000) => {
		const id = Date.now();
		if (typeof message === 'function') message = message(id);
		setToaster(toaster => ([...toaster, { id, message, type, timeout }]));
		setTimeout(() => removeToast(id), timeout);
	}

	return {createToast, removeToast};

}