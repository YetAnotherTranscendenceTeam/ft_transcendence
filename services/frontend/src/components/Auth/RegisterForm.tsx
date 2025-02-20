import Babact from "babact";
import Input from "../../ui/Input";
import config from "../../config";
import Checkbox from "../../ui/Checkbox";

export default function RegisterForm() {
	
	return <div className={`auth-card-form flex flex-col gap-2`}>
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
}