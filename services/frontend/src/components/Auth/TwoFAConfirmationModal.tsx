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
		onConfirm: (otp: string) => Promise<void>;
		title?: string;
	}) {

	
	useEscape(isOpen, onClose);

	return <Modal
		isOpen={isOpen}
		onClose={onClose}
		className='mfa-modal flex flex-col items-center justify-center gap-4'
	>
		<h1>{title}</h1>

		<Form formFields={['2fa-otp*']} className='flex flex-col gap-4'>
			<PinInput
				field='2fa-otp'
				length={6}
				label='One Tine Code'
				help="Enter the code from your authenticator app."
				required
			/>
			<div className='flex flex-col gap-4'>
				<Submit
					onSubmit={() => {}}
					fields={['2fa-otp']}	
				>
					Confirm
				</Submit>
			</div>
		</Form>
	</Modal>

	
}