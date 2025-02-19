import Babact from "babact";
import Input from "../../ui/Input";
import config from "../../config";

export default function RegisterForm() {

	return <div className={`auth-card-form flex flex-col gap-2`}>
			<Input
				label="Email"
				type="email"
				errorMsg="Invalid Email"
				required
				fieldName="register-email"
			/>
			<Input
				label="Password"
				type="password"
				pattern={config.PASSWORD_REGEX}
				required
				errorMsg="Invalid Password"
				fieldName="register-password"
			/>
			<Input
				label="Confirm Password"
				type="password"
				pattern={config.PASSWORD_REGEX}
				required
				errorMsg="Invalid Password"
				fieldName="register-confirm-password"
			/>
	</div>	
}