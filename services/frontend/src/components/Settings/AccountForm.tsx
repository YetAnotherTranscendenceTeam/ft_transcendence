import Babact from "babact";
import SettingsSection from "./SettingsSection";
import { Form } from "../../contexts/useForm";
import Input from "../../ui/Input";
import Submit from "../../ui/Submit";
import Button from "../../ui/Button";
import { AuthMethod, IMe, SecondFactor, useAuth } from "../../contexts/useAuth";
import Alert from "../../ui/Alert";
import { ToastType } from "../../hooks/useToast";
import useAccount from "../../hooks/useAccount";
import TwoFAEnableModal from "../Auth/TwoFAEnableModal";
import TwoFAConfirmationModal from "../Auth/TwoFAConfirmationModal";

export default function AccountForm({
		me,
		onLogout
	}: {
		me: IMe,
		onLogout: Function
	}) {

	const { logout, refresh } = useAuth();
	const { setSettings, isLoading, disable2FA } = useAccount();
	const [isOpen, setIsOpen] = Babact.useState<boolean>(false);

	const handleSubmit = async (fields, clearFields) => {
		const settings = {
			email: fields['account-email'].value,
			password: fields['account-password'].value,
			old_password: fields['account-current-password'].value,
		};
		const res = await setSettings(settings);
		if (res)
			clearFields();
	}

	if (!me)
		return null;
	return <SettingsSection name='Account'>
		<Form formFields={['account-email', 'account-password', 'account-confirm-password', 'account-current-password*']} className='gap-8'>
			{
				me.credentials.auth_method !== AuthMethod.password_auth &&
				<Alert
					message={`You are logged in with ${me.credentials.auth_method === AuthMethod.google_auth ? 'GoogleSignIn' : '42Intra'}.`}
				/>
			}
			{ me.credentials.auth_method === 'password_auth' &&
			<>
				<Input field="account-email" label='Edit your email' type='email' placeholder={me.credentials.email}/>

				<div className='flex flex-col gap-2'>
					<Input
						field="account-password"
						label='Edit your password'
						name='password'
						type='password'
					/>
					<Input
						field="account-confirm-password"
						label='Confirm your new password'
						name='confirm-password'
						type='password'
						matching="account-password"
					/>
				</div>

				<Input
					field="account-current-password"
					label='Current Password'
					type='password'
					required
					help='You must enter your current password to save account changes'
				/>
			</>
			}

			{ me.credentials.second_factor === SecondFactor.none ? <div
				className='flex flex-col gap-2'
			>
				<Button
					onClick={() => setIsOpen(true)}
				>
					Enable 2FA
					<i className="fa-solid fa-shield-halved"></i>
				</Button>
				<p className='input-help'>
					Two Factor Authentication (2FA) adds an extra layer of security to your account.
					It requires a second form of verification in addition to your password.
				</p>
			</div>:
			
			<div
				className='flex flex-col gap-2'
			>
				<Button
					className='danger'
					onClick={() => setIsOpen(true)}
				>
					Disable 2FA
					<i className="fa-solid fa-shield-halved"></i>
				</Button>
				<p className='input-help'>
					Disabling 2FA will remove the extra layer of security from your account.
				</p>
			</div>}

			<div className='flex gap-4 justify-end'>
				<Button className="danger" onClick={() => {logout(); onLogout()} }>Logout<i className="fa-solid fa-arrow-right-from-bracket"></i></Button>
				{ me.credentials.auth_method === 'password_auth' &&
					<Submit
						fields={['account-email', 'account-password', 'account-confirm-password', 'account-current-password']}
						loading={isLoading}
						onSubmit={handleSubmit}
					>
						Save
						<i className="fa-regular fa-floppy-disk"></i>
					</Submit>
				}
			</div>
		</Form>
		{  me.credentials.second_factor === SecondFactor.none ? <TwoFAEnableModal
			isOpen={isOpen}
			onClose={() => setIsOpen(false)}
		/> : <TwoFAConfirmationModal
			isOpen={isOpen}
			onClose={() => setIsOpen(false)}
			onConfirm={async (otp: string) => {
				const res = await disable2FA(otp);
				if (res)
					refresh();
				return res;
			}}
			title='Disable 2FA'
		/>}
	</SettingsSection>
}