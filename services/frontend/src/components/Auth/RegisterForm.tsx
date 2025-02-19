import Babact from "babact";
import Input from "../../ui/Input";

export default function RegisterForm() {

	return <div className={`auth-card-form flex flex-col gap-2`}>
			<Input
				label="Email"
				type="email"
				errorMsg="Invalid Email"
				required
				fieldName="register-email"
				// onValid={(value) => setField('login-email', value)}
				// onInvalid={() => deleteField('login-email')}
			/>
			<Input
				label="Password"
				type="password"
				pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
				required
				errorMsg="Invalid Password"
				fieldName="register-password"
				// onValid={(value) => setField('login-password', value)}
				// onInvalid={() => deleteField('login-password')}
			/>
			<Input
				label="Confirm Password"
				type="password"
				pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
				required
				errorMsg="Invalid Password"
				fieldName="register-confirm-password"
				// onValid={(value) => setField('login-password', value)}
				// onInvalid={() => deleteField('login-password')}
			/>
	</div>	
}