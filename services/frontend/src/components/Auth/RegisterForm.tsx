import Babact from "babact";
import Input from "../../ui/Input";
import config from "../../config";
import Checkbox from "../../ui/Checkbox";
import { Form } from "../../contexts/useForm";
import Submit from "../../ui/Submit";
import Button from "../../ui/Button";
import GoogleAuthButton from "./GoogleAuthButton";
import FortyTwoAuthButton from "./FortyTwoAuthButton";
import Separator from "../../ui/Separator";
import useFetch from "../../hooks/useFetch";
import { useAuth } from "../../contexts/useAuth";

export default function RegisterForm({
		isOpen = false,
		onClose
	}: {
		isOpen: boolean,
		onClose: () => void
	}) {


	const {ft_fetch, isLoading} = useFetch();
	const {auth} = useAuth();

	const handleSubmit = async (fields, clear) => {
		const { 'register-email': email, 'register-password': password } = fields;

		const response = await ft_fetch(`${config.API_URL}/register`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email: email.value, password: password.value })
			}, {
				show_error: true,
				error_messages: {
					409: 'Email already in use',
					400: 'Invalid email'
				}
			}
		);
		if (response) {
			const { access_token, expire_at } = response;
			clear();
			onClose();
			auth(access_token, expire_at);
		}
	}

	return <Form
		className="gap-0"
		formFields={['register-email*', 'register-password*', 'register-confirm-password*']}
	>
		<div
			className={`auth-card-form flex flex-col gap-4 ${isOpen ? 'open' : 'closed'}`}
		>
			<GoogleAuthButton />
			<FortyTwoAuthButton isOpen={isOpen}/>
			<Separator>or</Separator>
			<h1>Create a new account</h1>
			<Input
				label="Email"
				type="email"
				required
				field="register-email"
				help="Your email is used to log in to the game and manage your account."
				pattern={config.EMAIL_REGEX}
				/>
			<Input
				label="Password"
				type="password"
				pattern={config.PASSWORD_REGEX}
				required
				field="register-password"
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
				label="Confirm Password"
				type="password"
				pattern={config.PASSWORD_REGEX}
				required
				field="register-confirm-password"
				matching="register-password"
				help="Confirm password must match the password"
				/>
		</div>
		{
			isOpen &&
			<div className="flex items-center justify-between">
				<Submit
					loading={isLoading}
					fields={['register-email', 'register-password', 'register-confirm-password']}
					onSubmit={handleSubmit}
				>
					Register <i className="fa-solid fa-user-plus"></i>
				</Submit>
				<Button className='icon' onClick={onClose}>
					<i className="fa-solid fa-xmark"></i>
				</Button>
			</div>
		}

	</Form>

}