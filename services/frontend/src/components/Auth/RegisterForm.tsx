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

export default function RegisterForm({
		isOpen = false,
		onClose
	}: {
		isOpen: boolean,
		onClose: () => void
	}) {

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
				<Submit fields={['register-email', 'register-password', 'register-confirm-password', 'register-terms']}>
					Register <i className="fa-solid fa-user-plus"></i>
				</Submit>
				<Button className='icon' onClick={onClose}>
					<i className="fa-solid fa-xmark"></i>
				</Button>
			</div>
		}

	</Form>

}