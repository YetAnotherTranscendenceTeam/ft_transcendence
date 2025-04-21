import Babact from "babact";
import Modal from "../../ui/Modal";
import useEscape from "../../hooks/useEscape";
import { Form } from "../../contexts/useForm";
import PinInput from "../../ui/PinInput";
import Submit from "../../ui/Submit";

export default function TwoFAConfirmationModal({
		isOpen,
		onClose,
		onConfirm,
		title,
	}: {
		isOpen: boolean;
		onClose: () => void;
		onConfirm: (otp: string) => Promise<Response>;
		title?: string;
	}) {

	const [isLoading, setIsLoading] = Babact.useState<boolean>(false);
	
	const handleSubmit = async (fields, clear) => {
		setIsLoading(true);
		const { '2fa-otp': otp } = fields;
		const res = await onConfirm(otp.value);
		setIsLoading(false);
		clear();
		if (res)
			onClose();
	}

	useEscape(isOpen, onClose);

	return <Modal
		isOpen={isOpen}
		onClose={onClose}
		className='mfa-modal mfa-confirm flex flex-col items-center justify-center gap-4'
		closeButton={true}
	>
		<h1>{title}</h1>

		<Form formFields={['2fa-otp*']} className='flex flex-col gap-4'>
			<PinInput
				field='2fa-otp'
				length={6}
				label='One Time Code'
				help="Enter the code from your authenticator app."
				required
			/>
			<div className='flex flex-col gap-4'>
				<Submit
					onSubmit={handleSubmit}
					fields={['2fa-otp']}
					loading={isLoading}
				>
					Confirm <i className="fa-solid fa-check"></i>
				</Submit>
			</div>
		</Form>
	</Modal>

	
}