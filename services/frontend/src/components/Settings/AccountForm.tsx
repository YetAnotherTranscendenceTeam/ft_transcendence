import Babact from "babact";
import SettingsSection from "./SettingsSection";
import { Form } from "../../contexts/useForm";
import Input from "../../ui/Input";
import Submit from "../../ui/Submit";
import Button from "../../ui/Button";
import { AuthMethod, IMe, SecondFactor, useAuth } from "../../contexts/useAuth";
import Alert from "../../ui/Alert";
import useAccount from "../../hooks/useAccount";
import TwoFAEnableModal from "../Auth/TwoFAEnableModal";
import TwoFAConfirmationModal from "../Auth/TwoFAConfirmationModal";
import config from "../../config";

export default function AccountForm({
		me,
		onLogout
	}: {
		me: IMe,
		onLogout: Function
	}) {

	const { logout, refresh } = useAuth();
	const { setSettings, isLoading, disable2FA, setPayload, setSettings2FA, payload } = useAccount();
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
				<Input
					field="account-email"
					label='Edit your email'
					type='email'
					pattern={config.EMAIL_REGEX}
					placeholder={me.credentials.email}
					help="Your email is used to log in to the game and manage your account."
				/>

				<div className='flex flex-col gap-2'>
					<Input
						field="account-password"
						label='Edit your password'
						name='password'
						type='password'
						pattern={config.PASSWORD_REGEX}
						help='Your password is used to log in to the game and manage your account.'
						tooltip={
							<div
								className='settings-tooltip flex flex-col'
							>
								Password must follow these rules:
								<ul>
									<li>At least 8 characters</li>
									<li>At most 24 characters</li>
									<li>At least one uppercase letter</li>
									<li>At least one lowercase letter</li>
									<li>At least one number</li>
									<li>{`At least one special character (!@#$%^&*()_-+=[]{}|;:'",.<>/?)`}</li>
								</ul>
							</div>
						}
					/>
					<Input
						field="account-confirm-password"
						label='Confirm your new password'
						name='confirm-password'
						type='password'
						matching="account-password"
						help='Confirm password must match the new password'
						pattern={config.PASSWORD_REGEX}
					/>
				</div>

				<Input
					field="account-current-password"
					label='Current Password'
					type='password'
					required
					help='You must enter your current password to save account changes'
					pattern={config.PASSWORD_REGEX}
				/>
			</>
			}

			{ !me.credentials.otp_methods.length ? <div
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
						disabled={(fields) => {
							return !(fields['account-email'].value !== '' || (fields['account-password'].value !== '' && fields['account-confirm-password'].value !== ''));
						}}
					>
						Save
						<i className="fa-regular fa-floppy-disk"></i>
					</Submit>
				}
			</div>
		</Form>
		{  !me.credentials.otp_methods.length ? <TwoFAEnableModal
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
		<TwoFAConfirmationModal
			isOpen={!!payload}
			onClose={() => setPayload(null)}
			onConfirm={async (otp: string) => {
				const res = await setSettings2FA({
					otp,
					otp_method: SecondFactor.app,
				});
				if (res)
					refresh();
				return res;
			}}
			title='Confirm Account Changes with 2FA'
		/>
	</SettingsSection>
}