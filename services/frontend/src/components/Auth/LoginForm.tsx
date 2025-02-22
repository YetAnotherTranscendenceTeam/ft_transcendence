import Babact from "babact";
import Input from "../../ui/Input";
import config from "../../config";
import { Form } from "../../contexts/useForm";
import GoogleAuthButton from "./GoogleAuthButton";
import FortyTwoAuthButton from "./FortyTwoAuthButton";
import Separator from "../../ui/Separator";
import Submit from "../../ui/Submit";
import Button from "../../ui/Button";

export default function LoginForm({
		isOpen = false,
		onClose,
	}: {
		isOpen: boolean,
		onClose: () => void
	}) {

	return <Form formFields={['login-email*', 'login-password*']} className="gap-0">
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
					field="login-email"
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
					<Submit fields={['login-email', 'login-password']}>
						Login <i className="fa-solid fa-arrow-right-to-bracket"></i>
					</Submit>
					<Button className="icon" onClick={onClose}>
						<i className="fa-solid fa-xmark"></i>
					</Button>
				</div>
			}
	</Form>
}