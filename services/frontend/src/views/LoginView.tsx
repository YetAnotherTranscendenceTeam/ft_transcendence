import Babact from "babact"
import { Link } from "babact-router-dom"

export default function Login() {
	return <div>
		<h1 className="text-3xl font-bold underline text-red-500" id="login">
			Hello world!
		</h1>
		<form>
			<input type="text" placeholder="Username" />
			<input type="password" placeholder="Password" />
			<button type="submit">Login</button>
		</form>
		<Link to="/signin">Sign in</Link>
	</div>
}