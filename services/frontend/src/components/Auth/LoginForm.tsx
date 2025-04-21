import Babact from "babact";
import Input from "../../ui/Input";
import config from "../../config";
import { Form } from "../../contexts/useForm";
import GoogleAuthButton from "./GoogleAuthButton";
import FortyTwoAuthButton from "./FortyTwoAuthButton";
import Separator from "../../ui/Separator";
import Submit from "../../ui/Submit";
import Button from "../../ui/Button";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../contexts/useAuth";
import TwoFAConfirmationModal from "./TwoFAConfirmationModal";

export default function LoginForm({
		isOpen = false,
		onClose,
	}: {
		isOpen: boolean,
		onClose: () => void
	}) {

	const { ft_fetch, isLoading } = useFetch();
	const { auth } = useAuth();
	const [payload, setPayload] = Babact.useState<string>(null);

	const handleSubmit = async (fields, clear) => {
		const { 'login-email': email, 'login-password': password } = fields;

		const response = await ft_fetch(`${config.API_URL}/auth`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email: email.value, password: password.value })
		}, {
			show_error: true,
			error_messages: {
				401: 'Invalid email or password',
				400: 'Invalid email'
			}
		});

		if (response && response.statusCode === 202 && response.code === '2FA_VERIFICATION') {
			const { payload_token } = response;
			console.log('payload_token', payload_token);
			setPayload(payload_token);
		}
		else if (response) {
			const { access_token, expire_at } = response;
			clear();
			onClose();
			auth(access_token, expire_at);
		}
		else {
			clear(['login-password']);
		}
	}

	const handle2FA = async (otp: string, method: string) => {
		const response = await ft_fetch(`${config.API_URL}/auth/2fa`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				payload_token: payload,
				otp,
				otp_method: method,
			})
		}, {
			show_error: true,
			on_error: (res) => {
				if (res.status !== 403)
					setPayload(null);
			},
			error_messages: {
				403: 'Invalid code',
				400: ''
			}
		})

		if (response) {
			const { access_token, expire_at } = response;
			onClose();
			auth(access_token, expire_at);
		}
		return response;
	}

	return <>
		<Form formFields={['login-email*', 'login-password*']} className="gap-0">
			<div
				className={`auth-card-form flex flex-col gap-4 ${isOpen ? 'open' : 'closed'}`}
				>
				<GoogleAuthButton />
				<FortyTwoAuthButton isOpen={isOpen}/>
				<Separator>or</Separator>
				<h1>Login to your account</h1>
				<Input
					label="Email"
					error="Invalid Email"
					required
					field="login-email"
					type="email"
					/>
				<Input
					label="Password"
					type="password"
					pattern={config.PASSWORD_REGEX}
					required
					error="Invalid Password"
					field="login-password"
					/>
			</div>

			{ isOpen &&
				<div className="flex items-center justify-between">
					<Submit
						fields={['login-email', 'login-password']}
						onSubmit={handleSubmit}
						loading={isLoading}
						>
						Login <i className="fa-solid fa-arrow-right-to-bracket"></i>
					</Submit>
					<Button className="icon" onClick={onClose}>
						<i className="fa-solid fa-xmark"></i>
					</Button>
				</div>
			}
		</Form>
		<TwoFAConfirmationModal
			title="2FA Verification"
			isOpen={!!payload}
			onClose={() => setPayload(null)}
			onConfirm={async (otp) => handle2FA(otp, 'app')}
		/>
	</>
}