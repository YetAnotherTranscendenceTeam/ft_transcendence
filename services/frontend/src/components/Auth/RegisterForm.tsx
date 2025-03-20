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
		formFields={['register-email*', 'register-password*', 'register-confirm-password*', 'register-terms*']}
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
				error="Invalid Email"
				required
				field="register-email"	
				/>
			<Input
				label="Password"
				type="password"
				pattern={config.PASSWORD_REGEX}
				required
				error="Invalid Password"
				field="register-password"
				/>
			<Input
				label="Confirm Password"
				type="password"
				pattern={config.PASSWORD_REGEX}
				required
				error="Invalid Password"
				field="register-confirm-password"
				matching="register-password"
				/>
			<Checkbox
				label="I agree to the terms and conditions"
				field="register-terms"
				required
				/>
		</div>
		{
			isOpen &&
			<div className="flex items-center justify-between">
				<Submit
					loading={isLoading}
					fields={['register-email', 'register-password', 'register-confirm-password', 'register-terms']}
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