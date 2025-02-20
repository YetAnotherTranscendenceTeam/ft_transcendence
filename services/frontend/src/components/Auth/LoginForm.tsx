import Babact from "babact";
import Input from "../../ui/Input";
import config from "../../config";

export default function LoginForm() {

	return <div className={`auth-card-form flex flex-col gap-2`}>
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
}