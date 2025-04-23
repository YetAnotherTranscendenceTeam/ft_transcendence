import Babact from "babact";
import Modal from "../../ui/Modal";
import useAccount from "../../hooks/useAccount";
import * as QRCode from 'qrcode'; 
import Spinner from "../../ui/Spinner";
import PinInput from "../../ui/PinInput";
import useEscape from "../../hooks/useEscape";
import { Form } from "../../contexts/useForm";
import Submit from "../../ui/Submit";

export default function TwoFAEnableModal({
		isOpen,
		onClose,
	}: {
		isOpen: boolean;
		onClose: () => void;
	}) {

	const { enable2FA, confirm2FA, isLoading } = useAccount();
	const [QRCodeDataURL, setQRCodeDataUrl] = Babact.useState(null);

	const handleEnable2FA = async () => {
		const res = await enable2FA();
		if (res) {
			setQRCodeDataUrl(await QRCode.toDataURL(res.otpauth));
		}
	}

	const handleSubmit = async (fields, clear) => {
		const { '2fa-otp': otp } = fields;
		const res = await confirm2FA(otp.value);
		if (res) {
			clear();
			onClose();
		}
		else {
			clear();
		}
	}

	Babact.useEffect(() => {
		if (isOpen) {
			handleEnable2FA();
		}
		else
			setQRCodeDataUrl(null);
	}, [isOpen]);

	useEscape(isOpen, onClose);

	return <Modal
		isOpen={isOpen}
		onClose={onClose}
		className='mfa-modal flex flex-col items-center justify-center gap-4'
		closeButton={true}
	>
		<h1>2FA activation</h1>
		{QRCodeDataURL ? <div
			className='mfa-modal-qrcode flex flex-col gap-2 items-center justify-center'
		>
				<img src={QRCodeDataURL} alt="QR Code" id="2fa" />
				<p>Use your authenticator app to scan this QR code</p>
			</div>
			: <Spinner />
		}

		<Form
			formFields={['2fa-otp*']}
		>

			<PinInput
				field='2fa-otp'
				required
				label='One Time Code'
				help='Enter the code from your authenticator app to confirm 2FA activation.'
				length={6}
			/>
			<Submit
				fields={['2fa-otp']}
				onSubmit={handleSubmit}
				loading={isLoading}
			>
				Activate 2FA <i className="fa-solid fa-shield-halved"></i>
			</Submit>
		</Form>
	</Modal>
}