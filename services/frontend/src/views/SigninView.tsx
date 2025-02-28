import Babact from "babact";
import { Link } from "babact-router-dom";

export default function Signin() {
	return <div>
		<h1 class="bg-red-100">Signin</h1>
		<form>
			<input type="text" placeholder="Username" />
			<input type="password" placeholder="Password" />
			<button type="submit">Signin</button>
		</form>
		<Link to="/login">Login</Link>
	</div>
}