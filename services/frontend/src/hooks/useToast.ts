import { useUi } from "../contexts/useUi";

export default function useToast() {

	const { setToaster, toaster } = useUi();

	const findFistToast = () => {
		let min = toaster[0].id;
		toaster.forEach(toast => {
			if (toast.id < min) min = toast.id;
		});
		return min;
	};

	const removeToast = (id: number) => {
		setToaster(toaster => toaster.filter((toast: any) => toast.id !== id));
	}

	const createToast = (message: string | ((id: number) => string), type: 'info' | 'success' | 'danger' | 'warning', timeout = 3000) => {
		const id = Date.now();
		if (toaster.length >= 5) {
			removeToast(findFistToast());
		}
		if (typeof message === 'function') message = message(id);
		timeout = timeout === 0 ? timeout : Math.max(timeout, 1000);
		setToaster(toaster => {
			if (toaster.find(toast=> toast.id === id)) return toaster;
			return ([...toaster, {
				id,
				message,
				type,
				timeout
			}])
		});
		if (timeout)
			setTimeout(() => removeToast(id), timeout);
	}

	return {createToast, removeToast};

}